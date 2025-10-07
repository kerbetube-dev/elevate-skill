"""
Global error handlers for the ElevateSkill API
Provides centralized error handling and logging
"""

import logging
from typing import Union
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from pydantic import ValidationError as PydanticValidationError

from exceptions import ElevateSkillException, create_http_exception

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def elevate_skill_exception_handler(request: Request, exc: ElevateSkillException) -> JSONResponse:
    """Handle ElevateSkill custom exceptions"""
    logger.error(f"ElevateSkill Exception: {exc.message}", extra={
        "error_code": exc.error_code,
        "details": exc.details,
        "path": request.url.path,
        "method": request.method
    })
    
    http_exc = create_http_exception(exc)
    return JSONResponse(
        status_code=http_exc.status_code,
        content=http_exc.detail
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle FastAPI HTTP exceptions"""
    logger.warning(f"HTTP Exception: {exc.detail}", extra={
        "status_code": exc.status_code,
        "path": request.url.path,
        "method": request.method
    })
    
    # If it's already our standardized format, return as-is
    if isinstance(exc.detail, dict) and "error" in exc.detail:
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail
        )
    
    # Otherwise, wrap in our standard format
    error_response = {
        "error": True,
        "message": str(exc.detail),
        "error_code": "HTTP_ERROR",
        "details": {"status_code": exc.status_code}
    }
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle Pydantic validation errors"""
    logger.warning(f"Validation Error: {exc.errors()}", extra={
        "path": request.url.path,
        "method": request.method
    })
    
    # Extract field-specific errors
    field_errors = []
    for error in exc.errors():
        field_path = " -> ".join(str(loc) for loc in error["loc"])
        field_errors.append({
            "field": field_path,
            "message": error["msg"],
            "type": error["type"],
            "input": error.get("input")
        })
    
    error_response = {
        "error": True,
        "message": "Validation failed",
        "error_code": "VALIDATION_ERROR",
        "details": {
            "field_errors": field_errors,
            "total_errors": len(field_errors)
        }
    }
    
    return JSONResponse(
        status_code=422,
        content=error_response
    )


async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    """Handle SQLAlchemy database errors"""
    logger.error(f"Database Error: {str(exc)}", extra={
        "path": request.url.path,
        "method": request.method,
        "exception_type": type(exc).__name__
    })
    
    error_response = {
        "error": True,
        "message": "Database operation failed",
        "error_code": "DATABASE_ERROR",
        "details": {
            "exception_type": type(exc).__name__
        }
    }
    
    return JSONResponse(
        status_code=500,
        content=error_response
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle unexpected exceptions"""
    logger.error(f"Unexpected Error: {str(exc)}", extra={
        "path": request.url.path,
        "method": request.method,
        "exception_type": type(exc).__name__
    }, exc_info=True)
    
    error_response = {
        "error": True,
        "message": "An unexpected error occurred",
        "error_code": "INTERNAL_SERVER_ERROR",
        "details": {}
    }
    
    return JSONResponse(
        status_code=500,
        content=error_response
    )


def register_error_handlers(app):
    """Register all error handlers with the FastAPI app"""
    app.add_exception_handler(ElevateSkillException, elevate_skill_exception_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)
