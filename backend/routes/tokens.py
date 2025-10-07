"""
Token management endpoints
Provides token refresh and management capabilities
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import Dict, Any
from pydantic import BaseModel

from token_manager import token_manager
from auth import get_current_user

router = APIRouter(prefix="/tokens", tags=["Token Management"])

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class TokenRefreshResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    expires_at: str

class TokenInfoResponse(BaseModel):
    type: str
    user_id: str
    email: str
    role: str
    issued_at: str
    expires_at: str
    is_expired: bool

@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_access_token(request: RefreshTokenRequest):
    """
    Refresh access token using refresh token
    
    This endpoint allows users to get a new access token without logging in again.
    The refresh token must be valid and not expired.
    """
    try:
        new_access_token, token_info = token_manager.refresh_access_token(request.refresh_token)
        
        return TokenRefreshResponse(
            access_token=new_access_token,
            token_type=token_info['token_type'],
            expires_in=token_info['expires_in'],
            expires_at=token_info['expires_at']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token refresh failed: {str(e)}"
        )

@router.post("/revoke")
async def revoke_refresh_token(
    request: RefreshTokenRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Revoke a refresh token
    
    This endpoint allows users to revoke a specific refresh token,
    effectively logging out from that device/session.
    """
    try:
        success = token_manager.revoke_refresh_token(request.refresh_token)
        
        if success:
            return {
                "success": True,
                "message": "Refresh token revoked successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or already revoked refresh token"
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token revocation failed: {str(e)}"
        )

@router.post("/revoke-all")
async def revoke_all_tokens(current_user: dict = Depends(get_current_user)):
    """
    Revoke all refresh tokens for the current user
    
    This endpoint logs out the user from all devices/sessions.
    """
    try:
        user_id = current_user.get('id')
        revoked_count = token_manager.revoke_all_user_tokens(user_id)
        
        return {
            "success": True,
            "message": f"Revoked {revoked_count} refresh tokens",
            "revoked_count": revoked_count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token revocation failed: {str(e)}"
        )

@router.get("/info")
async def get_token_info(
    token: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get information about a token
    
    This endpoint provides information about a token without verifying it.
    Useful for debugging and token inspection.
    """
    try:
        token_info = token_manager.get_token_info(token)
        
        return {
            "success": True,
            "data": token_info
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get token info: {str(e)}"
        )

@router.get("/active")
async def get_active_tokens(current_user: dict = Depends(get_current_user)):
    """
    Get all active tokens for the current user
    
    This endpoint shows all active refresh tokens for the user,
    allowing them to see which devices/sessions are logged in.
    """
    try:
        user_id = current_user.get('id')
        active_tokens = token_manager.get_user_active_tokens(user_id)
        
        return {
            "success": True,
            "data": active_tokens,
            "count": len(active_tokens)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get active tokens: {str(e)}"
        )

@router.post("/cleanup")
async def cleanup_expired_tokens(current_user: dict = Depends(get_current_user)):
    """
    Clean up expired tokens (admin function)
    
    This endpoint removes expired refresh tokens from the system.
    """
    try:
        cleaned_count = token_manager.cleanup_expired_tokens()
        
        return {
            "success": True,
            "message": f"Cleaned up {cleaned_count} expired tokens",
            "cleaned_count": cleaned_count
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Token cleanup failed: {str(e)}"
        )
