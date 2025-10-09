import asyncio
from fastapi import APIRouter, Depends
from models import DashboardStats
from auth import get_current_user
from database.operations import db_ops

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics for the current user"""
    try:
        # Get all data in parallel to reduce database calls
        user_enrollments, user_referrals, user_profile = await asyncio.gather(
            db_ops.get_user_enrollments(current_user["id"]),
            db_ops.get_user_referrals(current_user["id"]),
            db_ops.get_user_by_id(current_user["id"])
        )
        
        # Calculate completed courses
        completed_courses = len([e for e in user_enrollments if e.get("progress", 0) >= 100])
        
        # Estimate total hours (simplified calculation)
        total_hours = len(user_enrollments) * 20  # Assume 20 hours per course
        
        successful_referrals = len([r for r in user_referrals if r.get("status") == "completed"])
        
        # Get user's current earnings from database
        total_earnings = user_profile.get("total_earnings", 0) if user_profile else 0
        
        return {
            "coursesEnrolled": len(user_enrollments),
            "hoursLearned": total_hours,
            "certificates": completed_courses,
            "currentStreak": 7,  # Mock data - implement streak tracking
            "totalEarnings": total_earnings,
            "successfulReferrals": successful_referrals
        }
    except Exception as e:
        print(f"Error in dashboard stats: {e}")
        # Return fallback data to prevent timeout
        return {
            "coursesEnrolled": 0,
            "hoursLearned": 0,
            "certificates": 0,
            "currentStreak": 0,
            "totalEarnings": 0,
            "successfulReferrals": 0
        }

@router.get("/recent-activity")
async def get_recent_activity(current_user: dict = Depends(get_current_user)):
    """Get recent user activity"""
    user_enrollments = await db_ops.get_user_enrollments(current_user["id"])
    user_referrals = db.get_user_referrals(current_user["email"])
    
    activities = []
    
    # Add enrollment activities
    for enrollment in user_enrollments[-5:]:  # Last 5 enrollments
        course = await db_ops.get_course_by_id(enrollment.get("course_id"))
        if course:
            activities.append({
                "type": "enrollment",
                "title": f"Enrolled in {course['title']}",
                "date": enrollment["enrolledAt"],
                "icon": "book"
            })
    
    # Add referral activities
    for referral in user_referrals[-3:]:  # Last 3 referrals
        activities.append({
            "type": "referral",
            "title": f"Referred {referral['name']} - Earned {referral['rewardEarned']} Birr",
            "date": referral["dateReferred"],
            "icon": "users"
        })
    
    # Sort by date (most recent first)
    activities.sort(key=lambda x: x["date"], reverse=True)
    
    return {"activities": activities[:10]}  # Return top 10 most recent

@router.get("/progress-overview")
async def get_progress_overview(current_user: dict = Depends(get_current_user)):
    """Get course progress overview"""
    user_enrollments = db.get_user_enrollments(current_user["email"])
    
    progress_data = []
    for enrollment in user_enrollments:
        course = db.get_course_by_id(enrollment["courseId"])
        if course:
            progress_data.append({
                "courseId": course["id"],
                "courseTitle": course["title"],
                "progress": enrollment.get("progress", 0),
                "status": enrollment["status"],
                "enrolledAt": enrollment["enrolledAt"],
                "instructor": course["instructor"]
            })
    
    return {"courses": progress_data}