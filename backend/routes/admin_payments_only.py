# Complete admin.py file - Payment requests section only
# This is the relevant section for the UUID issue

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from models import PaymentRequestResponse, PaymentApprovalRequest, PaymentStatus
from database.operations import DatabaseOperations
from auth import get_current_user

router = APIRouter(prefix="/admin", tags=["admin"])
db_ops = DatabaseOperations()

def get_current_admin(current_user: dict = Depends(get_current_user)):
    """Get current admin user"""
    if current_user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    return current_user

@router.get("/payments", response_model=List[PaymentRequestResponse])
async def get_payment_requests(
    status: str = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Get all payment requests"""
    requests = await db_ops.get_payment_requests(status)
    
    print(f"DEBUG: Received {len(requests)} payment requests from database")
    for i, req in enumerate(requests):
        print(f"DEBUG: Request {i}: approved_by = {req.get('approved_by')} (type: {type(req.get('approved_by'))})")
    
    # Convert to response format
    response = []
    for req in requests:
        # Ensure approved_by is converted to string
        approved_by = None
        if req.get("approved_by") is not None:
            try:
                approved_by = str(req["approved_by"])
            except Exception as e:
                print(f"Warning: Failed to convert approved_by: {e}")
                approved_by = None
        
        response.append({
            "id": req["id"],
            "userId": req["user_id"],
            "courseId": req["course_id"],
            "paymentMethodId": req["payment_method_id"],
            "amount": float(req["amount"]),
            "status": req["status"],
            "adminNotes": req.get("admin_notes"),
            "createdAt": req["created_at"],
            "approvedAt": req["approved_at"] if req["approved_at"] else None,
            "approvedBy": approved_by,
            "rejectionReason": req.get("rejection_reason"),
            # Additional info
            "userName": req["full_name"],
            "userEmail": req["email"],
            "courseTitle": req["course_title"],
            "paymentType": req["payment_type"],
            "accountNumber": req["account_number"]
        })
    
    return response
