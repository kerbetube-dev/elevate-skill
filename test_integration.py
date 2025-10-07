#!/usr/bin/env python3
"""
End-to-End Integration Test Suite
Tests complete frontend-backend integration with real API calls
"""

import asyncio
import json
import subprocess
import time
import sys
import os
from typing import Dict, Any
import httpx
from datetime import datetime

class IntegrationTester:
    def __init__(self):
        self.backend_url = "http://localhost:8002"
        self.frontend_url = "http://localhost:8080"
        self.client = httpx.AsyncClient(timeout=30.0)
        self.test_results = []
        self.auth_token = None
        self.user_id = None
        
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
    
    async def check_backend_health(self):
        """Check if backend is running and healthy"""
        try:
            response = await self.client.get(f"{self.backend_url}/health")
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy":
                    self.log_test("Backend Health", True, "Backend is running and healthy")
                    return True
                else:
                    self.log_test("Backend Health", False, f"Backend unhealthy: {data}")
                    return False
            else:
                self.log_test("Backend Health", False, f"Backend returned status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Backend Health", False, f"Cannot connect to backend: {str(e)}")
            return False
    
    async def check_frontend_accessibility(self):
        """Check if frontend is accessible"""
        try:
            response = await self.client.get(self.frontend_url)
            if response.status_code == 200:
                self.log_test("Frontend Accessibility", True, "Frontend is accessible")
                return True
            else:
                self.log_test("Frontend Accessibility", False, f"Frontend returned status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Frontend Accessibility", False, f"Cannot access frontend: {str(e)}")
            return False
    
    async def test_cors_configuration(self):
        """Test CORS configuration between frontend and backend"""
        try:
            # Test preflight request from frontend origin
            headers = {
                "Origin": self.frontend_url,
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Content-Type"
            }
            
            response = await self.client.options(f"{self.backend_url}/courses/", headers=headers)
            
            if response.status_code == 200:
                cors_origin = response.headers.get("Access-Control-Allow-Origin")
                cors_methods = response.headers.get("Access-Control-Allow-Methods")
                cors_headers = response.headers.get("Access-Control-Allow-Headers")
                
                if cors_origin and cors_methods and cors_headers:
                    self.log_test("CORS Configuration", True, f"CORS properly configured for {cors_origin}")
                    return True
                else:
                    self.log_test("CORS Configuration", False, f"Missing CORS headers: origin={cors_origin}, methods={cors_methods}, headers={cors_headers}")
                    return False
            else:
                self.log_test("CORS Configuration", False, f"Preflight request failed with status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("CORS Configuration", False, f"CORS test failed: {str(e)}")
            return False
    
    async def test_user_registration_flow(self):
        """Test complete user registration flow"""
        try:
            unique_email = f"integration_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com"
            
            registration_data = {
                "fullName": "Integration Test User",
                "email": unique_email,
                "password": "TestPass123!"
            }
            
            response = await self.client.post(
                f"{self.backend_url}/auth/register",
                json=registration_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if "user" in data and ("token" in data or "access_token" in data):
                    self.auth_token = data.get("token") or data.get("access_token")
                    self.user_id = data["user"]["id"]
                    self.log_test("User Registration Flow", True, f"User registered successfully: {data['user']['email']}")
                    return True
                else:
                    self.log_test("User Registration Flow", False, f"Invalid response structure: {data}")
                    return False
            else:
                error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text
                self.log_test("User Registration Flow", False, f"Registration failed: {response.status_code} - {error_data}")
                return False
        except Exception as e:
            self.log_test("User Registration Flow", False, f"Registration exception: {str(e)}")
            return False
    
    async def test_user_login_flow(self):
        """Test complete user login flow"""
        try:
            # First register a user
            unique_email = f"login_integration_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com"
            
            registration_data = {
                "fullName": "Login Test User",
                "email": unique_email,
                "password": "TestPass123!"
            }
            
            reg_response = await self.client.post(
                f"{self.backend_url}/auth/register",
                json=registration_data
            )
            
            if reg_response.status_code != 200:
                self.log_test("User Login Flow", False, f"Registration failed: {reg_response.status_code}")
                return False
            
            # Now test login
            login_data = {
                "email": unique_email,
                "password": "TestPass123!"
            }
            
            response = await self.client.post(
                f"{self.backend_url}/auth/login",
                json=login_data
            )
            
            if response.status_code == 200:
                data = response.json()
                if "user" in data and ("token" in data or "access_token" in data):
                    self.auth_token = data.get("token") or data.get("access_token")
                    self.user_id = data["user"]["id"]
                    self.log_test("User Login Flow", True, f"Login successful: {data['user']['email']}")
                    return True
                else:
                    self.log_test("User Login Flow", False, f"Invalid login response: {data}")
                    return False
            else:
                error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else response.text
                self.log_test("User Login Flow", False, f"Login failed: {response.status_code} - {error_data}")
                return False
        except Exception as e:
            self.log_test("User Login Flow", False, f"Login exception: {str(e)}")
            return False
    
    async def test_courses_api_integration(self):
        """Test courses API integration"""
        try:
            response = await self.client.get(f"{self.backend_url}/courses/")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    course = data[0]
                    required_fields = ["id", "title", "description", "price", "duration", "instructor"]
                    missing_fields = [field for field in required_fields if field not in course]
                    
                    if not missing_fields:
                        self.log_test("Courses API Integration", True, f"Retrieved {len(data)} courses with all required fields")
                        return True
                    else:
                        self.log_test("Courses API Integration", False, f"Missing fields in course data: {missing_fields}")
                        return False
                else:
                    self.log_test("Courses API Integration", False, "No courses returned or invalid format")
                    return False
            else:
                self.log_test("Courses API Integration", False, f"Courses API returned status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Courses API Integration", False, f"Courses API exception: {str(e)}")
            return False
    
    async def test_dashboard_api_integration(self):
        """Test dashboard API integration with authentication"""
        if not self.auth_token:
            self.log_test("Dashboard API Integration", False, "No auth token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test dashboard stats
            response = await self.client.get(f"{self.backend_url}/dashboard/stats", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                # Check for either the expected format or the actual format returned
                if "totalCourses" in data or "coursesEnrolled" in data:
                    self.log_test("Dashboard API Integration", True, f"Dashboard stats retrieved: {data}")
                    return True
                else:
                    self.log_test("Dashboard API Integration", False, f"Unexpected stats format: {data}")
                    return False
            else:
                self.log_test("Dashboard API Integration", False, f"Dashboard API returned status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Dashboard API Integration", False, f"Dashboard API exception: {str(e)}")
            return False
    
    async def test_user_profile_api_integration(self):
        """Test user profile API integration"""
        if not self.auth_token:
            self.log_test("User Profile API Integration", False, "No auth token available")
            return False
        
        try:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            
            # Test user profile
            response = await self.client.get(f"{self.backend_url}/user/profile", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if "user" in data and "id" in data["user"] and "email" in data["user"]:
                    self.log_test("User Profile API Integration", True, f"User profile retrieved: {data['user']['email']}")
                    return True
                else:
                    self.log_test("User Profile API Integration", False, f"Invalid profile data: {data}")
                    return False
            else:
                self.log_test("User Profile API Integration", False, f"Profile API returned status {response.status_code}")
                return False
        except Exception as e:
            self.log_test("User Profile API Integration", False, f"Profile API exception: {str(e)}")
            return False
    
    async def test_database_connectivity(self):
        """Test database connectivity through API"""
        try:
            # Test by creating a user and checking if it persists
            unique_email = f"db_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}@example.com"
            
            registration_data = {
                "fullName": "Database Test User",
                "email": unique_email,
                "password": "TestPass123!"
            }
            
            # Register user
            reg_response = await self.client.post(
                f"{self.backend_url}/auth/register",
                json=registration_data
            )
            
            if reg_response.status_code != 200:
                self.log_test("Database Connectivity", False, f"User registration failed: {reg_response.status_code}")
                return False
            
            # Try to login with the same credentials
            login_data = {
                "email": unique_email,
                "password": "TestPass123!"
            }
            
            login_response = await self.client.post(
                f"{self.backend_url}/auth/login",
                json=login_data
            )
            
            if login_response.status_code == 200:
                self.log_test("Database Connectivity", True, "User data persisted in database")
                return True
            else:
                self.log_test("Database Connectivity", False, f"User login failed after registration: {login_response.status_code}")
                return False
        except Exception as e:
            self.log_test("Database Connectivity", False, f"Database test exception: {str(e)}")
            return False
    
    async def test_error_handling(self):
        """Test error handling across the system"""
        try:
            # Test invalid login credentials
            invalid_login_data = {
                "email": "nonexistent@example.com",
                "password": "wrongpassword"
            }
            
            response = await self.client.post(
                f"{self.backend_url}/auth/login",
                json=invalid_login_data
            )
            
            if response.status_code == 401:
                self.log_test("Error Handling", True, "Invalid credentials properly rejected")
                return True
            else:
                self.log_test("Error Handling", False, f"Expected 401 for invalid credentials, got {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Error Handling", False, f"Error handling test exception: {str(e)}")
            return False
    
    async def run_all_tests(self):
        """Run all integration tests"""
        print("🧪 Starting End-to-End Integration Test Suite")
        print("=" * 60)
        
        # Basic connectivity tests
        await self.check_backend_health()
        await self.check_frontend_accessibility()
        await self.test_cors_configuration()
        
        # API integration tests
        await self.test_courses_api_integration()
        await self.test_database_connectivity()
        await self.test_error_handling()
        
        # Authentication flow tests
        await self.test_user_registration_flow()
        await self.test_user_login_flow()
        
        # Protected endpoint tests (only if we have auth token)
        if self.auth_token:
            await self.test_user_profile_api_integration()
            await self.test_dashboard_api_integration()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 INTEGRATION TEST SUMMARY")
        print("=" * 60)
        
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
    """Main integration test runner"""
    async with IntegrationTester() as tester:
        success = await tester.run_all_tests()
        return 0 if success else 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
