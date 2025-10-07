from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
from uuid import UUID

class UserRole(str, Enum):
    STUDENT = "student"
    INSTRUCTOR = "instructor"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class CourseLevel(str, Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    ALL_LEVELS = "All Levels"

class PaymentType(str, Enum):
    CBE = "CBE"
    TELEBIRR = "TeleBirr"
    COMMERCIAL_BANK = "Commercial Bank"
    AWASH_BANK = "Awash Bank"
    DASHEN_BANK = "Dashen Bank"
    ABYSSINIA_BANK = "Abyssinia Bank"
    OTHER = "Other"

class EnrollmentStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    SUSPENDED = "suspended"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class AdminRole(str, Enum):
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"

class ReferralStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"

# Request Models
class UserRegister(BaseModel):
    fullName: str
    email: EmailStr
    password: str
    referralCode: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PaymentMethodCreate(BaseModel):
    type: PaymentType
    accountNumber: str
    holderName: str

# Old models - keeping for backward compatibility
class CourseEnrollment(BaseModel):
    courseId: str
    paymentMethodId: str  # This will be replaced with paymentAccountId in new system

class PaymentApprovalRequest(BaseModel):
    status: PaymentStatus
    adminNotes: Optional[str] = None
    rejectionReason: Optional[str] = None

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminUserResponse(BaseModel):
    id: str
    email: str
    fullName: str
    role: AdminRole
    isActive: bool
    createdAt: str
    lastLogin: Optional[str] = None

class CourseCreate(BaseModel):
    title: str
    description: str
    price: float
    duration: str
    level: CourseLevel
    image: Optional[str] = None

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    duration: Optional[str] = None
    level: Optional[CourseLevel] = None
    image: Optional[str] = None

# Response Models
class UserResponse(BaseModel):
    id: str
    fullName: str
    email: EmailStr
    referralCode: str
    createdAt: str
    role: UserRole = UserRole.STUDENT

class CourseResponse(BaseModel):
    id: str
    title: str
    description: str
    image: Optional[str]
    price: float
    duration: str
    students: int
    rating: float
    level: str
    instructor: str

class PaymentMethodResponse(BaseModel):
    id: str
    type: PaymentType
    accountNumber: str
    holderName: str
    isDefault: bool
    createdAt: str

class EnrollmentResponse(BaseModel):
    id: str
    courseId: str
    userId: str
    enrolledAt: str
    progress: int
    status: EnrollmentStatus
    course: Optional[CourseResponse] = None

class ReferralResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    status: ReferralStatus
    rewardEarned: int
    dateReferred: str

class DashboardStats(BaseModel):
    coursesEnrolled: int
    hoursLearned: int
    certificates: int
    currentStreak: int
    totalEarnings: int
    successfulReferrals: int

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int
    expires_at: str
    refresh_expires_in: int
    refresh_expires_at: str
    user: UserResponse

# ===================================
# NEW PAYMENT SYSTEM MODELS
# ===================================

class AdminPaymentAccountCreate(BaseModel):
    type: str  # PaymentType value
    accountName: str
    accountNumber: str
    bankName: Optional[str] = None
    instructions: Optional[str] = None
    qrCodeUrl: Optional[str] = None
    isActive: bool = True
    displayOrder: int = 0

class AdminPaymentAccountUpdate(BaseModel):
    type: Optional[str] = None
    accountName: Optional[str] = None
    accountNumber: Optional[str] = None
    bankName: Optional[str] = None
    instructions: Optional[str] = None
    qrCodeUrl: Optional[str] = None
    isActive: Optional[bool] = None
    displayOrder: Optional[int] = None

class AdminPaymentAccountResponse(BaseModel):
    id: str
    type: str
    accountName: str
    accountNumber: str
    bankName: Optional[str] = None
    instructions: Optional[str] = None
    qrCodeUrl: Optional[str] = None
    isActive: bool
    displayOrder: int
    createdAt: str
    updatedAt: str

class PaymentRequestCreate(BaseModel):
    courseId: str
    paymentAccountId: str  # Changed from paymentMethodId
    amount: float
    transactionScreenshotUrl: str  # URL after uploading to storage
    transactionReference: Optional[str] = None  # User provided reference

class PaymentRequestResponse(BaseModel):
    id: str
    userId: str
    courseId: str
    paymentAccountId: str
    amount: float
    transactionScreenshotUrl: str
    transactionReference: Optional[str] = None
    status: PaymentStatus
    adminNotes: Optional[str] = None
    rejectionReason: Optional[str] = None
    approvedBy: Optional[str] = None
    approvedAt: Optional[str] = None
    createdAt: str
    updatedAt: str
    # Additional info
    userName: Optional[str] = None
    userEmail: Optional[str] = None
    courseTitle: Optional[str] = None
    paymentAccountName: Optional[str] = None
    paymentAccountType: Optional[str] = None
    
    @field_validator('approvedBy', 'id', 'userId', 'courseId', 'paymentAccountId', mode='before')
    @classmethod
    def convert_uuid_to_string(cls, v):
        if v is not None:
            return str(v)
        return v

class EnrollmentResponse(BaseModel):
    id: str
    userId: str
    courseId: str
    paymentRequestId: Optional[str] = None
    enrolledAt: str
    progress: int = 0
    completedAt: Optional[str] = None
    # Course details
    courseTitle: Optional[str] = None
    courseDescription: Optional[str] = None
    courseLevel: Optional[str] = None
    courseDuration: Optional[str] = None
    coursePrice: Optional[float] = None
    
    @field_validator('id', 'userId', 'courseId', 'paymentRequestId', mode='before')
    @classmethod
    def convert_uuid_to_string(cls, v):
        if v is not None:
            return str(v)
        return v

class ReferralEarningResponse(BaseModel):
    id: str
    referrerId: str
    referredUserId: str
    enrollmentId: str
    courseId: str
    bonusAmount: float
    status: str  # 'pending' or 'paid'
    paidAt: Optional[str] = None
    createdAt: str
    # Additional info
    referredUserName: Optional[str] = None
    courseTitle: Optional[str] = None
    
    @field_validator('id', 'referrerId', 'referredUserId', 'enrollmentId', 'courseId', mode='before')
    @classmethod
    def convert_uuid_to_string(cls, v):
        if v is not None:
            return str(v)
        return v

# Referral System Models
class ReferralStatsResponse(BaseModel):
    totalReferrals: int
    completedReferrals: int
    pendingReferrals: int
    totalEarnings: float
    referralCode: str

class ReferralResponse(BaseModel):
    id: str
    email: str
    status: str
    rewardEarned: float
    createdAt: str
    completedAt: Optional[str] = None
    referredUserName: Optional[str] = None
    
    @field_validator('id', mode='before')
    @classmethod
    def convert_uuid_to_string(cls, v):
        if v is not None:
            return str(v)
        return v

class ReferralEarningResponse(BaseModel):
    id: str
    referrerId: str
    referredUserId: str
    amount: float
    status: str
    createdAt: str
    completedAt: Optional[str] = None
    referredUserName: Optional[str] = None
    referredUserEmail: Optional[str] = None
    
    @field_validator('id', 'referrerId', 'referredUserId', mode='before')
    @classmethod
    def convert_uuid_to_string(cls, v):
        if v is not None:
            return str(v)
        return v

class ReferralCreateRequest(BaseModel):
    email: EmailStr

# Withdrawal System Models
class WithdrawalRequest(BaseModel):
    amount: float
    accountType: str  # "CBE" or "TeleBirr"
    accountNumber: str
    accountHolderName: str
    phoneNumber: Optional[str] = None

class WithdrawalResponse(BaseModel):
    id: str
    userId: str
    amount: float
    accountType: str
    accountNumber: str
    accountHolderName: str
    phoneNumber: Optional[str] = None
    status: str  # "pending", "approved", "rejected"
    adminNotes: Optional[str] = None
    rejectionReason: Optional[str] = None
    createdAt: str
    processedAt: Optional[str] = None
    processedBy: Optional[str] = None
    
    @field_validator('id', 'userId', 'processedBy', mode='before')
    @classmethod
    def convert_uuid_to_string(cls, v):
        if v is not None:
            return str(v)
        return v