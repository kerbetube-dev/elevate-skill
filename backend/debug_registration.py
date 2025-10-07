#!/usr/bin/env python3
"""
Debug registration endpoint
"""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from routes.auth import register
from models import UserRegister

async def debug_registration():
    """Debug registration endpoint"""
    print("=== DEBUGGING REGISTRATION ===")
    
    try:
        # Create test user data with unique email
        import time
        user_data = UserRegister(
            email=f"debuguser{int(time.time())}@example.com",
            password="MyPass12",
            fullName="Debug User"
        )
        
        print(f"Testing registration for: {user_data.email}")
        print(f"Password: {user_data.password}")
        print(f"Full name: {user_data.fullName}")
        
        # Call the registration function directly
        result = await register(user_data)
        
        print("Registration successful!")
        print(f"Result type: {type(result)}")
        print(f"Result: {result}")
        
    except Exception as e:
        print(f"Registration failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_registration())
