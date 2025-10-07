#!/bin/bash

echo "🚀 Starting Elevate Skill - All Systems"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo -e "${YELLOW}⚠️  Port $1 is already in use${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Port $1 is available${NC}"
        return 0
    fi
}

# Navigate to project directory
cd "$(dirname "$0")"

echo ""
echo "1. Starting Backend (Port 8004)..."
if check_port 8004; then
    cd backend
    source .venv/bin/activate
    uvicorn app:app --host 0.0.0.0 --port 8004 &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend started with PID: $BACKEND_PID${NC}"
    cd ..
else
    echo -e "${YELLOW}⚠️  Backend might already be running${NC}"
fi

echo ""
echo "2. Starting Frontend (Port 8083)..."
if check_port 8083; then
    npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend started with PID: $FRONTEND_PID${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend might already be running${NC}"
fi

echo ""
echo "3. Waiting for services to start..."
sleep 8

echo ""
echo "🔍 Checking system status..."
echo "============================"

# Check Backend
echo -n "Backend (Port 8004): "
if curl -s http://localhost:8004/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not responding${NC}"
fi

# Check Frontend
echo -n "Frontend (Port 8083): "
if curl -s http://localhost:8083 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Running${NC}"
else
    echo -e "${RED}❌ Not responding${NC}"
fi

echo ""
echo "🌐 Access URLs:"
echo "==============="
echo "• Frontend: http://localhost:8083"
echo "• Backend API: http://localhost:8004"
echo "• API Docs: http://localhost:8004/docs"
echo "• Admin Panel: http://localhost:8083/admin"
echo ""
echo "🔑 Admin Login:"
echo "• Email: admin@elevateskill.com"
echo "• Password: Admin1234"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running
wait
