#!/usr/bin/env python3
"""
Database Seeding Script for Elevate Skil
This script populates the database with real course data and sample users.
"""

import asyncio
import uuid
from datetime import datetime, timedelta
from database.connection import get_async_session
from database.operations import db_ops
from sqlalchemy import text

# Real course data from frontend
COURSES_DATA = [
    {
        "title": "Digital Marketing",
        "description": "Master social media, SEO, PPC, and content marketing strategies to grow your business and career in the digital age.",
        "image": "/src/assets/digital-marketing.jpg",
        "price": 850.0,
        "duration": "8 weeks",
        "students": 1250,
        "rating": 4.8,
        "level": "Beginner to Intermediate",
        "instructor": "Sarah Johnson",
        "outcomes": [
            "Master social media marketing strategies",
            "Understand SEO fundamentals and implementation",
            "Create effective PPC campaigns",
            "Develop content marketing strategies",
            "Analyze marketing metrics and ROI"
        ],
        "curriculum": [
            "Week 1: Introduction to Digital Marketing",
            "Week 2: Social Media Marketing",
            "Week 3: Search Engine Optimization (SEO)",
            "Week 4: Pay-Per-Click (PPC) Advertising",
            "Week 5: Content Marketing",
            "Week 6: Email Marketing",
            "Week 7: Analytics and Metrics",
            "Week 8: Final Project and Portfolio"
        ]
    },
    {
        "title": "Graphics Design",
        "description": "Learn professional graphic design using Adobe Creative Suite. Master typography, color theory, branding, and visual communication.",
        "image": "/src/assets/graphics-design.jpg",
        "price": 850.0,
        "duration": "10 weeks",
        "students": 890,
        "rating": 4.9,
        "level": "Beginner to Intermediate",
        "instructor": "Mike Chen",
        "outcomes": [
            "Master Adobe Creative Suite tools",
            "Understand design principles and color theory",
            "Create professional branding materials",
            "Develop typography skills",
            "Build a design portfolio"
        ],
        "curriculum": [
            "Week 1: Introduction to Graphic Design",
            "Week 2: Adobe Photoshop Basics",
            "Week 3: Adobe Illustrator Fundamentals",
            "Week 4: Typography and Layout",
            "Week 5: Color Theory and Application",
            "Week 6: Branding and Identity Design",
            "Week 7: Print Design Principles",
            "Week 8: Digital Design and Web Graphics",
            "Week 9: Portfolio Development",
            "Week 10: Final Project Presentation"
        ]
    },
    {
        "title": "Video Editing",
        "description": "Create professional videos using industry-standard software. Learn advanced editing techniques, motion graphics, and storytelling.",
        "image": "/src/assets/video-editing.jpg",
        "price": 850.0,
        "duration": "12 weeks",
        "students": 670,
        "rating": 4.7,
        "level": "Intermediate to Advanced",
        "instructor": "Alex Rodriguez"
    },
    {
        "title": "English Communication",
        "description": "Enhance your English fluency with comprehensive speaking, writing, listening, and reading skills for business and daily use.",
        "image": "/src/assets/english-communication.jpg",
        "price": 850.0,
        "duration": "6 weeks",
        "students": 2100,
        "rating": 4.6,
        "level": "All Levels",
        "instructor": "Emma Thompson"
    },
    {
        "title": "Web Development",
        "description": "Full-stack development with HTML, CSS, JavaScript, React, and Node.js. Build modern web applications from scratch.",
        "image": "/src/assets/web-development.jpg",
        "price": 850.0,
        "duration": "16 weeks",
        "students": 1580,
        "rating": 4.9,
        "level": "Intermediate to Advanced",
        "instructor": "David Kim"
    },
    {
        "title": "Application Development",
        "description": "Develop cross-platform mobile and desktop applications using modern frameworks like React Native and Flutter.",
        "image": "/src/assets/app-development.jpg",
        "price": 850.0,
        "duration": "14 weeks",
        "students": 920,
        "rating": 4.8,
        "level": "Advanced",
        "instructor": "Lisa Wang"
    }
]

# Sample users for testing
SAMPLE_USERS = [
    {
        "fullName": "John Doe",
        "email": "john@example.com",
        "password": "Pass123",
        "role": "student"
    },
    {
        "fullName": "Jane Smith",
        "email": "jane@example.com", 
        "password": "Pass123",
        "role": "student"
    },
    {
        "fullName": "Mike Johnson",
        "email": "mike@example.com",
        "password": "Pass123",
        "role": "student"
    }
]

async def clear_existing_data():
    """Clear existing data to start fresh"""
    print("🗑️  Clearing existing data...")
    async with get_async_session() as session:
        # Delete in reverse order of dependencies
        await session.execute(text("DELETE FROM referrals"))
        await session.execute(text("DELETE FROM enrollments"))
        await session.execute(text("DELETE FROM payment_methods"))
        await session.execute(text("DELETE FROM courses"))
        await session.execute(text("DELETE FROM users"))
        await session.commit()
    print("✅ Existing data cleared")

async def seed_courses():
    """Seed the database with course data"""
    print("📚 Seeding courses...")
    
    for course_data in COURSES_DATA:
        course_id = str(uuid.uuid4())
        query = """
        INSERT INTO courses (id, title, description, image, price, duration, students, rating, level, instructor, outcomes, curriculum, created_at)
        VALUES (:id, :title, :description, :image, :price, :duration, :students, :rating, :level, :instructor, :outcomes, :curriculum, :created_at)
        """
        
        values = {
            "id": course_id,
            "title": course_data["title"],
            "description": course_data["description"],
            "image": course_data["image"],
            "price": course_data["price"],
            "duration": course_data["duration"],
            "students": course_data["students"],
            "rating": course_data["rating"],
            "level": course_data["level"],
            "instructor": course_data["instructor"],
            "outcomes": course_data.get("outcomes"),
            "curriculum": course_data.get("curriculum"),
            "created_at": datetime.utcnow()
        }
        
        async with get_async_session() as session:
            await session.execute(text(query), values)
            await session.commit()
    
    print(f"✅ Seeded {len(COURSES_DATA)} courses")

async def seed_users():
    """Seed the database with sample users"""
    print("👥 Seeding users...")
    
    for user_data in SAMPLE_USERS:
        # Create user using the existing create_user method
        user_result = await db_ops.create_user({
            "fullName": user_data["fullName"],
            "email": user_data["email"],
            "password": user_data["password"]
        })
        
        if user_result:
            print(f"✅ Created user: {user_data['email']}")
        else:
            print(f"❌ Failed to create user: {user_data['email']}")
    
    print(f"✅ Seeded {len(SAMPLE_USERS)} users")

async def seed_enrollments():
    """Create sample enrollments for users"""
    print("🎓 Creating sample enrollments...")
    
    # Get all users and courses
    async with get_async_session() as session:
        users_result = await session.execute(text("SELECT id, email FROM users LIMIT 3"))
        users = users_result.mappings().all()
        
        courses_result = await session.execute(text("SELECT id, title FROM courses LIMIT 3"))
        courses = courses_result.mappings().all()
        
        # Get payment methods for users
        payment_methods_result = await session.execute(text("SELECT id, user_id FROM payment_methods"))
        payment_methods = payment_methods_result.mappings().all()
    
    if not users or not courses or not payment_methods:
        print("❌ No users, courses, or payment methods found for enrollments")
        return
    
    # Create enrollments with payment methods
    enrollment_data = [
        {"user_id": users[0]["id"], "course_id": courses[0]["id"], "progress": 65, "payment_method_id": payment_methods[0]["id"]},
        {"user_id": users[0]["id"], "course_id": courses[1]["id"], "progress": 30, "payment_method_id": payment_methods[0]["id"]},
        {"user_id": users[1]["id"], "course_id": courses[0]["id"], "progress": 100, "payment_method_id": payment_methods[0]["id"]},
        {"user_id": users[2]["id"], "course_id": courses[2]["id"], "progress": 45, "payment_method_id": payment_methods[0]["id"]},
    ]
    
    for enrollment in enrollment_data:
        result = await db_ops.create_enrollment(
            enrollment["user_id"],
            {
                "course_id": enrollment["course_id"],
                "payment_method_id": enrollment["payment_method_id"],
                "progress": enrollment["progress"]
            }
        )
        
        if result:
            print(f"✅ Created enrollment for user {enrollment['user_id']}")
        else:
            print(f"❌ Failed to create enrollment")
    
    print(f"✅ Created {len(enrollment_data)} enrollments")

async def seed_payment_methods():
    """Create sample payment methods for users"""
    print("💳 Creating sample payment methods...")
    
    # Get first user
    async with get_async_session() as session:
        users_result = await session.execute(text("SELECT id FROM users LIMIT 1"))
        user = users_result.mappings().first()
    
    if not user:
        print("❌ No users found for payment methods")
        return
    
    # Create sample payment methods
    payment_methods = [
        {
            "user_id": user["id"],
            "type": "cbe",
            "account_number": "1000123456789",
            "account_name": "John Doe",
            "is_default": True
        },
        {
            "user_id": user["id"],
            "type": "telebirr",
            "account_number": "0912345678",
            "account_name": "John Doe",
            "is_default": False
        }
    ]
    
    for method in payment_methods:
        result = await db_ops.create_payment_method(
            method["user_id"],
            {
                "type": method["type"],
                "account_number": method["account_number"],
                "holder_name": method["account_name"],
                "is_default": method["is_default"]
            }
        )
        if result:
            print(f"✅ Created payment method: {method['type']}")
        else:
            print(f"❌ Failed to create payment method: {method['type']}")
    
    print(f"✅ Created {len(payment_methods)} payment methods")

async def seed_referrals():
    """Create sample referral data"""
    print("🤝 Creating sample referrals...")
    
    # Get users
    async with get_async_session() as session:
        users_result = await session.execute(text("SELECT id, referral_code FROM users LIMIT 2"))
        users = users_result.mappings().all()
    
    if len(users) < 2:
        print("❌ Need at least 2 users for referrals")
        return
    
    # Create referral
    referral_data = {
        "referrer_id": users[0]["id"],
        "referred_email": "referred@example.com",
        "referred_name": "Referred User"
    }
    
    result = await db_ops.create_referral(
        referral_data["referrer_id"],
        {
            "email": referral_data["referred_email"],
            "name": referral_data["referred_name"]
        }
    )
    if result:
        print("✅ Created sample referral")
    else:
        print("❌ Failed to create referral")

async def main():
    """Main seeding function"""
    print("🌱 Starting database seeding...")
    
    try:
        # Clear existing data
        await clear_existing_data()
        
        # Seed data
        await seed_courses()
        await seed_users()
        await seed_payment_methods()
        await seed_enrollments()
        await seed_referrals()
        
        print("\n🎉 Database seeding completed successfully!")
        print("\n📊 Summary:")
        print("- Courses: 6")
        print("- Users: 3")
        print("- Enrollments: 4")
        print("- Payment Methods: 2")
        print("- Referrals: 1")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main())
