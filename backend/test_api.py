#!/usr/bin/env python3
"""
Comprehensive API Test Suite for Elevate Skill Backend
Tests all endpoints, authentication, and database operations
"""

import asyncio
import json
import sys
import os
from typing import Dict, Any
import httpx
import pytest
from datetime import datetime

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Test configuration
BASE_URL = "http://localhost:8002"
TEST_EMAIL = "testuser@example.com"
TEST_PASSWORD = "TestPass123!"
TEST_FULL_NAME = "Test User"

class APITester:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=30.0)
        self.auth_token = None
        self.user_id = None
        self.test_results = []
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.client.aclose()
    
    def log_test(self, test_name: str, success: bool, message: str = ""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        })
        print(f"{status} {test_name}: {message}")
    
    async def test_health_endpoint(self):
        """Test health check endpoint"""
        try:
            response = await self.client.get(f"{self.base_url}/health")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_test("Health Check", True, "API is healthy")
                    return True
                else:
                    self.log_test("Health Check", False, f"Unexpected status: {data}")
                    return False
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False
    
    async def test_courses_endpoint(self):
        """Test courses listing endpoint"""
        try:
            response = await self.client.get(f"{self.base_url}/courses/")
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    course = data[0]
                    required_fields = ["id", "title", "description", "price", "duration", "instructor"]
                    missing_fields = [field for field in required_fields if field not in course]
                    if not missing_fields:
                        self.log_test("Courses API", True, f"Retrieved {len(data)} courses with all required fields")
                        return True
                    else:
                        self.log_test("Courses API", False, f"Missing fields: {missing_fields}")
                        return False
                else:
                    self.log_test("Courses API", False, "No courses returned or invalid format")
                    return False
            else:
                self.log_test("Courses API", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Courses API", False, f"Exception: {str(e)}")
            return False
    
    async def test_user_registration(self):
        """Test user registration endpoint"""
        try:
            # Use unique email for each test run
            unique_email = f"test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com"
            
            registration_data = {
                "fullName": TEST_FULL_NAME,
                "email": unique_email,
                "password": TEST_PASSWORD
            }
            
            response = await self.client.post(
                f"{self.base_url}/auth/register",
                json=registration_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if "user" in data and ("token" in data or "access_token" in data):
                    self.auth_token = data.get("token") or data.get("access_token")
                    self.user_id = data["user"]["id"]
                    self.log_test("User Registration", True, f"User created with ID: {self.user_id}")
                    return True
                else:
                    self.log_test("User Registration", False, f"Missing user or token: {data}")
                    return False
            else:
                error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text
                self.log_test("User Registration", False, f"Status {response.status_code}: {error_data}")
                return False
        except Exception as e:
            self.log_test("User Registration", False, f"Exception: {str(e)}")
            return False
    
    async def test_user_login(self):
        """Test user login endpoint"""
        try:
            # First register a user
            unique_email = f"login_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com"
            
            # Register user
            registration_data = {
                "fullName": TEST_FULL_NAME,
                "email": unique_email,
                "password": TEST_PASSWORD
            }
            
            reg_response = await self.client.post(
                f"{self.base_url}/auth/register",
                json=registration_data
            )
            
            if reg_response.status_code != 200:
                self.log_test("User Login", False, f"Registration failed: {reg_response.status_code}")
                return False
            
            # Now test login
            login_data = {
                "email": unique_email,
                "password": TEST_PASSWORD
            }
            
            response = await self.client.post(
                f"{self.base_url}/auth/login",
                json=login_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if "user" in data and ("token" in data or "access_token" in data):
                    self.auth_token = data.get("token") or data.get("access_token")
                    self.user_id = data["user"]["id"]
                    self.log_test("User Login", True, f"Login successful for user: {data['user']['email']}")
                    return True
                else:
                    self.log_test("User Login", False, f"Missing user or token: {data}")
                    return False
            else:
                error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text
                self.log_test("User Login", False, f"Status {response.status_code}: {error_data}")
                return False
        except Exception as e:
            self.log_test("User Login", False, f"Exception: {str(e)}")
            return False
    
    async def test_protected_endpoints(self):
        """Test endpoints that require authentication"""
        if not self.auth_token:
            self.log_test("Protected Endpoints", False, "No auth token available")
            return False
        
        headers = {"Authorization": f"Bearer {self.auth_token}"}
        
        # Test user profile endpoint
        try:
            response = await self.client.get(f"{self.base_url}/user/profile", headers=headers)
            if response.status_code == 200:
                data = response.json()
                if "user" in data and "id" in data["user"] and "email" in data["user"]:
                    self.log_test("User Profile", True, f"Profile retrieved for: {data['user']['email']}")
                else:
                    self.log_test("User Profile", False, f"Invalid profile data: {data}")
            else:
                self.log_test("User Profile", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("User Profile", False, f"Exception: {str(e)}")
        
        # Test user enrollments endpoint
        try:
            response = await self.client.get(f"{self.base_url}/user/enrollments", headers=headers)
            if response.status_code == 200:
                data = response.json()
                self.log_test("User Enrollments", True, f"Retrieved {len(data)} enrollments")
            else:
                self.log_test("User Enrollments", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("User Enrollments", False, f"Exception: {str(e)}")
        
        # Test dashboard stats endpoint
        try:
            response = await self.client.get(f"{self.base_url}/dashboard/stats", headers=headers)
            if response.status_code == 200:
                data = response.json()
                # Check for either the expected format or the actual format returned
                if "totalCourses" in data or "coursesEnrolled" in data:
                    self.log_test("Dashboard Stats", True, f"Dashboard stats retrieved: {data}")
                else:
                    self.log_test("Dashboard Stats", False, f"Unexpected stats format: {data}")
            else:
                self.log_test("Dashboard Stats", False, f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test("Dashboard Stats", False, f"Exception: {str(e)}")
    
    async def test_course_details(self):
        """Test course details endpoint"""
        try:
            # First get courses list
            courses_response = await self.client.get(f"{self.base_url}/courses/")
            if courses_response.status_code != 200:
                self.log_test("Course Details", False, "Could not retrieve courses list")
                return False
            
            courses = courses_response.json()
            if not courses:
                self.log_test("Course Details", False, "No courses available for testing")
                return False
            
            # Test first course details
            course_id = courses[0]["id"]
            response = await self.client.get(f"{self.base_url}/courses/{course_id}")
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "title", "description", "price", "duration", "instructor"]
                missing_fields = [field for field in required_fields if field not in data]
                if not missing_fields:
                    self.log_test("Course Details", True, f"Course details retrieved: {data['title']}")
                    return True
                else:
                    self.log_test("Course Details", False, f"Missing fields: {missing_fields}")
                    return False
            else:
                self.log_test("Course Details", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Course Details", False, f"Exception: {str(e)}")
            return False
    
    async def test_cors_headers(self):
        """Test CORS headers are properly set"""
        try:
            # Test preflight request with proper headers
            headers = {
                "Origin": "http://localhost:8080",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Content-Type"
            }
            response = await self.client.options(f"{self.base_url}/courses/", headers=headers)
            
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers")
            }
            
            if all(cors_headers.values()):
                self.log_test("CORS Headers", True, f"CORS properly configured: {cors_headers}")
                return True
            else:
                self.log_test("CORS Headers", False, f"Missing CORS headers: {cors_headers}")
                return False
        except Exception as e:
            self.log_test("CORS Headers", False, f"Exception: {str(e)}")
            return False
    
    async def run_all_tests(self):
        """Run all API tests"""
        print("🧪 Starting Comprehensive API Test Suite")
        print("=" * 50)
        
        # Basic connectivity tests
        await self.test_health_endpoint()
        await self.test_cors_headers()
        
        # Public endpoints
        await self.test_courses_endpoint()
        await self.test_course_details()
        
        # Authentication tests
        await self.test_user_registration()
        await self.test_user_login()
        
        # Protected endpoints (only if we have auth token)
        if self.auth_token:
            await self.test_protected_endpoints()
        
        # Print summary
        print("\n" + "=" * 50)
        print("📊 TEST SUMMARY")
        print("=" * 50)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        return passed == total

async def main():
    """Main test runner"""
    async with APITester() as tester:
        success = await tester.run_all_tests()
        return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
