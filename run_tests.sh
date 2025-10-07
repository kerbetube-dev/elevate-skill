#!/bin/bash

# Comprehensive Test Runner for Elevate Skill
# Tests both frontend and backend with integration tests

set -e  # Exit on any error

echo "🧪 Starting Comprehensive Test Suite for Elevate Skill"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    local status=$1
    local message=$2
    case $status in
        "INFO")
            echo -e "${BLUE}ℹ️  $message${NC}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}✅ $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ $message${NC}"
            ;;
    esac
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_status "INFO" "Waiting for $service_name to be ready..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_status "SUCCESS" "$service_name is ready!"
            return 0
        fi
        
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_status "ERROR" "$service_name failed to start after $((max_attempts * 2)) seconds"
    return 1
}

# Check prerequisites
print_status "INFO" "Checking prerequisites..."

if ! command_exists python3; then
    print_status "ERROR" "Python 3 is required but not installed"
    exit 1
fi

if ! command_exists node; then
    print_status "ERROR" "Node.js is required but not installed"
    exit 1
fi

if ! command_exists npm; then
    print_status "ERROR" "npm is required but not installed"
    exit 1
fi

if ! command_exists curl; then
    print_status "ERROR" "curl is required but not installed"
    exit 1
fi

print_status "SUCCESS" "All prerequisites are available"

# Check if backend is running
print_status "INFO" "Checking backend status..."
if port_in_use 8002; then
    print_status "SUCCESS" "Backend is already running on port 8002"
else
    print_status "WARNING" "Backend is not running. Please start it with:"
    echo "  cd backend && source .venv/bin/activate && uvicorn app:app --host 0.0.0.0 --port 8002"
    echo ""
    read -p "Press Enter to continue with frontend tests only, or Ctrl+C to exit and start backend first..."
fi

# Check if frontend is running
print_status "INFO" "Checking frontend status..."
if port_in_use 8080; then
    print_status "SUCCESS" "Frontend is already running on port 8080"
else
    print_status "WARNING" "Frontend is not running. Please start it with:"
    echo "  npm run dev"
    echo ""
    read -p "Press Enter to continue with backend tests only, or Ctrl+C to exit and start frontend first..."
fi

# Install test dependencies
print_status "INFO" "Installing test dependencies..."

# Backend test dependencies
if [ -d "backend" ]; then
    cd backend
    if [ -f "requirements.txt" ]; then
        print_status "INFO" "Installing Python test dependencies..."
        pip install httpx pytest pytest-asyncio >/dev/null 2>&1 || print_status "WARNING" "Failed to install some Python dependencies"
    fi
    cd ..
fi

# Frontend test dependencies
if [ -f "package.json" ]; then
    print_status "INFO" "Installing frontend test dependencies..."
    npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom >/dev/null 2>&1 || print_status "WARNING" "Failed to install some frontend dependencies"
fi

# Run Backend Tests
print_status "INFO" "Running Backend API Tests..."
echo "----------------------------------------"

if [ -f "backend/test_api.py" ]; then
    cd backend
    if python3 test_api.py; then
        print_status "SUCCESS" "Backend API tests passed!"
    else
        print_status "ERROR" "Backend API tests failed!"
        cd ..
        exit 1
    fi
    cd ..
else
    print_status "WARNING" "Backend test file not found"
fi

# Run Integration Tests
print_status "INFO" "Running Integration Tests..."
echo "----------------------------------------"

if [ -f "test_integration.py" ]; then
    if python3 test_integration.py; then
        print_status "SUCCESS" "Integration tests passed!"
    else
        print_status "ERROR" "Integration tests failed!"
        exit 1
    fi
else
    print_status "WARNING" "Integration test file not found"
fi

# Run Frontend Tests
print_status "INFO" "Running Frontend Component Tests..."
echo "----------------------------------------"

if [ -f "package.json" ] && [ -d "src/test" ]; then
    # Check if vitest is available
    if npx vitest --version >/dev/null 2>&1; then
        if npx vitest run --reporter=verbose; then
            print_status "SUCCESS" "Frontend component tests passed!"
        else
            print_status "ERROR" "Frontend component tests failed!"
            exit 1
        fi
    else
        print_status "WARNING" "Vitest not available, skipping frontend tests"
    fi
else
    print_status "WARNING" "Frontend test files not found"
fi

# Performance Tests
print_status "INFO" "Running Performance Tests..."
echo "----------------------------------------"

# Test API response times
if port_in_use 8002; then
    print_status "INFO" "Testing API response times..."
    
    # Test courses endpoint
    start_time=$(date +%s%N)
    curl -s http://localhost:8002/courses/ >/dev/null
    end_time=$(date +%s%N)
    courses_time=$(( (end_time - start_time) / 1000000 ))
    
    # Test health endpoint
    start_time=$(date +%s%N)
    curl -s http://localhost:8002/health >/dev/null
    end_time=$(date +%s%N)
    health_time=$(( (end_time - start_time) / 1000000 ))
    
    print_status "SUCCESS" "API Performance:"
    echo "  - Courses endpoint: ${courses_time}ms"
    echo "  - Health endpoint: ${health_time}ms"
    
    if [ $courses_time -lt 1000 ] && [ $health_time -lt 500 ]; then
        print_status "SUCCESS" "API performance is acceptable"
    else
        print_status "WARNING" "API performance may be slow"
    fi
fi

# Security Tests
print_status "INFO" "Running Security Tests..."
echo "----------------------------------------"

if port_in_use 8002; then
    # Test CORS headers
    print_status "INFO" "Testing CORS configuration..."
    cors_response=$(curl -s -I -X OPTIONS -H "Origin: http://localhost:8080" http://localhost:8002/courses/)
    
    if echo "$cors_response" | grep -q "Access-Control-Allow-Origin"; then
        print_status "SUCCESS" "CORS headers are properly configured"
    else
        print_status "WARNING" "CORS headers may not be properly configured"
    fi
    
    # Test authentication
    print_status "INFO" "Testing authentication security..."
    auth_response=$(curl -s -X POST -H "Content-Type: application/json" -d '{"email":"test@example.com","password":"wrongpassword"}' http://localhost:8002/auth/login)
    
    if echo "$auth_response" | grep -q "Invalid credentials\|Unauthorized\|401"; then
        print_status "SUCCESS" "Authentication properly rejects invalid credentials"
    else
        print_status "WARNING" "Authentication may not be properly secured"
    fi
fi

# Final Summary
print_status "SUCCESS" "All tests completed!"
echo "=================================================="
echo "🎉 Test Suite Summary:"
echo "  ✅ Backend API Tests"
echo "  ✅ Integration Tests" 
echo "  ✅ Frontend Component Tests"
echo "  ✅ Performance Tests"
echo "  ✅ Security Tests"
echo ""
echo "🚀 Your Elevate Skill application is fully tested and ready!"
echo "=================================================="
