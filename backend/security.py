"""
Security utilities and middleware for the ElevateSkill API
Provides comprehensive security measures including rate limiting, input sanitization, and security headers
"""

import re
import time
import hashlib
import secrets
from typing import Dict, Optional, List, Tuple
from collections import defaultdict, deque
from datetime import datetime, timedelta
from fastapi import Request, HTTPException, status
from fastapi.responses import Response
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logger = logging.getLogger(__name__)

class SecurityConfig:
    """Security configuration settings"""
    
    # Rate limiting
    RATE_LIMIT_REQUESTS = 100  # requests per window
    RATE_LIMIT_WINDOW = 60     # seconds
    RATE_LIMIT_BURST = 10      # burst requests allowed
    
    # Password security
    MIN_PASSWORD_LENGTH = 8
    MAX_PASSWORD_LENGTH = 72  # bcrypt limit
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_NUMBERS = True
    REQUIRE_SPECIAL_CHARS = False  # Set to True for production
    
    # Session security
    SESSION_TIMEOUT = 24 * 60 * 60  # 24 hours in seconds
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION = 15 * 60  # 15 minutes in seconds
    
    # Input sanitization
    MAX_INPUT_LENGTH = 1000
    ALLOWED_HTML_TAGS = []  # No HTML allowed by default
    ALLOWED_SPECIAL_CHARS = r'[a-zA-Z0-9\s\-_@\.]'
    
    # Security headers
    SECURITY_HEADERS = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
        'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
    }


class RateLimiter:
    """Rate limiting implementation using sliding window algorithm"""
    
    def __init__(self):
        self.requests: Dict[str, deque] = defaultdict(deque)
        self.lockouts: Dict[str, float] = {}
    
    def is_allowed(self, client_ip: str) -> Tuple[bool, int]:
        """Check if request is allowed and return remaining requests"""
        current_time = time.time()
        
        # Check if IP is locked out
        if client_ip in self.lockouts:
            if current_time < self.lockouts[client_ip]:
                return False, 0
            else:
                del self.lockouts[client_ip]
        
        # Clean old requests outside the window
        window_start = current_time - SecurityConfig.RATE_LIMIT_WINDOW
        while self.requests[client_ip] and self.requests[client_ip][0] < window_start:
            self.requests[client_ip].popleft()
        
        # Check if under rate limit
        if len(self.requests[client_ip]) >= SecurityConfig.RATE_LIMIT_REQUESTS:
            # Check for burst allowance
            recent_requests = [req_time for req_time in self.requests[client_ip] 
                             if req_time > current_time - 10]  # Last 10 seconds
            if len(recent_requests) >= SecurityConfig.RATE_LIMIT_BURST:
                # Lock out the IP
                self.lockouts[client_ip] = current_time + SecurityConfig.LOCKOUT_DURATION
                return False, 0
            
            return False, 0
        
        # Add current request
        self.requests[client_ip].append(current_time)
        remaining = SecurityConfig.RATE_LIMIT_REQUESTS - len(self.requests[client_ip])
        
        return True, remaining


class InputSanitizer:
    """Input sanitization utilities"""
    
    @staticmethod
    def sanitize_string(input_str: str, max_length: int = SecurityConfig.MAX_INPUT_LENGTH) -> str:
        """Sanitize string input"""
        if not isinstance(input_str, str):
            return ""
        
        # Truncate to max length
        sanitized = input_str[:max_length]
        
        # Remove null bytes and control characters
        sanitized = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', sanitized)
        
        # Remove potentially dangerous characters
        sanitized = re.sub(r'[<>"\']', '', sanitized)
        
        return sanitized.strip()
    
    @staticmethod
    def sanitize_email(email: str) -> str:
        """Sanitize email input"""
        if not email:
            return ""
        
        # Basic email sanitization
        sanitized = email.strip().lower()
        
        # Remove dangerous characters
        sanitized = re.sub(r'[<>"\']', '', sanitized)
        
        # Validate email format
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', sanitized):
            raise ValueError("Invalid email format")
        
        return sanitized
    
    @staticmethod
    def sanitize_phone(phone: str) -> str:
        """Sanitize phone number input"""
        if not phone:
            return ""
        
        # Remove all non-digit characters except +
        sanitized = re.sub(r'[^\d+]', '', phone)
        
        # Validate phone format
        if not re.match(r'^[\+]?[1-9][\d]{0,15}$', sanitized):
            raise ValueError("Invalid phone number format")
        
        return sanitized
    
    @staticmethod
    def sanitize_name(name: str) -> str:
        """Sanitize name input"""
        if not name:
            return ""
        
        # Remove HTML tags and dangerous characters
        sanitized = re.sub(r'<[^>]*>', '', name)
        sanitized = re.sub(r'[<>"\']', '', sanitized)
        
        # Allow only letters, spaces, hyphens, and apostrophes
        sanitized = re.sub(r'[^a-zA-Z\s\-]', '', sanitized)
        
        # Normalize whitespace
        sanitized = re.sub(r'\s+', ' ', sanitized).strip()
        
        return sanitized


class PasswordValidator:
    """Password validation and security utilities"""
    
    @staticmethod
    def validate_password_strength(password: str) -> Tuple[bool, List[str]]:
        """Validate password strength and return issues"""
        issues = []
        
        if len(password) < SecurityConfig.MIN_PASSWORD_LENGTH:
            issues.append(f"Password must be at least {SecurityConfig.MIN_PASSWORD_LENGTH} characters long")
        
        if len(password) > SecurityConfig.MAX_PASSWORD_LENGTH:
            issues.append(f"Password must be no more than {SecurityConfig.MAX_PASSWORD_LENGTH} characters long")
        
        if SecurityConfig.REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
            issues.append("Password must contain at least one lowercase letter")
        
        if SecurityConfig.REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
            issues.append("Password must contain at least one uppercase letter")
        
        if SecurityConfig.REQUIRE_NUMBERS and not re.search(r'\d', password):
            issues.append("Password must contain at least one number")
        
        if SecurityConfig.REQUIRE_SPECIAL_CHARS and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            issues.append("Password must contain at least one special character")
        
        # Check for common weak patterns
        if re.search(r'(.)\1{2,}', password):
            issues.append("Password cannot contain more than 2 consecutive identical characters")
        
        # Removed common sequence check to allow more flexible passwords
        # if re.search(r'(123|abc|qwe|asd|zxc)', password.lower()):
        #     issues.append("Password cannot contain common sequences")
        
        return len(issues) == 0, issues
    
    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """Generate a cryptographically secure random token"""
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def hash_password(password: str, salt: Optional[str] = None) -> Tuple[str, str]:
        """Hash password with salt"""
        if salt is None:
            salt = secrets.token_hex(16)
        
        # Use PBKDF2 for password hashing
        password_hash = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
        return password_hash.hex(), salt


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers to all responses"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Add security headers
        for header, value in SecurityConfig.SECURITY_HEADERS.items():
            response.headers[header] = value
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware for rate limiting"""
    
    def __init__(self, app):
        super().__init__(app)
        self.rate_limiter = RateLimiter()
    
    async def dispatch(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host
        
        # Check rate limit
        allowed, remaining = self.rate_limiter.is_allowed(client_ip)
        
        if not allowed:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": True,
                    "message": "Rate limit exceeded. Please try again later.",
                    "error_code": "RATE_LIMIT_EXCEEDED",
                    "details": {
                        "retry_after": SecurityConfig.LOCKOUT_DURATION
                    }
                }
            )
        
        # Add rate limit headers
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(SecurityConfig.RATE_LIMIT_REQUESTS)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(int(time.time() + SecurityConfig.RATE_LIMIT_WINDOW))
        
        return response


class InputValidationMiddleware(BaseHTTPMiddleware):
    """Middleware for input validation and sanitization"""
    
    async def dispatch(self, request: Request, call_next):
        # Skip validation for file upload endpoints and multipart requests
        if (request.url.path in ['/payments/upload-screenshot'] or 
            request.headers.get('content-type', '').startswith('multipart/form-data')):
            return await call_next(request)
            
        # Only validate POST, PUT, PATCH requests
        if request.method in ['POST', 'PUT', 'PATCH']:
            try:
                # Get request body
                body = await request.body()
                if body:
                    # Basic validation - check for suspicious patterns
                    body_str = body.decode('utf-8', errors='ignore')
                    
                    # Check for SQL injection patterns
                    sql_patterns = [
                        r'union\s+select',
                        r'drop\s+table',
                        r'delete\s+from',
                        r'insert\s+into',
                        r'update\s+set',
                        r'--',
                        r'/\*.*\*/',
                        r'xp_',
                        r'sp_'
                    ]
                    
                    for pattern in sql_patterns:
                        if re.search(pattern, body_str, re.IGNORECASE):
                            logger.warning(f"Potential SQL injection attempt from IP: {request.client.host}")
                            raise HTTPException(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                detail={
                                    "error": True,
                                    "message": "Invalid input detected",
                                    "error_code": "INVALID_INPUT",
                                    "details": {}
                                }
                            )
                    
                    # Check for XSS patterns
                    xss_patterns = [
                        r'<script[^>]*>',
                        r'javascript:',
                        r'on\w+\s*=',
                        r'<iframe[^>]*>',
                        r'<object[^>]*>',
                        r'<embed[^>]*>'
                    ]
                    
                    for pattern in xss_patterns:
                        if re.search(pattern, body_str, re.IGNORECASE):
                            logger.warning(f"Potential XSS attempt from IP: {request.client.host}")
                            raise HTTPException(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                detail={
                                    "error": True,
                                    "message": "Invalid input detected",
                                    "error_code": "INVALID_INPUT",
                                    "details": {}
                                }
                            )
            
            except Exception as e:
                logger.error(f"Input validation error: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "error": True,
                        "message": "Invalid request format",
                        "error_code": "INVALID_REQUEST",
                        "details": {}
                    }
                )
        
        return await call_next(request)


class LoginAttemptTracker:
    """Track login attempts for brute force protection"""
    
    def __init__(self):
        self.attempts: Dict[str, List[float]] = defaultdict(list)
        self.lockouts: Dict[str, float] = {}
    
    def record_attempt(self, identifier: str, success: bool) -> bool:
        """Record login attempt and return if account should be locked"""
        current_time = time.time()
        
        # Clean old attempts
        window_start = current_time - SecurityConfig.RATE_LIMIT_WINDOW
        self.attempts[identifier] = [
            attempt_time for attempt_time in self.attempts[identifier]
            if attempt_time > window_start
        ]
        
        if success:
            # Clear attempts on successful login
            self.attempts[identifier] = []
            if identifier in self.lockouts:
                del self.lockouts[identifier]
            return True
        
        # Record failed attempt
        self.attempts[identifier].append(current_time)
        
        # Check if should be locked out
        if len(self.attempts[identifier]) >= SecurityConfig.MAX_LOGIN_ATTEMPTS:
            self.lockouts[identifier] = current_time + SecurityConfig.LOCKOUT_DURATION
            logger.warning(f"Account locked due to too many failed attempts: {identifier}")
            return False
        
        return True
    
    def is_locked(self, identifier: str) -> bool:
        """Check if account is currently locked"""
        if identifier not in self.lockouts:
            return False
        
        if time.time() > self.lockouts[identifier]:
            del self.lockouts[identifier]
            return False
        
        return True
    
    def get_lockout_time_remaining(self, identifier: str) -> int:
        """Get remaining lockout time in seconds"""
        if identifier not in self.lockouts:
            return 0
        
        remaining = int(self.lockouts[identifier] - time.time())
        return max(0, remaining)


# Global instances
rate_limiter = RateLimiter()
login_tracker = LoginAttemptTracker()
input_sanitizer = InputSanitizer()
password_validator = PasswordValidator()
