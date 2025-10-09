from typing import Dict, List, Optional
import json
import os
from datetime import datetime
import uuid


class InMemoryDatabase:
    """
    Simple in-memory database for development.
    In production, replace this with a proper database like PostgreSQL or MongoDB.
    """

    def __init__(self):
        self.users: Dict[str, dict] = {}
        self.courses: Dict[str, dict] = {}
        self.enrollments: Dict[str, List[dict]] = {}
        self.payment_methods: Dict[str, List[dict]] = {}
        self.referrals: Dict[str, List[dict]] = {}
        self._initialize_sample_data()

    def _initialize_sample_data(self):
        """Initialize with sample course data"""
        sample_courses = {
            "1": {
                "id": "1",
                "title": "Digital Marketing",
                "description": "Master social media, SEO, PPC, and content marketing strategies to grow your business and career in the digital age.",
                "image": "/src/assets/digital-marketing.jpg",
                "price": 850,
                "duration": "8 weeks",
                "students": 1250,
                "rating": 4.8,
                "level": "Beginner to Intermediate",
                "instructor": "Sarah Johnson",
                "created_at": datetime.utcnow().isoformat()
            },
            "2": {
                "id": "2",
                "title": "Graphics Design",
                "description": "Learn professional graphic design using Adobe Creative Suite. Master typography, color theory, branding, and visual communication.",
                "image": "/src/assets/graphics-design.jpg",
                "price": 850,
                "duration": "10 weeks",
                "students": 890,
                "rating": 4.9,
                "level": "Beginner to Intermediate",
                "instructor": "Mike Chen",
                "created_at": datetime.utcnow().isoformat()
            },
            "3": {
                "id": "3",
                "title": "Video Editing",
                "description": "Create professional videos using industry-standard software. Learn advanced editing techniques, motion graphics, and storytelling.",
                "image": "/src/assets/video-editing.jpg",
                "price": 850,
                "duration": "12 weeks",
                "students": 670,
                "rating": 4.7,
                "level": "Intermediate to Advanced",
                "instructor": "Alex Rodriguez",
                "created_at": datetime.utcnow().isoformat()
            },
            "4": {
                "id": "4",
                "title": "English Communication",
                "description": "Enhance your English fluency with comprehensive speaking, writing, listening, and reading skills for business and daily use.",
                "image": "/src/assets/english-communication.jpg",
                "price": 850,
                "duration": "6 weeks",
                "students": 2100,
                "rating": 4.6,
                "level": "All Levels",
                "instructor": "Emma Thompson",
                "created_at": datetime.utcnow().isoformat()
            },
            "5": {
                "id": "5",
                "title": "Web Development",
                "description": "Full-stack development with HTML, CSS, JavaScript, React, and Node.js. Build modern web applications from scratch.",
                "image": "/src/assets/web-development.jpg",
                "price": 850,
                "duration": "16 weeks",
                "students": 1580,
                "rating": 4.9,
                "level": "Intermediate to Advanced",
                "instructor": "David Kim",
                "created_at": datetime.utcnow().isoformat()
            },
            "6": {
                "id": "6",
                "title": "Application Development",
                "description": "Develop cross-platform mobile and desktop applications using modern frameworks like React Native and Flutter.",
                "image": "/src/assets/app-development.jpg",
                "price": 850,
                "duration": "14 weeks",
                "students": 920,
                "rating": 4.8,
                "level": "Advanced",
                "instructor": "Lisa Wang",
                "created_at": datetime.utcnow().isoformat()
            }
        }
        self.courses = sample_courses

    # User operations
    def create_user(self, user_data: dict) -> dict:
        user_id = str(uuid.uuid4())
        referral_code = f"ELEVATE{user_id[:8].upper()}"

        user = {
            "id": user_id,
            "fullName": user_data["fullName"],
            "email": user_data["email"],
            "password": user_data["password"],
            "referralCode": referral_code,
            "referredBy": user_data.get("referralCode"),
            "created_at": datetime.utcnow().isoformat(),
            "role": "student",
            "totalEarnings": 0
        }

        self.users[user_data["email"]] = user
        return user

    def get_user_by_email(self, email: str) -> Optional[dict]:
        return self.users.get(email)

    def update_user(self, email: str, updates: dict) -> Optional[dict]:
        if email in self.users:
            self.users[email].update(updates)
            return self.users[email]
        return None

    # Course operations
    def get_all_courses(self) -> List[dict]:
        return list(self.courses.values())

    def get_course_by_id(self, course_id: str) -> Optional[dict]:
        return self.courses.get(course_id)

    def create_course(self, course_data: dict) -> dict:
        course_id = str(uuid.uuid4())
        course = {
            "id": course_id,
            "students": 0,
            "rating": 0.0,
            "created_at": datetime.utcnow().isoformat(),
            **course_data
        }
        self.courses[course_id] = course
        return course

    def update_course(self, course_id: str, updates: dict) -> Optional[dict]:
        if course_id in self.courses:
            self.courses[course_id].update(updates)
            return self.courses[course_id]
        return None

    # Enrollment operations
    def create_enrollment(self, user_email: str, enrollment_data: dict) -> dict:
        enrollment_id = str(uuid.uuid4())
        enrollment = {
            "id": enrollment_id,
            "enrolledAt": datetime.utcnow().isoformat(),
            "progress": 0,
            "status": "active",
            **enrollment_data
        }

        if user_email not in self.enrollments:
            self.enrollments[user_email] = []
        self.enrollments[user_email].append(enrollment)

        # Update course student count
        course_id = enrollment_data["courseId"]
        if course_id in self.courses:
            self.courses[course_id]["students"] += 1

        return enrollment

    def get_user_enrollments(self, user_email: str) -> List[dict]:
        return self.enrollments.get(user_email, [])

    def update_enrollment_progress(self, user_email: str, enrollment_id: str, progress: int) -> Optional[dict]:
        user_enrollments = self.enrollments.get(user_email, [])
        for enrollment in user_enrollments:
            if enrollment["id"] == enrollment_id:
                enrollment["progress"] = progress
                if progress >= 100:
                    enrollment["status"] = "completed"
                return enrollment
        return None

    # Payment method operations
    def create_payment_method(self, user_email: str, method_data: dict) -> dict:
        method_id = str(uuid.uuid4())
        method = {
            "id": method_id,
            "isDefault": len(self.payment_methods.get(user_email, [])) == 0,
            "created_at": datetime.utcnow().isoformat(),
            **method_data
        }

        if user_email not in self.payment_methods:
            self.payment_methods[user_email] = []
        self.payment_methods[user_email].append(method)

        return method

    def get_user_payment_methods(self, user_email: str) -> List[dict]:
        return self.payment_methods.get(user_email, [])

    def delete_payment_method(self, user_email: str, method_id: str) -> bool:
        user_methods = self.payment_methods.get(user_email, [])
        original_length = len(user_methods)
        self.payment_methods[user_email] = [
            method for method in user_methods if method["id"] != method_id
        ]
        return len(self.payment_methods[user_email]) < original_length

    def set_default_payment_method(self, user_email: str, method_id: str) -> bool:
        user_methods = self.payment_methods.get(user_email, [])
        found = False
        for method in user_methods:
            if method["id"] == method_id:
                method["isDefault"] = True
                found = True
            else:
                method["isDefault"] = False
        return found

    # Referral operations
    def create_referral(self, referrer_email: str, referral_data: dict) -> dict:
        referral_id = str(uuid.uuid4())
        referral = {
            "id": referral_id,
            "status": "completed",
            "rewardEarned": 100,
            "dateReferred": datetime.utcnow().isoformat(),
            **referral_data
        }

        if referrer_email not in self.referrals:
            self.referrals[referrer_email] = []
        self.referrals[referrer_email].append(referral)

        # Update referrer's earnings
        if referrer_email in self.users:
            self.users[referrer_email]["totalEarnings"] += 100

        return referral

    def get_user_referrals(self, user_email: str) -> List[dict]:
        return self.referrals.get(user_email, [])

    def find_user_by_referral_code(self, referral_code: str) -> Optional[dict]:
        for user in self.users.values():
            if user.get("referralCode") == referral_code:
                return user
        return None


# Global database instance
db = InMemoryDatabase()

