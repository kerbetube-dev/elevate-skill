from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
import hashlib
import jwt
from database.operations import db_ops

# Security configuration
SECRET_KEY = "your-secret-key-change-in-production"  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    # Use simple hash verification for now
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_password_hash(password: str) -> str:
    """Hash a password"""
    # Use a simple hash for now to avoid bcrypt issues
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get the current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        role: str = payload.get("role", "student")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    # Check if it's an admin user
    if role in ["admin", "super_admin"]:
        admin = await db_ops.get_admin_by_email(email)
        if admin:
            return {
                "id": admin["id"],
                "email": admin["email"],
                "fullName": admin["full_name"],
                "role": admin["role"],
                "referralCode": "ADMIN",
                "created_at": admin["created_at"].isoformat()
            }
    
    # Regular user
    user = await db_ops.get_user_by_email(email)
    if user is None:
        raise credentials_exception
    
    return user

async def authenticate_user(email: str, password: str) -> Optional[dict]:
    """Authenticate a user with email and password"""
    user = await db_ops.get_user_by_email(email)
    if not user:
        return None
    
    # Try both old SHA256 and new bcrypt verification
    if not verify_password(password, user["password"]):
        # Try bcrypt verification for new passwords
        from secure_auth import secure_auth
        if not secure_auth.verify_password(password, user["password"]):
            return None
    
    return user

def create_user_response(user: dict) -> dict:
    """Create a safe user response (without password)"""
    return {
        "id": user["id"],
        "fullName": user["full_name"],
        "email": user["email"],
        "referralCode": user["referral_code"],
        "created_at": user["created_at"].isoformat() if user.get("created_at") else None,
        "role": user.get("role", "student")
    }