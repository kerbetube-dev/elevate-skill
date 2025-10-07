"""
Advanced JWT Token Management System
Provides comprehensive token handling with refresh capabilities
"""

import jwt
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple
from fastapi import HTTPException, status
import logging

from secure_auth import JWT_SECRET_KEY, JWT_ALGORITHM, ACCESS_TOKEN_EXPIRE_DAYS, REFRESH_TOKEN_EXPIRE_DAYS

logger = logging.getLogger(__name__)

class TokenManager:
    """Advanced token management with refresh capabilities"""
    
    def __init__(self):
        self.refresh_tokens: Dict[str, Dict[str, Any]] = {}  # In production, use Redis
    
    def create_token_pair(self, user_data: Dict[str, Any]) -> Tuple[str, str, Dict[str, Any]]:
        """
        Create both access and refresh tokens
        
        Returns:
            Tuple[access_token, refresh_token, token_info]
        """
        user_id = user_data.get('id')
        email = user_data.get('email')
        
        # Create access token
        access_token_data = {
            'sub': email,
            'user_id': user_id,
            'role': user_data.get('role', 'student'),
            'permissions': user_data.get('permissions', []),
            'iat': datetime.utcnow()
        }
        
        access_token = self._create_access_token(access_token_data)
        
        # Create refresh token
        refresh_token_id = secrets.token_urlsafe(32)
        refresh_token_data = {
            'sub': email,
            'user_id': user_id,
            'token_id': refresh_token_id,
            'iat': datetime.utcnow()
        }
        
        refresh_token = self._create_refresh_token(refresh_token_data)
        
        # Store refresh token info
        self.refresh_tokens[refresh_token_id] = {
            'user_id': user_id,
            'email': email,
            'created_at': datetime.utcnow(),
            'last_used': datetime.utcnow(),
            'is_revoked': False
        }
        
        # Token info for client
        token_info = {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'bearer',
            'expires_in': ACCESS_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,  # seconds
            'refresh_expires_in': REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,  # seconds
            'expires_at': (datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)).isoformat(),
            'refresh_expires_at': (datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)).isoformat()
        }
        
        return access_token, refresh_token, token_info
    
    def refresh_access_token(self, refresh_token: str) -> Tuple[str, Dict[str, Any]]:
        """
        Create new access token using refresh token
        
        Returns:
            Tuple[new_access_token, token_info]
        """
        try:
            # Verify refresh token
            payload = jwt.decode(refresh_token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            
            if payload.get('type') != 'refresh':
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            
            token_id = payload.get('token_id')
            if not token_id or token_id not in self.refresh_tokens:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid refresh token"
                )
            
            # Check if token is revoked
            token_info = self.refresh_tokens[token_id]
            if token_info['is_revoked']:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Refresh token has been revoked"
                )
            
            # Update last used time
            token_info['last_used'] = datetime.utcnow()
            
            # Create new access token
            access_token_data = {
                'sub': payload['sub'],
                'user_id': payload['user_id'],
                'role': payload.get('role', 'student'),
                'permissions': payload.get('permissions', []),
                'iat': datetime.utcnow()
            }
            
            new_access_token = self._create_access_token(access_token_data)
            
            # Token info for client
            token_info_response = {
                'access_token': new_access_token,
                'token_type': 'bearer',
                'expires_in': ACCESS_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,  # seconds
                'expires_at': (datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)).isoformat()
            }
            
            return new_access_token, token_info_response
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has expired"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
    
    def revoke_refresh_token(self, refresh_token: str) -> bool:
        """Revoke a refresh token"""
        try:
            payload = jwt.decode(refresh_token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            token_id = payload.get('token_id')
            
            if token_id and token_id in self.refresh_tokens:
                self.refresh_tokens[token_id]['is_revoked'] = True
                return True
            
            return False
            
        except jwt.JWTError:
            return False
    
    def revoke_all_user_tokens(self, user_id: str) -> int:
        """Revoke all refresh tokens for a user"""
        revoked_count = 0
        
        for token_id, token_info in self.refresh_tokens.items():
            if token_info['user_id'] == user_id and not token_info['is_revoked']:
                token_info['is_revoked'] = True
                revoked_count += 1
        
        return revoked_count
    
    def cleanup_expired_tokens(self) -> int:
        """Clean up expired refresh tokens"""
        current_time = datetime.utcnow()
        expired_tokens = []
        
        for token_id, token_info in self.refresh_tokens.items():
            # Check if token is older than refresh token expiry
            if (current_time - token_info['created_at']).days > REFRESH_TOKEN_EXPIRE_DAYS:
                expired_tokens.append(token_id)
        
        for token_id in expired_tokens:
            del self.refresh_tokens[token_id]
        
        return len(expired_tokens)
    
    def get_user_active_tokens(self, user_id: str) -> list:
        """Get all active tokens for a user"""
        active_tokens = []
        
        for token_id, token_info in self.refresh_tokens.items():
            if (token_info['user_id'] == user_id and 
                not token_info['is_revoked'] and
                (datetime.utcnow() - token_info['created_at']).days <= REFRESH_TOKEN_EXPIRE_DAYS):
                active_tokens.append({
                    'token_id': token_id,
                    'created_at': token_info['created_at'].isoformat(),
                    'last_used': token_info['last_used'].isoformat()
                })
        
        return active_tokens
    
    def _create_access_token(self, data: Dict[str, Any]) -> str:
        """Create access token"""
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
        data.update({"exp": expire, "type": "access"})
        return jwt.encode(data, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    def _create_refresh_token(self, data: Dict[str, Any]) -> str:
        """Create refresh token"""
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        data.update({"exp": expire, "type": "refresh"})
        return jwt.encode(data, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    def verify_access_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode access token"""
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            
            if payload.get('type') != 'access':
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Access token has expired"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid access token"
            )
    
    def get_token_info(self, token: str) -> Dict[str, Any]:
        """Get information about a token without verifying it"""
        try:
            # Decode without verification to get payload
            payload = jwt.decode(token, options={"verify_signature": False})
            
            return {
                'type': payload.get('type'),
                'user_id': payload.get('user_id'),
                'email': payload.get('sub'),
                'role': payload.get('role'),
                'issued_at': datetime.fromtimestamp(payload.get('iat', 0)).isoformat(),
                'expires_at': datetime.fromtimestamp(payload.get('exp', 0)).isoformat(),
                'is_expired': datetime.utcnow().timestamp() > payload.get('exp', 0)
            }
        except jwt.JWTError:
            return {'error': 'Invalid token format'}


# Global token manager instance
token_manager = TokenManager()
