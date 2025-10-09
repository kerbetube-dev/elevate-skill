"""
Stats Routes
Handles platform, course, and user statistics
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from typing import Dict, Any
from database.operations import db_ops
from auth import get_current_user

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/platform")
async def get_platform_stats():
    """Get platform-wide statistics"""
    try:
        # Get total students (users)
        total_students = await db_ops.get_total_users()
        
        # Get total courses
        total_courses = await db_ops.get_total_courses()
        
        # Get success rate (completed enrollments / total enrollments)
        success_rate = await db_ops.get_success_rate()
        
        # Get average rating across all courses
        average_rating = await db_ops.get_average_rating()
        
        return {
            "totalStudents": total_students,
            "totalCourses": total_courses,
            "successRate": success_rate,
            "averageRating": average_rating
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch platform stats: {str(e)}")

@router.get("/course/{course_id}")
async def get_course_stats(course_id: str):
    """Get statistics for a specific course"""
    try:
        # Get enrollment count
        enrollment_count = await db_ops.get_course_enrollment_count(course_id)
        
        # Get average rating for this course
        average_rating = await db_ops.get_course_average_rating(course_id)
        
        # Get completion rate for this course
        completion_rate = await db_ops.get_course_completion_rate(course_id)
        
        return {
            "enrollmentCount": enrollment_count,
            "averageRating": average_rating,
            "completionRate": completion_rate
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch course stats: {str(e)}")

@router.get("/user/{user_id}")
async def get_user_stats(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get statistics for a specific user"""
    try:
        # Verify user can access these stats
        if current_user.id != user_id and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Get enrolled courses count
        enrolled_courses = await db_ops.get_user_enrolled_courses_count(user_id)
        
        # Get completed courses count
        completed_courses = await db_ops.get_user_completed_courses_count(user_id)
        
        # Get total earnings
        total_earnings = await db_ops.get_user_total_earnings(user_id)
        
        # Get referral count
        referral_count = await db_ops.get_user_referral_count(user_id)
        
        return {
            "enrolledCourses": enrolled_courses,
            "completedCourses": completed_courses,
            "totalEarnings": total_earnings,
            "referralCount": referral_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user stats: {str(e)}")

@router.get("/dashboard")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics for current user"""
    try:
        # Get user's enrolled courses
        enrolled_courses = await db_ops.get_user_enrollments(current_user.id)
        
        # Get user's payment requests
        payment_requests = await db_ops.get_user_payment_requests(current_user.id)
        
        # Get user's withdrawal requests
        withdrawal_requests = await db_ops.get_user_withdrawal_requests(current_user.id)
        
        # Get referral stats
        referral_stats = await db_ops.get_referral_stats(current_user.id)
        
        # Get user's total earnings
        total_earnings = await db_ops.get_user_total_earnings(current_user.id)
        
        return {
            "enrolledCourses": enrolled_courses,
            "paymentRequests": payment_requests,
            "withdrawalRequests": withdrawal_requests,
            "referralStats": referral_stats,
            "totalEarnings": total_earnings
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch dashboard stats: {str(e)}")
