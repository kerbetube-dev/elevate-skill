from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from datetime import datetime, timedelta
from typing import Optional, List
import jwt
from passlib.context import CryptContext
import uuid

# Initialize FastAPI app
app = FastAPI(
    title="Elevate Skil API",
    description="Backend API for Elevate Skil Learning Platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your-secret-key-here"  # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# In-memory storage (replace with database in production)
users_db = {}
courses_db = {
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
        "instructor": "Sarah Johnson"
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
        "instructor": "Mike Chen"
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
        "instructor": "Alex Rodriguez"
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
        "instructor": "Emma Thompson"
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
        "instructor": "David Kim"
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
        "instructor": "Lisa Wang"
    }
}

enrollments_db = {}
payment_methods_db = {}
referrals_db = {}

# Pydantic models
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    referralCode: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PaymentMethod(BaseModel):
    type: str  # 'cbe' or 'telebirr'
    account_number: str
    holderName: str

class CourseEnrollment(BaseModel):
    courseId: str
    paymentMethodId: str

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        user = users_db.get(email)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Routes
@app.get("/")
async def root():
    return {"message": "Welcome to Elevate Skil API"}

@app.post("/auth/register")
async def register(user: UserRegister):
    if user.email in users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
    
    # Generate referral code for new user
    referral_code = f"ELEVATE{user_id[:8].upper()}"
    
    new_user = {
        "id": user_id,
        "fullName": user.fullName,
        "email": user.email,
        "password": hashed_password,
        "referralCode": referral_code,
        "referredBy": user.referralCode,
        "created_at": datetime.utcnow().isoformat(),
        "enrolledCourses": [],
        "totalEarnings": 0
    }
    
    users_db[user.email] = new_user
    
    # Handle referral bonus
    if user.referralCode:
        for email, existing_user in users_db.items():
            if existing_user.get("referralCode") == user.referralCode:
                existing_user["totalEarnings"] += 100  # 100 Birr referral bonus
                # Add referral record
                if email not in referrals_db:
                    referrals_db[email] = []
                referrals_db[email].append({
                    "id": str(uuid.uuid4()),
                    "name": user.fullName,
                    "email": user.email,
                    "status": "completed",
                    "rewardEarned": 100,
                    "dateReferred": datetime.utcnow().isoformat()
                })
                break
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "fullName": user.fullName,
            "email": user.email,
            "referralCode": referral_code
        }
    }

@app.post("/auth/login")
async def login(user: UserLogin):
    db_user = users_db.get(user.email)
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": db_user["id"],
            "fullName": db_user["fullName"],
            "email": db_user["email"],
            "referralCode": db_user["referralCode"]
        }
    }

@app.get("/courses")
async def get_courses():
    return {"courses": list(courses_db.values())}

@app.get("/courses/{course_id}")
async def get_course(course_id: str):
    course = courses_db.get(course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    return course

@app.get("/user/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    enrolled_courses = []
    user_enrollments = enrollments_db.get(current_user["email"], [])
    
    for enrollment in user_enrollments:
        course = courses_db.get(enrollment["courseId"])
        if course:
            enrolled_courses.append({
                **course,
                "progress": enrollment.get("progress", 0),
                "enrolledAt": enrollment["enrolledAt"]
            })
    
    return {
        "user": {
            "id": current_user["id"],
            "fullName": current_user["fullName"],
            "email": current_user["email"],
            "memberSince": current_user["created_at"],
            "referralCode": current_user["referralCode"],
            "totalEarnings": current_user.get("totalEarnings", 0)
        },
        "enrolledCourses": enrolled_courses,
        "stats": {
            "coursesEnrolled": len(enrolled_courses),
            "hoursLearned": len(enrolled_courses) * 24,  # Estimated
            "certificates": 0,  # To be implemented
            "currentStreak": 7  # To be implemented
        }
    }

@app.post("/courses/{course_id}/enroll")
async def enroll_course(
    course_id: str,
    enrollment: CourseEnrollment,
    current_user: dict = Depends(get_current_user)
):
    course = courses_db.get(course_id)
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Check if user already enrolled
    user_enrollments = enrollments_db.get(current_user["email"], [])
    for existing_enrollment in user_enrollments:
        if existing_enrollment["courseId"] == course_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Already enrolled in this course"
            )
    
    # Verify payment method exists
    user_payment_methods = payment_methods_db.get(current_user["email"], [])
    payment_method = None
    for pm in user_payment_methods:
        if pm["id"] == enrollment.paymentMethodId:
            payment_method = pm
            break
    
    if not payment_method:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment method not found"
        )
    
    # Create enrollment
    new_enrollment = {
        "id": str(uuid.uuid4()),
        "courseId": course_id,
        "userId": current_user["id"],
        "paymentMethodId": enrollment.paymentMethodId,
        "enrolledAt": datetime.utcnow().isoformat(),
        "progress": 0,
        "status": "active"
    }
    
    if current_user["email"] not in enrollments_db:
        enrollments_db[current_user["email"]] = []
    enrollments_db[current_user["email"]].append(new_enrollment)
    
    # Update course student count
    courses_db[course_id]["students"] += 1
    
    return {
        "message": "Successfully enrolled in course",
        "enrollment": new_enrollment
    }

@app.get("/user/payment-methods")
async def get_payment_methods(current_user: dict = Depends(get_current_user)):
    user_methods = payment_methods_db.get(current_user["email"], [])
    return {"paymentMethods": user_methods}

@app.post("/user/payment-methods")
async def add_payment_method(
    payment_method: PaymentMethod,
    current_user: dict = Depends(get_current_user)
):
    method_id = str(uuid.uuid4())
    new_method = {
        "id": method_id,
        "type": payment_method.type,
        "account_number": payment_method.account_number,
        "holderName": payment_method.holderName,
        "isDefault": len(payment_methods_db.get(current_user["email"], [])) == 0,
        "created_at": datetime.utcnow().isoformat()
    }
    
    if current_user["email"] not in payment_methods_db:
        payment_methods_db[current_user["email"]] = []
    payment_methods_db[current_user["email"]].append(new_method)
    
    return {
        "message": "Payment method added successfully",
        "paymentMethod": new_method
    }

@app.delete("/user/payment-methods/{method_id}")
async def remove_payment_method(
    method_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_methods = payment_methods_db.get(current_user["email"], [])
    payment_methods_db[current_user["email"]] = [
        method for method in user_methods if method["id"] != method_id
    ]
    
    return {"message": "Payment method removed successfully"}

@app.put("/user/payment-methods/{method_id}/default")
async def set_default_payment_method(
    method_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_methods = payment_methods_db.get(current_user["email"], [])
    
    for method in user_methods:
        method["isDefault"] = method["id"] == method_id
    
    return {"message": "Default payment method updated"}

@app.get("/user/referrals")
async def get_referrals(current_user: dict = Depends(get_current_user)):
    user_referrals = referrals_db.get(current_user["email"], [])
    
    return {
        "referralCode": current_user["referralCode"],
        "totalEarnings": current_user.get("totalEarnings", 0),
        "referrals": user_referrals,
        "stats": {
            "totalEarnings": current_user.get("totalEarnings", 0),
            "successfulReferrals": len([r for r in user_referrals if r["status"] == "completed"]),
            "rewardPerReferral": 100
        }
    }

@app.get("/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    user_enrollments = enrollments_db.get(current_user["email"], [])
    user_referrals = referrals_db.get(current_user["email"], [])
    
    return {
        "coursesEnrolled": len(user_enrollments),
        "hoursLearned": len(user_enrollments) * 24,  # Estimated
        "certificates": 0,  # To be implemented
        "currentStreak": 7,  # To be implemented
        "totalEarnings": current_user.get("totalEarnings", 0),
        "successfulReferrals": len([r for r in user_referrals if r["status"] == "completed"])
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)