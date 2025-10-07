"""
Input validation utilities for the ElevateSkill API
Provides comprehensive validation for user inputs
"""

import re
from typing import Optional, List, Dict, Any
from exceptions import create_validation_error


class InputValidator:
    """Comprehensive input validation class"""
    
    # Email validation regex
    EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')
    
    # Phone validation regex (supports various formats)
    PHONE_REGEX = re.compile(r'^[\+]?[1-9][\d]{0,15}$')
    
    # Password requirements
    MIN_PASSWORD_LENGTH = 8
    MAX_PASSWORD_LENGTH = 128
    
    @staticmethod
    def validate_email(email: str) -> str:
        """Validate email format"""
        if not email:
            raise create_validation_error("Email is required", "email")
        
        email = email.strip().lower()
        
        if not InputValidator.EMAIL_REGEX.match(email):
            raise create_validation_error(
                "Invalid email format",
                "email",
                email
            )
        
        if len(email) > 254:  # RFC 5321 limit
            raise create_validation_error(
                "Email is too long (max 254 characters)",
                "email",
                email
            )
        
        return email
    
    @staticmethod
    def validate_password(password: str) -> str:
        """Validate password strength"""
        if not password:
            raise create_validation_error("Password is required", "password")
        
        if len(password) < InputValidator.MIN_PASSWORD_LENGTH:
            raise create_validation_error(
                f"Password must be at least {InputValidator.MIN_PASSWORD_LENGTH} characters long",
                "password",
                password
            )
        
        if len(password) > InputValidator.MAX_PASSWORD_LENGTH:
            raise create_validation_error(
                f"Password must be no more than {InputValidator.MAX_PASSWORD_LENGTH} characters long",
                "password",
                password
            )
        
        # Check for at least one letter and one number
        if not re.search(r'[A-Za-z]', password):
            raise create_validation_error(
                "Password must contain at least one letter",
                "password"
            )
        
        if not re.search(r'\d', password):
            raise create_validation_error(
                "Password must contain at least one number",
                "password"
            )
        
        return password
    
    @staticmethod
    def validate_name(name: str, field_name: str = "name") -> str:
        """Validate name fields (full name, etc.)"""
        if not name:
            raise create_validation_error(f"{field_name.title()} is required", field_name)
        
        name = name.strip()
        
        if len(name) < 2:
            raise create_validation_error(
                f"{field_name.title()} must be at least 2 characters long",
                field_name,
                name
            )
        
        if len(name) > 100:
            raise create_validation_error(
                f"{field_name.title()} must be no more than 100 characters long",
                field_name,
                name
            )
        
        # Check for valid characters (letters, spaces, hyphens, apostrophes)
        if not re.match(r"^[a-zA-Z\s\-']+$", name):
            raise create_validation_error(
                f"{field_name.title()} contains invalid characters",
                field_name,
                name
            )
        
        return name
    
    @staticmethod
    def validate_phone(phone: str) -> str:
        """Validate phone number format"""
        if not phone:
            return ""  # Return empty string for optional phone
        
        # Remove all non-digit characters except +
        cleaned_phone = re.sub(r'[^\d+]', '', phone)
        
        if not InputValidator.PHONE_REGEX.match(cleaned_phone):
            raise create_validation_error(
                "Invalid phone number format",
                "phone",
                phone
            )
        
        if len(cleaned_phone) < 10:
            raise create_validation_error(
                "Phone number must be at least 10 digits",
                "phone",
                phone
            )
        
        return cleaned_phone
    
    @staticmethod
    def validate_referral_code(code: str) -> str:
        """Validate referral code format"""
        if not code:
            return code  # Optional field
        
        code = code.strip().upper()
        
        if len(code) < 6:
            raise create_validation_error(
                "Referral code must be at least 6 characters long",
                "referralCode",
                code
            )
        
        if len(code) > 20:
            raise create_validation_error(
                "Referral code must be no more than 20 characters long",
                "referralCode",
                code
            )
        
        # Check for valid characters (letters and numbers only)
        if not re.match(r'^[A-Z0-9]+$', code):
            raise create_validation_error(
                "Referral code can only contain letters and numbers",
                "referralCode",
                code
            )
        
        return code
    
    @staticmethod
    def validate_amount(amount: float, field_name: str = "amount") -> float:
        """Validate monetary amounts"""
        if amount is None:
            raise create_validation_error(f"{field_name.title()} is required", field_name)
        
        if amount <= 0:
            raise create_validation_error(
                f"{field_name.title()} must be greater than 0",
                field_name,
                amount
            )
        
        if amount > 999999.99:  # Reasonable upper limit
            raise create_validation_error(
                f"{field_name.title()} is too large",
                field_name,
                amount
            )
        
        return round(amount, 2)  # Round to 2 decimal places
    
    @staticmethod
    def validate_uuid(uuid_str: str, field_name: str = "id") -> str:
        """Validate UUID format"""
        if not uuid_str:
            raise create_validation_error(f"{field_name.title()} is required", field_name)
        
        uuid_str = uuid_str.strip()
        
        # Basic UUID format validation
        uuid_pattern = re.compile(
            r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
            re.IGNORECASE
        )
        
        if not uuid_pattern.match(uuid_str):
            raise create_validation_error(
                f"Invalid {field_name} format",
                field_name,
                uuid_str
            )
        
        return uuid_str.lower()
    
    @staticmethod
    def validate_pagination(page: int = 1, limit: int = 10) -> tuple[int, int]:
        """Validate pagination parameters"""
        if page < 1:
            raise create_validation_error(
                "Page number must be at least 1",
                "page",
                page
            )
        
        if limit < 1:
            raise create_validation_error(
                "Limit must be at least 1",
                "limit",
                limit
            )
        
        if limit > 100:  # Reasonable upper limit
            raise create_validation_error(
                "Limit cannot exceed 100",
                "limit",
                limit
            )
        
        return page, limit
    
    @staticmethod
    def validate_search_query(query: str, field_name: str = "query") -> str:
        """Validate search query"""
        if not query:
            return ""
        
        query = query.strip()
        
        if len(query) < 2:
            raise create_validation_error(
                f"Search {field_name} must be at least 2 characters long",
                field_name,
                query
            )
        
        if len(query) > 100:
            raise create_validation_error(
                f"Search {field_name} must be no more than 100 characters long",
                field_name,
                query
            )
        
        # Check for potentially dangerous characters
        dangerous_chars = ['<', '>', '"', "'", '&', ';', '(', ')', '|', '`', '$']
        if any(char in query for char in dangerous_chars):
            raise create_validation_error(
                f"Search {field_name} contains invalid characters",
                field_name,
                query
            )
        
        return query


def validate_user_registration(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate complete user registration data"""
    validated_data = {}
    
    validated_data['email'] = InputValidator.validate_email(data.get('email', ''))
    validated_data['password'] = InputValidator.validate_password(data.get('password', ''))
    validated_data['fullName'] = InputValidator.validate_name(data.get('fullName', ''), 'fullName')
    
    # Phone is optional for now
    phone = data.get('phone', '')
    validated_data['phone'] = InputValidator.validate_phone(phone)
    
    validated_data['referralCode'] = InputValidator.validate_referral_code(data.get('referralCode', ''))
    
    return validated_data


def validate_user_login(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate user login data"""
    validated_data = {}
    
    validated_data['email'] = InputValidator.validate_email(data.get('email', ''))
    validated_data['password'] = data.get('password', '')  # Don't validate password format for login
    
    if not validated_data['password']:
        raise create_validation_error("Password is required", "password")
    
    return validated_data


def validate_payment_request(data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate payment request data"""
    validated_data = {}
    
    validated_data['courseId'] = InputValidator.validate_uuid(data.get('courseId', ''), 'courseId')
    validated_data['paymentMethodId'] = InputValidator.validate_uuid(data.get('paymentMethodId', ''), 'paymentMethodId')
    
    return validated_data
