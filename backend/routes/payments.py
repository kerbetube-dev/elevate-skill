"""
Payment and Enrollment Routes
Handles:
- Payment request submission (with transaction screenshot)
- Payment approval/rejection
- Automatic enrollment upon approval
- Referral bonus distribution
"""

from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from typing import List, Optional
from models import (
    PaymentRequestCreate,
    PaymentRequestResponse,
    EnrollmentResponse,
    PaymentApprovalRequest
)
from auth import get_current_user
from database.operations import db_ops
import uuid
from pathlib import Path
import shutil

router = APIRouter(prefix="/payments", tags=["Payments"])

# Configure upload directory
UPLOAD_DIR = Path("uploads/transaction_screenshots")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("/upload-screenshot")
async def upload_transaction_screenshot(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload transaction screenshot
    Returns the file URL to be used in payment request
    """
    try:
        # Validate file type
        allowed_extensions = {".jpg", ".jpeg", ".png", ".pdf"}
        file_extension = Path(file.filename).suffix.lower()
        
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
            )
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return relative URL
        file_url = f"/uploads/transaction_screenshots/{unique_filename}"
        
        return {
            "url": file_url,
            "filename": unique_filename,
            "message": "File uploaded successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )


@router.post("/requests", response_model=PaymentRequestResponse, status_code=status.HTTP_201_CREATED)
async def create_payment_request(
    payment_request: PaymentRequestCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a payment request after user pays and uploads screenshot
    """
    try:
        # Validate course exists
        course = await db_ops.get_course_by_id(payment_request.courseId)
        if not course:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Course not found"
            )
        
        # Validate payment account exists
        payment_account = await db_ops.get_payment_account_by_id(payment_request.paymentAccountId)
        if not payment_account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment account not found"
            )
        
        # Check if user already has a pending/approved payment for this course
        existing_payment = await db_ops.get_user_payment_for_course(
            current_user["id"],
            payment_request.courseId
        )
        if existing_payment and existing_payment["status"] in ["pending", "approved"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"You already have a {existing_payment['status']} payment request for this course"
            )
        
        # Create payment request
        new_payment = await db_ops.create_payment_request({
            "user_id": current_user["id"],
            "course_id": payment_request.courseId,
            "payment_account_id": payment_request.paymentAccountId,
            "amount": payment_request.amount,
            "transaction_screenshot_url": payment_request.transactionScreenshotUrl,
            "transaction_reference": payment_request.transactionReference,
            "status": "pending"
        })
        
        return new_payment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment request: {str(e)}"
        )


@router.get("/requests/my", response_model=List[PaymentRequestResponse])
async def get_my_payment_requests(
    current_user: dict = Depends(get_current_user)
):
    """Get all payment requests for the current user"""
    try:
        payments = await db_ops.get_user_payment_requests(current_user["id"])
        return payments
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch payment requests: {str(e)}"
        )


@router.get("/requests/{request_id}", response_model=PaymentRequestResponse)
async def get_payment_request(
    request_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific payment request"""
    try:
        payment = await db_ops.get_payment_request_by_id(request_id)
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment request not found"
            )
        
        # Check if user owns this payment or is admin
        if payment["userId"] != current_user["id"] and current_user.get("role") not in ["admin", "super_admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to view this payment request"
            )
        
        return payment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch payment request: {str(e)}"
        )


@router.post("/requests/{request_id}/approve")
async def approve_payment_request(
    request_id: str,
    approval: PaymentApprovalRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Approve a payment request (Admin only)
    Automatically enrolls user in course and distributes referral bonus
    """
    # Check if user is admin
    if current_user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can approve payments"
        )
    
    try:
        result = await db_ops.approve_payment_and_enroll(
            request_id=request_id,
            admin_id=current_user["id"],
            admin_notes=approval.adminNotes
        )
        
        return {
            "message": "Payment approved and user enrolled successfully",
            "enrollment_id": result["enrollment_id"],
            "referral_bonus_awarded": result.get("referral_bonus_awarded", False),
            "referral_amount": result.get("referral_amount", 0)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve payment: {str(e)}"
        )


@router.post("/requests/{request_id}/reject")
async def reject_payment_request(
    request_id: str,
    rejection: PaymentApprovalRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Reject a payment request (Admin only)
    """
    # Check if user is admin
    if current_user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can reject payments"
        )
    
    if not rejection.rejectionReason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rejection reason is required"
        )
    
    try:
        await db_ops.reject_payment_request(
            request_id=request_id,
            admin_id=current_user["id"],
            rejection_reason=rejection.rejectionReason
        )
        
        return {"message": "Payment request rejected successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject payment: {str(e)}"
        )


@router.get("/enrollments/my", response_model=List[EnrollmentResponse])
async def get_my_enrollments(
    current_user: dict = Depends(get_current_user)
):
    """Get all enrollments (My Courses) for the current user"""
    try:
        enrollments = await db_ops.get_user_enrollments(current_user["id"])
        return enrollments
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch enrollments: {str(e)}"
        )


@router.get("/enrollments/{course_id}/check")
async def check_enrollment(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Check if user is enrolled in a course"""
    try:
        is_enrolled = await db_ops.is_user_enrolled(current_user["id"], course_id)
        return {"enrolled": is_enrolled}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check enrollment: {str(e)}"
        )

