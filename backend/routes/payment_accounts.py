"""
Payment Accounts Management Routes
Admin can manage payment accounts (CBE, TeleBirr, etc.)
Users can view active payment accounts
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models import (
    AdminPaymentAccountCreate,
    AdminPaymentAccountUpdate,
    AdminPaymentAccountResponse
)
from auth import get_current_user
from database.operations import db_ops

router = APIRouter(prefix="/payment-accounts", tags=["Payment Accounts"])


@router.get("/", response_model=List[AdminPaymentAccountResponse])
async def get_payment_accounts(
    active_only: bool = True,
    current_user: dict = Depends(get_current_user)
):
    """
    Get all payment accounts (users see only active ones)
    """
    try:
        accounts = await db_ops.get_payment_accounts(active_only=active_only)
        return accounts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch payment accounts: {str(e)}"
        )


@router.get("/{account_id}", response_model=AdminPaymentAccountResponse)
async def get_payment_account(
    account_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific payment account"""
    try:
        account = await db_ops.get_payment_account_by_id(account_id)
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment account not found"
            )
        return account
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch payment account: {str(e)}"
        )


@router.post("/", response_model=AdminPaymentAccountResponse, status_code=status.HTTP_201_CREATED)
async def create_payment_account(
    account: AdminPaymentAccountCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new payment account (Admin only)
    """
    # Check if user is admin
    if current_user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can create payment accounts"
        )
    
    try:
        new_account = await db_ops.create_payment_account(account.dict())
        return new_account
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment account: {str(e)}"
        )


@router.put("/{account_id}", response_model=AdminPaymentAccountResponse)
async def update_payment_account(
    account_id: str,
    account: AdminPaymentAccountUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a payment account (Admin only)
    """
    # Check if user is admin
    if current_user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can update payment accounts"
        )
    
    try:
        # Filter out None values
        update_data = {k: v for k, v in account.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No data to update"
            )
        
        updated_account = await db_ops.update_payment_account(account_id, update_data)
        if not updated_account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment account not found"
            )
        return updated_account
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update payment account: {str(e)}"
        )


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_payment_account(
    account_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a payment account (Admin only)
    """
    # Check if user is admin
    if current_user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete payment accounts"
        )
    
    try:
        success = await db_ops.delete_payment_account(account_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment account not found"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete payment account: {str(e)}"
        )

