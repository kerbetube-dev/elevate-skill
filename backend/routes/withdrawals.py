from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models import WithdrawalRequest, WithdrawalResponse
from auth import get_current_user
from routes.admin import get_current_admin
from database.operations import db_ops

router = APIRouter(prefix="/withdrawals", tags=["Withdrawals"])

@router.post("/", response_model=WithdrawalResponse)
async def create_withdrawal_request(
    withdrawal_data: WithdrawalRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a withdrawal request"""
    try:
        # Validate minimum amount
        if withdrawal_data.amount < 300:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Minimum withdrawal amount is 300 ETB"
            )
        
        # Get user's current earnings
        user_profile = await db_ops.get_user_by_id(current_user["id"])
        if not user_profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        current_earnings = float(user_profile.get("total_earnings", 0))
        
        # Check if user has enough earnings
        if current_earnings < withdrawal_data.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient earnings. Available: {current_earnings} ETB, Requested: {withdrawal_data.amount} ETB"
            )
        
        # Create withdrawal request
        withdrawal = await db_ops.create_withdrawal_request(
            current_user["id"], 
            withdrawal_data.dict()
        )
        
        if not withdrawal:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create withdrawal request"
            )
        
        # Map database fields to API response fields
        mapped_withdrawal = {
            "id": withdrawal["id"],
            "userId": withdrawal["user_id"],
            "amount": withdrawal["amount"],
            "accountType": withdrawal["account_type"],
            "accountNumber": withdrawal["account_number"],
            "accountHolderName": withdrawal["account_holder_name"],
            "phoneNumber": withdrawal.get("phone_number"),
            "status": withdrawal["status"],
            "adminNotes": withdrawal.get("admin_notes"),
            "rejectionReason": withdrawal.get("rejection_reason"),
            "createdAt": withdrawal["created_at"],
            "processedAt": withdrawal.get("processed_at"),
            "processedBy": withdrawal.get("processed_by")
        }
        
        return WithdrawalResponse(**mapped_withdrawal)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create withdrawal request: {str(e)}"
        )

@router.get("/my", response_model=List[WithdrawalResponse])
async def get_my_withdrawal_requests(
    current_user: dict = Depends(get_current_user)
):
    """Get user's withdrawal requests"""
    try:
        withdrawals = await db_ops.get_user_withdrawal_requests(current_user["id"])
        # Map database fields to API response fields
        mapped_withdrawals = []
        for withdrawal in withdrawals:
            mapped_withdrawal = {
                "id": withdrawal["id"],
                "userId": withdrawal["user_id"],
                "amount": withdrawal["amount"],
                "accountType": withdrawal["account_type"],
                "accountNumber": withdrawal["account_number"],
                "accountHolderName": withdrawal["account_holder_name"],
                "phoneNumber": withdrawal.get("phone_number"),
                "status": withdrawal["status"],
                "adminNotes": withdrawal.get("admin_notes"),
                "rejectionReason": withdrawal.get("rejection_reason"),
                "createdAt": withdrawal["created_at"],
                "processedAt": withdrawal.get("processed_at"),
                "processedBy": withdrawal.get("processed_by")
            }
            mapped_withdrawals.append(WithdrawalResponse(**mapped_withdrawal))
        return mapped_withdrawals
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch withdrawal requests: {str(e)}"
        )

@router.get("/", response_model=List[WithdrawalResponse])
async def get_all_withdrawal_requests(
    status: str = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Get all withdrawal requests (admin only)"""
    try:
        withdrawals = await db_ops.get_all_withdrawal_requests(status)
        # Map database fields to API response fields
        mapped_withdrawals = []
        for withdrawal in withdrawals:
            mapped_withdrawal = {
                "id": withdrawal["id"],
                "userId": withdrawal["user_id"],
                "amount": withdrawal["amount"],
                "accountType": withdrawal["account_type"],
                "accountNumber": withdrawal["account_number"],
                "accountHolderName": withdrawal["account_holder_name"],
                "phoneNumber": withdrawal.get("phone_number"),
                "status": withdrawal["status"],
                "adminNotes": withdrawal.get("admin_notes"),
                "rejectionReason": withdrawal.get("rejection_reason"),
                "createdAt": withdrawal["created_at"],
                "processedAt": withdrawal.get("processed_at"),
                "processedBy": withdrawal.get("processed_by")
            }
            mapped_withdrawals.append(WithdrawalResponse(**mapped_withdrawal))
        return mapped_withdrawals
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch withdrawal requests: {str(e)}"
        )

@router.post("/{withdrawal_id}/approve")
async def approve_withdrawal_request(
    withdrawal_id: str,
    admin_notes: str = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Approve a withdrawal request (admin only)"""
    try:
        success = await db_ops.approve_withdrawal_request(
            withdrawal_id, 
            current_admin["id"], 
            admin_notes
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to approve withdrawal request"
            )
        
        return {"message": "Withdrawal request approved successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve withdrawal request: {str(e)}"
        )

@router.post("/{withdrawal_id}/reject")
async def reject_withdrawal_request(
    withdrawal_id: str,
    rejection_reason: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Reject a withdrawal request (admin only)"""
    try:
        success = await db_ops.reject_withdrawal_request(
            withdrawal_id, 
            current_admin["id"], 
            rejection_reason
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to reject withdrawal request"
            )
        
        return {"message": "Withdrawal request rejected successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject withdrawal request: {str(e)}"
        )
