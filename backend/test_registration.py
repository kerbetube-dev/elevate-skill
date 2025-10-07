#!/usr/bin/env python3
"""
Test registration endpoint directly
"""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routes.auth import register
from models import UserRegister

async def test_registration():
    """Test registration endpoint"""
    print("=== TESTING REGISTRATION ENDPOINT ===")
    
    try:
        # Create test user data with unique email
        import time
        user_data = UserRegister(
            email=f"testuser{int(time.time())}@example.com",
            password="MyPass12",
            fullName="Test User"
        )
        
        print(f"Testing registration for: {user_data.email}")
        
        # Call the registration function directly
        result = await register(user_data)
        
        print("Registration successful!")
        print(f"Access token length: {len(result['access_token'])}")
        print(f"Refresh token length: {len(result['refresh_token'])}")
        print(f"Token type: {result['token_type']}")
        print(f"Expires in: {result['expires_in']} seconds")
        print(f"User: {result['user']['email']}")
        
    except Exception as e:
        print(f"Registration failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_registration())
