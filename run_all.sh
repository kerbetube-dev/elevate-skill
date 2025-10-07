#!/bin/bash

# Elevate Skill - Run All Services
# This script starts both the backend and frontend servers

echo "🚀 Starting Elevate Skill Application..."
echo "========================================"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down all services..."
    pkill -f "uvicorn" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    pkill -f "npm" 2>/dev/null
    pkill -f "node" 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    echo "   Expected files: package.json, backend/"
    exit 1
fi

# Start Backend Server
echo "🔧 Starting Backend Server (Port 8004)..."
cd backend
source .venv/bin/activate
uvicorn app:app --host 0.0.0.0 --port 8004 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 5

# Check if backend started successfully
if ! curl -s http://localhost:8004/health > /dev/null; then
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Backend started successfully on http://localhost:8004"

# Start Frontend Server
echo "🌐 Starting Frontend Server (Port 8080)..."
npm run dev &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if ! curl -s http://localhost:8080 > /dev/null; then
    echo "❌ Frontend failed to start"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

echo "✅ Frontend started successfully on http://localhost:8080"

echo ""
echo "🎉 All services are running!"
echo "================================"
echo "📱 Frontend: http://localhost:8080"
echo "🔧 Backend:  http://localhost:8004"
echo "📊 Admin:    http://localhost:8080/admin"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
