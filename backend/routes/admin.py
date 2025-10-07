from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models import (
    AdminLogin, 
    AdminUserResponse, 
    PaymentRequestResponse, 
    PaymentApprovalRequest,
    TokenResponse
)
from auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user
from secure_auth import secure_auth
from database.operations import db_ops
from datetime import timedelta

router = APIRouter(prefix="/admin", tags=["Admin"])

# Admin authentication
async def get_current_admin(current_user: dict = Depends(get_current_user)):
    """Get current admin user from token"""
    # Check if user is admin
    if current_user.get("role") not in ["admin", "super_admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    admin = await db_ops.get_admin_by_email(current_user["email"])
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    return admin

@router.post("/login", response_model=TokenResponse)
async def admin_login(admin: AdminLogin):
    """Admin login"""
    # Get admin user
    admin_user = await db_ops.get_admin_by_email(admin.email)
    if not admin_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    # Verify password using secure_auth
    if not secure_auth.verify_password(admin.password, admin_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid admin credentials"
        )
    
    # Update last login
    await db_ops.update_admin_last_login(admin_user["id"])
    
    # Create token pair using token manager
    from token_manager import token_manager
    
    user_data = {
        'id': str(admin_user["id"]),
        'email': admin_user["email"],
        'role': admin_user["role"],
        'permissions': ['admin']
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
        "user": {
            "id": str(admin_user["id"]),
            "email": admin_user["email"],
            "fullName": admin_user["full_name"],
            "role": admin_user["role"],
            "referralCode": "ADMIN",  # Admins don't have referral codes
            "createdAt": admin_user["created_at"].isoformat()
        }
    }

@router.get("/profile", response_model=AdminUserResponse)
async def get_admin_profile(current_admin: dict = Depends(get_current_admin)):
    """Get admin profile"""
    return {
        "id": current_admin["id"],
        "email": current_admin["email"],
        "fullName": current_admin["full_name"],
        "role": current_admin["role"],
        "isActive": current_admin["is_active"],
        "createdAt": current_admin["created_at"].isoformat(),
        "lastLogin": current_admin["last_login"].isoformat() if current_admin["last_login"] else None
    }

# Payment management
@router.get("/payments", response_model=List[PaymentRequestResponse])
async def get_payment_requests(
    status: str = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Get all payment requests"""
    requests = await db_ops.get_payment_requests(status)
    
    # Convert to response format - All UUIDs already converted to strings in database layer
    response = []
    for req in requests:
        response.append({
            "id": req["id"],
            "userId": req["user_id"],
            "courseId": req["course_id"],
            "paymentAccountId": req["payment_account_id"],
            "amount": float(req["amount"]),
            "transactionScreenshotUrl": req.get("transaction_screenshot_url", ""),
            "transactionReference": req.get("transaction_reference"),
            "status": req["status"],
            "adminNotes": req.get("admin_notes"),
            "createdAt": req["created_at"],
            "updatedAt": req.get("updated_at", req["created_at"]).isoformat() if req.get("updated_at") else req["created_at"].isoformat(),  # Convert to string
            "approvedAt": req["approved_at"] if req["approved_at"] else None,
            "approvedBy": req.get("approved_by"),
            "rejectionReason": req.get("rejection_reason"),
            # Additional info
            "userName": req["full_name"],
            "userEmail": req["email"],
            "courseTitle": req["course_title"],
            "paymentAccountName": req.get("payment_type", ""),
            "paymentAccountType": req.get("payment_type", "")
        })
    
    return response

@router.post("/payments/{request_id}/approve")
async def approve_payment_request(
    request_id: str,
    approval: PaymentApprovalRequest,
    current_admin: dict = Depends(get_current_admin)
):
    """Approve a payment request"""
    result = await db_ops.approve_payment_and_enroll(
        request_id, 
        current_admin["id"], 
        approval.adminNotes
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to approve payment request"
        )
    
    return {
        "message": "Payment request approved successfully",
        "enrollment_id": result.get("enrollment_id"),
        "referral_bonus_awarded": result.get("referral_bonus_awarded", False),
        "referral_amount": result.get("referral_amount", 0)
    }

@router.post("/payments/{request_id}/reject")
async def reject_payment_request(
    request_id: str,
    approval: PaymentApprovalRequest,
    current_admin: dict = Depends(get_current_admin)
):
    """Reject a payment request"""
    if not approval.rejectionReason:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Rejection reason is required"
        )
    
    success = await db_ops.reject_payment_request(
        request_id, 
        current_admin["id"], 
        approval.rejectionReason
    )
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to reject payment request"
        )
    
    return {"message": "Payment request rejected successfully"}

@router.get("/stats")
async def get_admin_stats(current_admin: dict = Depends(get_current_admin)):
    """Get admin dashboard statistics"""
    # Get pending payments count
    pending_payments = await db_ops.get_payment_requests("pending")
    
    # Get approved payments count
    approved_payments = await db_ops.get_payment_requests("approved")
    
    # Get rejected payments count
    rejected_payments = await db_ops.get_payment_requests("rejected")
    
    # Get user statistics
    all_users = await db_ops.get_all_users()
    active_users = [user for user in all_users if user.get("is_active", True)]
    
    return {
        "pendingPayments": len(pending_payments),
        "approvedPayments": len(approved_payments),
        "rejectedPayments": len(rejected_payments),
        "totalPayments": len(pending_payments) + len(approved_payments) + len(rejected_payments),
        "totalUsers": len(all_users),
        "activeUsers": len(active_users),
        "inactiveUsers": len(all_users) - len(active_users)
    }

# User management endpoints
@router.get("/users")
async def get_all_users_admin(
    page: int = 1,
    limit: int = 20,
    search: str = None,
    status: str = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Get all users with pagination and filtering"""
    users = await db_ops.get_all_users()
    
    # Apply search filter
    if search:
        search_lower = search.lower()
        users = [
            user for user in users 
            if (search_lower in user.get("full_name", "").lower() or 
                search_lower in user.get("email", "").lower())
        ]
    
    # Apply status filter
    if status == "active":
        users = [user for user in users if user.get("is_active", True)]
    elif status == "inactive":
        users = [user for user in users if not user.get("is_active", True)]
    
    # Pagination
    total = len(users)
    start = (page - 1) * limit
    end = start + limit
    paginated_users = users[start:end]
    
    return {
        "users": paginated_users,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }

@router.get("/users/{user_id}")
async def get_user_details(
    user_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Get detailed user information"""
    user = await db_ops.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get user's enrollments
    enrollments = await db_ops.get_user_enrollments(user_id)
    
    # Get user's referrals
    referrals = await db_ops.get_user_referrals(user_id)
    
    return {
        "user": user,
        "enrollments": enrollments,
        "referrals": referrals
    }

@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    is_active: bool,
    current_admin: dict = Depends(get_current_admin)
):
    """Activate or deactivate a user"""
    success = await db_ops.update_user_status(user_id, is_active)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    action = "activated" if is_active else "deactivated"
    return {"message": f"User {action} successfully"}

@router.get("/users/{user_id}/enrollments")
async def get_user_enrollments_admin(
    user_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Get user's enrollments for admin view"""
    enrollments = await db_ops.get_user_enrollments(user_id)
    return {"enrollments": enrollments}

@router.get("/users/{user_id}/referrals")
async def get_user_referrals_admin(
    user_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Get user's referrals for admin view"""
    referrals = await db_ops.get_user_referrals(user_id)
    return {"referrals": referrals}

# Course management endpoints
@router.get("/courses")
async def get_all_courses_admin(
    page: int = 1,
    limit: int = 20,
    search: str = None,
    category: str = None,
    status: str = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Get all courses with pagination and filtering"""
    courses = await db_ops.get_all_courses()
    
    # Apply search filter
    if search:
        search_lower = search.lower()
        courses = [
            course for course in courses 
            if (search_lower in course.get("title", "").lower() or 
                search_lower in course.get("description", "").lower() or
                search_lower in course.get("instructor", "").lower())
        ]
    
    # Apply category filter (using level as category for now)
    if category:
        courses = [course for course in courses if course.get("level", "").lower() == category.lower()]
    
    # Apply status filter (all courses are considered active for now)
    if status == "active":
        courses = [course for course in courses if True]  # All courses are active
    elif status == "inactive":
        courses = []  # No inactive courses for now
    
    # Pagination
    total = len(courses)
    start = (page - 1) * limit
    end = start + limit
    paginated_courses = courses[start:end]
    
    return {
        "courses": paginated_courses,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    }

@router.get("/courses/{course_id}")
async def get_course_details_admin(
    course_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Get detailed course information"""
    course = await db_ops.get_course_by_id(course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Get course enrollments
    enrollments = await db_ops.get_course_enrollments(course_id)
    
    # Get course statistics
    stats = await db_ops.get_course_stats(course_id)
    
    return {
        "course": course,
        "enrollments": enrollments,
        "stats": stats
    }

@router.post("/courses")
async def create_course(
    course_data: dict,
    current_admin: dict = Depends(get_current_admin)
):
    """Create a new course"""
    course = await db_ops.create_course(course_data)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create course"
        )
    
    return {"message": "Course created successfully", "course": course}

@router.put("/courses/{course_id}")
async def update_course(
    course_id: str,
    course_data: dict,
    current_admin: dict = Depends(get_current_admin)
):
    """Update a course"""
    success = await db_ops.update_course(course_id, course_data)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    return {"message": "Course updated successfully"}

@router.delete("/courses/{course_id}")
async def delete_course(
    course_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Delete a course"""
    success = await db_ops.delete_course(course_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    return {"message": "Course deleted successfully"}

@router.put("/courses/{course_id}/status")
async def update_course_status(
    course_id: str,
    is_active: bool,
    current_admin: dict = Depends(get_current_admin)
):
    """Activate or deactivate a course"""
    success = await db_ops.update_course_status(course_id, is_active)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    action = "activated" if is_active else "deactivated"
    return {"message": f"Course {action} successfully"}

@router.get("/courses/categories")
async def get_course_categories(
    current_admin: dict = Depends(get_current_admin)
):
    """Get all course categories"""
    categories = await db_ops.get_course_categories()
    return {"categories": categories}

@router.get("/courses/{course_id}/enrollments")
async def get_course_enrollments_admin(
    course_id: str,
    current_admin: dict = Depends(get_current_admin)
):
    """Get course enrollments for admin view"""
    enrollments = await db_ops.get_course_enrollments(course_id)
    return {"enrollments": enrollments}

# Analytics and Reports endpoints
@router.get("/analytics/overview")
async def get_analytics_overview(
    current_admin: dict = Depends(get_current_admin)
):
    """Get comprehensive analytics overview"""
    overview = await db_ops.get_analytics_overview()
    return overview

@router.get("/analytics/revenue")
async def get_revenue_analytics(
    period: str = "30d",  # 7d, 30d, 90d, 1y
    current_admin: dict = Depends(get_current_admin)
):
    """Get revenue analytics for specified period"""
    revenue_data = await db_ops.get_revenue_analytics(period)
    return revenue_data

@router.get("/analytics/users")
async def get_user_analytics(
    period: str = "30d",
    current_admin: dict = Depends(get_current_admin)
):
    """Get user growth and engagement analytics"""
    user_data = await db_ops.get_user_analytics(period)
    return user_data

@router.get("/analytics/courses")
async def get_course_analytics(
    current_admin: dict = Depends(get_current_admin)
):
    """Get course performance analytics"""
    course_data = await db_ops.get_course_analytics()
    return course_data

@router.get("/analytics/enrollments")
async def get_enrollment_analytics(
    period: str = "30d",
    current_admin: dict = Depends(get_current_admin)
):
    """Get enrollment trends and analytics"""
    enrollment_data = await db_ops.get_enrollment_analytics(period)
    return enrollment_data

@router.get("/analytics/referrals")
async def get_referral_analytics(
    current_admin: dict = Depends(get_current_admin)
):
    """Get referral program analytics"""
    referral_data = await db_ops.get_referral_analytics()
    return referral_data

@router.get("/reports/financial")
async def get_financial_report(
    start_date: str = None,
    end_date: str = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Generate financial report"""
    report = await db_ops.get_financial_report(start_date, end_date)
    return report

@router.get("/reports/users")
async def get_user_report(
    start_date: str = None,
    end_date: str = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Generate user activity report"""
    report = await db_ops.get_user_report(start_date, end_date)
    return report

@router.get("/reports/courses")
async def get_course_report(
    start_date: str = None,
    end_date: str = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Generate course performance report"""
    report = await db_ops.get_course_report(start_date, end_date)
    return report
