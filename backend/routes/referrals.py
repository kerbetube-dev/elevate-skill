from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from models import ReferralStatsResponse, ReferralResponse, ReferralEarningResponse, ReferralCreateRequest
from auth import get_current_user
from database.operations import db_ops
from datetime import datetime

router = APIRouter(prefix="/referrals", tags=["Referrals"])

@router.get("/stats", response_model=ReferralStatsResponse)
async def get_referral_stats(current_user: dict = Depends(get_current_user)):
    """Get user's referral statistics"""
    try:
        stats = await db_ops.get_referral_stats(current_user["id"])
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch referral stats: {str(e)}"
        )

@router.get("/my", response_model=List[ReferralResponse])
async def get_my_referrals(current_user: dict = Depends(get_current_user)):
    """Get user's referrals"""
    try:
        referrals = await db_ops.get_user_referrals(current_user["id"])
        return referrals
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch referrals: {str(e)}"
        )

@router.get("/earnings", response_model=List[ReferralEarningResponse])
async def get_referral_earnings(current_user: dict = Depends(get_current_user)):
    """Get user's referral earnings"""
    try:
        earnings = await db_ops.get_referral_earnings(current_user["id"])
        return earnings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch referral earnings: {str(e)}"
        )

@router.get("/code")
async def get_referral_code(current_user: dict = Depends(get_current_user)):
    """Get user's referral code"""
    try:
        referral_code = await db_ops.get_user_referral_code(current_user["id"])
        return {"referralCode": referral_code}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch referral code: {str(e)}"
        )

@router.post("/")
async def create_referral(
    referral_data: ReferralCreateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a referral"""
    try:
        success = await db_ops.create_referral(current_user["id"], {
            "email": referral_data.email,
            "name": referral_data.email.split('@')[0]  # Use email prefix as name
        })
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create referral"
            )
        return {"message": "Referral created successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create referral: {str(e)}"
        )
