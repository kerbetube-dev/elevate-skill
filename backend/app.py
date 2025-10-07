from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
from contextlib import asynccontextmanager
from pathlib import Path
from database.connection import connect_db, disconnect_db

# Import routers
from routes.auth import router as auth_router
from routes.courses import router as courses_router
from routes.user import router as user_router
from routes.dashboard import router as dashboard_router
from routes.admin import router as admin_router
from routes.security import router as security_router
from routes.tokens import router as tokens_router
from routes.payment_accounts import router as payment_accounts_router
from routes.payments import router as payments_router
from routes.referrals import router as referrals_router
from routes.withdrawals import router as withdrawals_router

# Import error handlers
from error_handlers import register_error_handlers

# Import security middleware
from security import SecurityHeadersMiddleware, RateLimitMiddleware, InputValidationMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    yield
    # Shutdown
    await disconnect_db()

# Initialize FastAPI app
app = FastAPI(
    title="Elevate Skil API",
    description="Backend API for Elevate Skil Learning Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Security middleware (order matters - first added is outermost)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(InputValidationMiddleware)
app.add_middleware(RateLimitMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:8082",
        "http://localhost:8083",
        "http://localhost:3000",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8082",
        "http://127.0.0.1:8083",
        "http://127.0.0.1:3000",
        "http://10.240.41.148:8080",
        "http://172.19.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Register error handlers
register_error_handlers(app)

# Include routers
app.include_router(auth_router)
app.include_router(courses_router)
app.include_router(user_router)
app.include_router(dashboard_router)
app.include_router(admin_router)
app.include_router(security_router)
app.include_router(tokens_router)
app.include_router(payment_accounts_router)
app.include_router(payments_router)
app.include_router(referrals_router)
app.include_router(withdrawals_router)

# Set up static file serving for transaction screenshots
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Elevate Skil API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "active"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "API is running successfully"
    }

# Note: Global exception handler is now registered via error_handlers.py

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )