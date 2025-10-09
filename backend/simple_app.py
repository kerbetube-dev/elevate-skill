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
from pydantic import BaseModel, EmailStr


app = FastAPI(
    title="Elevate Skil API (In-Memory)",
    description="In-memory backend API for quick testing",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "dev-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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
    }
}
enrollments_db = {}
payment_methods_db = {}
referrals_db = {}


class UserRegister(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    referralCode: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class PaymentMethod(BaseModel):
    type: str
    account_number: str
    holderName: str


class CourseEnrollment(BaseModel):
    courseId: str
    paymentMethodId: str


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
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
        user = users_db.get(email)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")


@app.get("/")
async def root():
    return {"message": "Welcome to Elevate Skil API (In-Memory)"}


@app.post("/auth/register")
async def register(user: UserRegister):
    if user.email in users_db:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(user.password)
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

    if user.referralCode:
        for email, existing_user in users_db.items():
            if existing_user.get("referralCode") == user.referralCode:
                existing_user["totalEarnings"] += 100
                referrals_db.setdefault(email, []).append({
                    "id": str(uuid.uuid4()),
                    "name": user.fullName,
                    "email": user.email,
                    "status": "completed",
                    "rewardEarned": 100,
                    "dateReferred": datetime.utcnow().isoformat()
                })
                break

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)

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
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)
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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)


