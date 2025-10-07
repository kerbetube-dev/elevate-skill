"""
Secure authentication utilities for the ElevateSkill API
Provides enhanced security measures for user authentication
"""

import jwt
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status, Request
from passlib.context import CryptContext
import logging

from security import password_validator, login_tracker, input_sanitizer
from exceptions import create_authentication_error, create_authorization_error

logger = logging.getLogger(__name__)

# JWT Configuration
JWT_SECRET_KEY = "your-secret-key-change-in-production"  # Should be from environment
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30  # 30 days for better user experience
REFRESH_TOKEN_EXPIRE_DAYS = 90  # 90 days for long-term sessions

# Password hashing - use SHA256 for now due to bcrypt compatibility issues
import hashlib

class SecureAuth:
    """Secure authentication utilities"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using SHA256 with salt"""
        # Add salt for better security
        salt = "elevate_skill_salt_2024"
        salted_password = password + salt
        return hashlib.sha256(salted_password.encode()).hexdigest()
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        # Hash the plain password with salt and compare
        salt = "elevate_skill_salt_2024"
        salted_password = plain_password + salt
        return hashlib.sha256(salted_password.encode()).hexdigest() == hashed_password
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({"exp": expire, "type": "access"})
        
        return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    @staticmethod
    def create_refresh_token(data: Dict[str, Any]) -> str:
        """Create JWT refresh token"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({"exp": expire, "type": "refresh"})
        
        return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    
    @staticmethod
    def verify_token(token: str, token_type: str = "access") -> Dict[str, Any]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
            
            # Check token type
            if payload.get("type") != token_type:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    
    @staticmethod
    def validate_password_security(password: str) -> tuple[bool, list[str]]:
        """Validate password meets security requirements"""
        return password_validator.validate_password_strength(password)
    
    @staticmethod
    def sanitize_user_input(data: Dict[str, Any]) -> Dict[str, Any]:
        """Sanitize user input data"""
        sanitized = {}
        
        for key, value in data.items():
            if isinstance(value, str):
                if key == "email":
                    sanitized[key] = input_sanitizer.sanitize_email(value)
                elif key == "phone":
                    sanitized[key] = input_sanitizer.sanitize_phone(value)
                elif key in ["fullName", "name", "firstName", "lastName"]:
                    sanitized[key] = input_sanitizer.sanitize_name(value)
                else:
                    sanitized[key] = input_sanitizer.sanitize_string(value)
            else:
                sanitized[key] = value
        
        return sanitized
    
    @staticmethod
    def check_login_attempts(identifier: str) -> tuple[bool, int]:
        """Check if login attempts are allowed and return remaining time"""
        if login_tracker.is_locked(identifier):
            remaining_time = login_tracker.get_lockout_time_remaining(identifier)
            return False, remaining_time
        
        return True, 0
    
    @staticmethod
    def record_login_attempt(identifier: str, success: bool) -> bool:
        """Record login attempt and return if successful"""
        return login_tracker.record_attempt(identifier, success)
    
    @staticmethod
    def generate_secure_referral_code() -> str:
        """Generate a secure referral code"""
        return password_validator.generate_secure_token(8).upper()
    
    @staticmethod
    def generate_api_key() -> str:
        """Generate a secure API key"""
        return password_validator.generate_secure_token(32)
    
    @staticmethod
    def hash_sensitive_data(data: str) -> str:
        """Hash sensitive data for storage"""
        return hashlib.sha256(data.encode()).hexdigest()


class SecurityHeaders:
    """Security headers for responses"""
    
    @staticmethod
    def get_security_headers() -> Dict[str, str]:
        """Get security headers for responses"""
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
            'Content-Security-Policy': (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; "
                "font-src 'self' data:; "
                "connect-src 'self'; "
                "frame-ancestors 'none';"
            )
        }


class RequestValidator:
    """Request validation utilities"""
    
    @staticmethod
    def validate_request_size(request: Request, max_size: int = 1024 * 1024) -> bool:
        """Validate request size"""
        content_length = request.headers.get('content-length')
        if content_length and int(content_length) > max_size:
            return False
        return True
    
    @staticmethod
    def validate_content_type(request: Request, allowed_types: list[str] = None) -> bool:
        """Validate content type"""
        if allowed_types is None:
            allowed_types = ['application/json', 'application/x-www-form-urlencoded']
        
        content_type = request.headers.get('content-type', '')
        return any(allowed_type in content_type for allowed_type in allowed_types)
    
    @staticmethod
    def validate_user_agent(request: Request) -> bool:
        """Validate user agent (basic bot detection)"""
        user_agent = request.headers.get('user-agent', '')
        
        # Block empty user agents
        if not user_agent:
            return False
        
        # Block suspicious user agents
        suspicious_patterns = [
            'bot', 'crawler', 'spider', 'scraper',
            'curl', 'wget', 'python-requests'
        ]
        
        user_agent_lower = user_agent.lower()
        for pattern in suspicious_patterns:
            if pattern in user_agent_lower:
                return False
        
        return True


class SessionManager:
    """Secure session management"""
    
    def __init__(self):
        self.active_sessions: Dict[str, Dict[str, Any]] = {}
    
    def create_session(self, user_id: str, user_data: Dict[str, Any]) -> str:
        """Create a new session"""
        session_id = password_validator.generate_secure_token(32)
        
        self.active_sessions[session_id] = {
            'user_id': user_id,
            'user_data': user_data,
            'created_at': datetime.utcnow(),
            'last_activity': datetime.utcnow(),
            'ip_address': None,  # Will be set by middleware
            'user_agent': None  # Will be set by middleware
        }
        
        return session_id
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data"""
        if session_id not in self.active_sessions:
            return None
        
        session = self.active_sessions[session_id]
        
        # Check if session has expired
        if datetime.utcnow() - session['last_activity'] > timedelta(hours=24):
            del self.active_sessions[session_id]
            return None
        
        # Update last activity
        session['last_activity'] = datetime.utcnow()
        
        return session
    
    def invalidate_session(self, session_id: str) -> bool:
        """Invalidate a session"""
        if session_id in self.active_sessions:
            del self.active_sessions[session_id]
            return True
        return False
    
    def cleanup_expired_sessions(self):
        """Clean up expired sessions"""
        current_time = datetime.utcnow()
        expired_sessions = [
            session_id for session_id, session in self.active_sessions.items()
            if current_time - session['last_activity'] > timedelta(hours=24)
        ]
        
        for session_id in expired_sessions:
            del self.active_sessions[session_id]
        
        return len(expired_sessions)


# Global instances
secure_auth = SecureAuth()
request_validator = RequestValidator()
session_manager = SessionManager()
