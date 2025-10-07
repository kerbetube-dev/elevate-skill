"""
Custom exceptions for the ElevateSkill API
Provides standardized error handling across the application
"""

from typing import Optional, Dict, Any
from fastapi import HTTPException, status


class ElevateSkillException(Exception):
    """Base exception for ElevateSkill API"""
    def __init__(self, message: str, error_code: str = None, details: Dict[str, Any] = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(ElevateSkillException):
    """Raised when input validation fails"""
    pass


class AuthenticationError(ElevateSkillException):
    """Raised when authentication fails"""
    pass


class AuthorizationError(ElevateSkillException):
    """Raised when user lacks permission for an action"""
    pass


class ResourceNotFoundError(ElevateSkillException):
    """Raised when a requested resource is not found"""
    pass


class DatabaseError(ElevateSkillException):
    """Raised when database operations fail"""
    pass


class PaymentError(ElevateSkillException):
    """Raised when payment-related operations fail"""
    pass


class BusinessLogicError(ElevateSkillException):
    """Raised when business logic constraints are violated"""
    pass


def create_http_exception(
    exc: ElevateSkillException,
    status_code: int = status.HTTP_400_BAD_REQUEST
) -> HTTPException:
    """Convert ElevateSkillException to HTTPException with standardized format"""
    
    error_response = {
        "error": True,
        "message": exc.message,
        "error_code": exc.error_code or "UNKNOWN_ERROR",
        "details": exc.details
    }
    
    return HTTPException(
        status_code=status_code,
        detail=error_response
    )


def create_validation_error(message: str, field: str = None, value: Any = None) -> HTTPException:
    """Create a standardized validation error"""
    details = {}
    if field:
        details["field"] = field
    if value is not None:
        details["value"] = str(value)
    
    error_response = {
        "error": True,
        "message": message,
        "error_code": "VALIDATION_ERROR",
        "details": details
    }
    
    return HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        detail=error_response
    )


def create_not_found_error(resource: str, identifier: str = None) -> HTTPException:
    """Create a standardized not found error"""
    details = {"resource": resource}
    if identifier:
        details["identifier"] = identifier
    
    error_response = {
        "error": True,
        "message": f"{resource} not found",
        "error_code": "RESOURCE_NOT_FOUND",
        "details": details
    }
    
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=error_response
    )


def create_authentication_error(message: str = "Authentication required") -> HTTPException:
    """Create a standardized authentication error"""
    error_response = {
        "error": True,
        "message": message,
        "error_code": "AUTHENTICATION_ERROR",
        "details": {}
    }
    
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=error_response
    )


def create_authorization_error(message: str = "Insufficient permissions") -> HTTPException:
    """Create a standardized authorization error"""
    error_response = {
        "error": True,
        "message": message,
        "error_code": "AUTHORIZATION_ERROR",
        "details": {}
    }
    
    return HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail=error_response
    )


def create_business_logic_error(message: str, details: Dict[str, Any] = None) -> HTTPException:
    """Create a standardized business logic error"""
    error_response = {
        "error": True,
        "message": message,
        "error_code": "BUSINESS_LOGIC_ERROR",
        "details": details or {}
    }
    
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=error_response
    )


def create_database_error(message: str = "Database operation failed") -> HTTPException:
    """Create a standardized database error"""
    error_response = {
        "error": True,
        "message": message,
        "error_code": "DATABASE_ERROR",
        "details": {}
    }
    
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=error_response
    )


def create_payment_error(message: str, details: Dict[str, Any] = None) -> HTTPException:
    """Create a standardized payment error"""
    error_response = {
        "error": True,
        "message": message,
        "error_code": "PAYMENT_ERROR",
        "details": details or {}
    }
    
    return HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail=error_response
    )
