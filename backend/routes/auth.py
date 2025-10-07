from fastapi import APIRouter, HTTPException, status
from datetime import timedelta
from models import UserRegister, UserLogin, TokenResponse
from auth import (
    authenticate_user, 
    create_user_response
)
from database.operations import db_ops
from exceptions import (
    create_validation_error,
    create_business_logic_error,
    create_authentication_error,
    create_database_error
)
from validators import validate_user_registration, validate_user_login
from secure_auth import secure_auth
from token_manager import token_manager

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
async def register(user: UserRegister):
    """Register a new user"""
    try:
        # Validate input data
        validated_data = validate_user_registration({
            "email": user.email,
            "password": user.password,
            "fullName": user.fullName,
            "phone": getattr(user, 'phone', ''),
            "referralCode": user.referralCode
        })
        
        # Check if user already exists
        existing_user = await db_ops.get_user_by_email(validated_data['email'])
        if existing_user:
            raise create_business_logic_error(
                "Email already registered",
                {"email": validated_data['email']}
            )
        
        # Validate password security
        is_secure, password_issues = secure_auth.validate_password_security(validated_data['password'])
        if not is_secure:
            raise create_validation_error(
                password_issues[0],  # Show first issue
                "password",
                validated_data['password']
            )
        
        # Hash password securely
        hashed_password = secure_auth.hash_password(validated_data['password'])
        
        # Create user
        user_data = {
            "fullName": validated_data['fullName'],
            "email": validated_data['email'],
            "password": hashed_password,
            "referralCode": validated_data['referralCode']
        }
        
        new_user = await db_ops.create_user(user_data)
        
        if not new_user:
            raise create_database_error("Failed to create user")
        
        # Handle referral bonus
        if validated_data['referralCode']:
            referrer = await db_ops.find_user_by_referral_code(validated_data['referralCode'])
            if referrer:
                # Create referral record
                referral_data = {
                    "name": validated_data['fullName'],
                    "email": validated_data['email']
                }
                await db_ops.create_referral(referrer["id"], referral_data)
        
        # Create token pair using token manager
        user_data = {
            'id': new_user['id'],
            'email': new_user['email'],
            'role': 'student',
            'permissions': []
        }
        
        access_token, refresh_token, token_info = token_manager.create_token_pair(user_data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": token_info['expires_in'],
            "expires_at": token_info['expires_at'],
            "refresh_expires_in": token_info['refresh_expires_in'],
            "refresh_expires_at": token_info['refresh_expires_at'],
            "user": create_user_response(new_user)
        }
            
    except HTTPException:
        # Re-raise HTTP exceptions (our custom errors)
        raise
    except Exception as e:
        raise create_database_error(f"Registration failed: {str(e)}")

@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin):
    """Login user"""
    authenticated_user = await authenticate_user(user.email, user.password)
    if not authenticated_user:
        raise create_authentication_error("Incorrect email or password")
    
    # Create token pair using token manager
    user_data = {
        'id': authenticated_user['id'],
        'email': authenticated_user['email'],
        'role': 'student',
        'permissions': []
    }
    
    access_token, refresh_token, token_info = token_manager.create_token_pair(user_data)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "expires_in": token_info['expires_in'],
        "expires_at": token_info['expires_at'],
        "refresh_expires_in": token_info['refresh_expires_in'],
        "refresh_expires_at": token_info['refresh_expires_at'],
        "user": create_user_response(authenticated_user)
    }