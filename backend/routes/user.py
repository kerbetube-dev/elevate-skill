from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models import (
    PaymentMethodCreate, 
    PaymentMethodResponse, 
    EnrollmentResponse,
    DashboardStats
)
from auth import get_current_user, create_user_response
from database.operations import db_ops

router = APIRouter(prefix="/user", tags=["User"])

@router.get("/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get user profile with enrolled courses"""
    # Get user enrollments
    user_enrollments = await db_ops.get_user_enrollments(current_user["id"])
    
    # Get enrolled courses with progress
    enrolled_courses = []
    for enrollment in user_enrollments:
        course = await db_ops.get_course_by_id(enrollment.get("course_id"))
        if course:
            enrolled_courses.append({
                **course,
                "progress": enrollment.get("progress", 0),
                "enrolledAt": enrollment["enrolledAt"],
                "status": enrollment["status"]
            })
    
    # Calculate stats
    completed_courses = len([c for c in enrolled_courses if c.get("progress", 0) >= 100])
    
    # Get user's current earnings from database
    user_profile = await db_ops.get_user_by_id(current_user["id"])
    total_earnings = user_profile.get("total_earnings", 0) if user_profile else 0
    
    return {
        "user": create_user_response(current_user),
        "enrolledCourses": enrolled_courses,
        "stats": {
            "coursesEnrolled": len(enrolled_courses),
            "hoursLearned": len(enrolled_courses) * 24,  # Estimated
            "certificates": completed_courses,
            "currentStreak": 7,  # Mock data
            "totalEarnings": total_earnings
        }
    }

@router.get("/payment-methods", response_model=List[PaymentMethodResponse])
async def get_payment_methods(current_user: dict = Depends(get_current_user)):
    """Get user's payment methods"""
    methods = await db_ops.get_user_payment_methods(current_user["id"])
    return methods

@router.post("/payment-methods", response_model=PaymentMethodResponse)
async def add_payment_method(
    payment_method: PaymentMethodCreate,
    current_user: dict = Depends(get_current_user)
):
    """Add a new payment method"""
    method_data = {
        "type": payment_method.type,
        "account_number": payment_method.account_number,
        "holder_name": payment_method.holderName
    }
    
    new_method = await db_ops.create_payment_method(current_user["id"], method_data)
    
    return new_method

@router.delete("/payment-methods/{method_id}")
async def remove_payment_method(
    method_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove a payment method"""
    success = await db_ops.delete_payment_method(current_user["id"], method_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    
    return {"message": "Payment method removed successfully"}

@router.put("/payment-methods/{method_id}/default")
async def set_default_payment_method(
    method_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Set a payment method as default"""
    success = await db_ops.set_default_payment_method(current_user["id"], method_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment method not found"
        )
    
    return {"message": "Default payment method updated"}

@router.get("/enrollments", response_model=List[EnrollmentResponse])
async def get_user_enrollments(current_user: dict = Depends(get_current_user)):
    """Get user's course enrollments"""
    enrollments = await db_ops.get_user_enrollments(current_user["id"])
    
    # Add course details to each enrollment
    for enrollment in enrollments:
        course = await db_ops.get_course_by_id(enrollment.get("course_id"))
        if course:
            enrollment["course"] = course
    
    return enrollments

@router.put("/enrollments/{enrollment_id}/progress")
async def update_enrollment_progress(
    enrollment_id: str,
    progress: int,
    current_user: dict = Depends(get_current_user)
):
    """Update course progress"""
    if not 0 <= progress <= 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Progress must be between 0 and 100"
        )
    
    updated_enrollment = await db_ops.update_enrollment_progress(
        current_user["id"], 
        enrollment_id, 
        progress
    )
    
    if not updated_enrollment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Enrollment not found"
        )
    
    return {
        "message": "Progress updated successfully",
        "enrollment": updated_enrollment
    }

@router.get("/referrals")
async def get_referrals(current_user: dict = Depends(get_current_user)):
    """Get user's referral information"""
    user_referrals = await db_ops.get_user_referrals(current_user["id"])
    
    return {
        "referralCode": current_user["referralCode"],
        "totalEarnings": current_user.get("totalEarnings", 0),
        "referrals": user_referrals,
        "stats": {
            "totalEarnings": current_user.get("totalEarnings", 0),
            "successfulReferrals": len([r for r in user_referrals if r["status"] == "completed"]),
            "rewardPerReferral": 100
        }
    }