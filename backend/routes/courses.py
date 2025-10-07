from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models import CourseResponse, CourseEnrollment
from auth import get_current_user
from database.operations import db_ops

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("/", response_model=List[CourseResponse])
async def get_courses():
    """Get all available courses"""
    courses = await db_ops.get_all_courses()
    return courses

@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(course_id: str):
    """Get a specific course by ID"""
    course = await db_ops.get_course_by_id(course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    return course

@router.post("/{course_id}/enroll")
async def enroll_course(
    course_id: str,
    enrollment: CourseEnrollment,
    current_user: dict = Depends(get_current_user)
):
    """Request course enrollment (creates payment request for admin approval)"""
    # Check if course exists
    course = await db_ops.get_course_by_id(course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check if user already enrolled
    enrollments = await db_ops.get_user_enrollments(current_user["id"])
    if any(e.get("course_id") == course_id for e in enrollments):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already enrolled in this course"
        )
    
    # Verify payment method exists
    methods = await db_ops.get_user_payment_methods(current_user["id"])
    if not any(pm["id"] == enrollment.paymentMethodId for pm in methods):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment method not found"
        )
    
    # Create payment request instead of immediate enrollment
    payment_request_data = {
        "course_id": course_id,
        "payment_account_id": enrollment.paymentAccountId,
        "amount": course["price"]
    }
    
    payment_request = await db_ops.create_payment_request(current_user["id"], payment_request_data)
    
    if not payment_request:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment request"
        )
    
    return {
        "message": "Payment request submitted successfully. Please wait for admin approval.",
        "paymentRequest": payment_request,
        "status": "pending"
    }

@router.get("/{course_id}/lessons")
async def get_course_lessons(
    course_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get course lessons (requires enrollment)"""
    # Check if user is enrolled
    user_enrollments = await db_ops.get_user_enrollments(current_user["id"])
    enrolled = any(e.get("course_id") == course_id for e in user_enrollments)
    
    if not enrolled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You must be enrolled in this course to access lessons"
        )
    
    # Mock lesson data - in production, this would come from the database
    lessons = [
        {
            "id": "1",
            "title": "Introduction and Overview",
            "duration": "15 minutes",
            "completed": True,
            "videoUrl": "https://example.com/lesson1.mp4"
        },
        {
            "id": "2",
            "title": "Getting Started",
            "duration": "25 minutes",
            "completed": True,
            "videoUrl": "https://example.com/lesson2.mp4"
        },
        {
            "id": "3",
            "title": "Core Concepts",
            "duration": "30 minutes",
            "completed": False,
            "videoUrl": "https://example.com/lesson3.mp4"
        }
    ]
    
    return {"lessons": lessons}