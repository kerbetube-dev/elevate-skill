@echo off
REM Elevate Skill - Run All Services (Windows)
REM This script starts both the backend and frontend servers

echo 🚀 Starting Elevate Skill Application...
echo ========================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the project root directory
    echo    Expected files: package.json, backend/
    pause
    exit /b 1
)

if not exist "backend" (
    echo ❌ Error: Backend directory not found
    echo    Expected: backend/
    pause
    exit /b 1
)

REM Start Backend Server
echo 🔧 Starting Backend Server (Port 8004)...
cd backend
call .venv\Scripts\activate
start "Backend Server" cmd /k "uvicorn app:app --host 0.0.0.0 --port 8004"
cd ..

REM Wait a moment for backend to start
timeout /t 5 /nobreak > nul

REM Start Frontend Server
echo 🌐 Starting Frontend Server (Port 8080)...
start "Frontend Server" cmd /k "npm run dev"

REM Wait a moment for frontend to start
timeout /t 5 /nobreak > nul

echo.
echo 🎉 All services are starting!
echo ================================
echo 📱 Frontend: http://localhost:8080
echo 🔧 Backend:  http://localhost:8004
echo 📊 Admin:    http://localhost:8080/admin
echo.
echo Both servers are running in separate windows.
echo Close the windows to stop the services.
echo.
pause
