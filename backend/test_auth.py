#!/usr/bin/env python3
"""
Simple test script to debug authentication issues
"""

import asyncio
import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.operations import db_ops
from secure_auth import secure_auth

async def test_auth():
    """Test authentication functions"""
    print("=== TESTING AUTHENTICATION SYSTEM ===")
    
    # Test password hashing
    print("\n1. Testing password hashing...")
    password = "MyPass12"
    hashed = secure_auth.hash_password(password)
    print(f"Password: {password}")
    print(f"Hashed: {hashed[:50]}...")
    print(f"Hash length: {len(hashed)}")
    
    # Test password verification
    print("\n2. Testing password verification...")
    is_valid = secure_auth.verify_password(password, hashed)
    print(f"Password verification: {is_valid}")
    
    # Test user creation
    print("\n3. Testing user creation...")
    try:
        user_data = {
            "fullName": "Test User",
            "email": f"test{asyncio.get_event_loop().time()}@example.com",
            "password": hashed
        }
        
        # Check if user exists
        existing_user = await db_ops.get_user_by_email(user_data["email"])
        if existing_user:
            print("User already exists, skipping creation...")
            print(f"Existing user: {existing_user['email']}")
            retrieved_user = existing_user
        else:
            # Create new user
            new_user = await db_ops.create_user(user_data)
            print(f"User created successfully: {new_user['id']}")
            
            # Test user retrieval
            retrieved_user = await db_ops.get_user_by_email(user_data["email"])
            print(f"User retrieved: {retrieved_user['email']}")
        
        # Test authentication
        print("\n4. Testing authentication...")
        from auth import authenticate_user
        auth_user = await authenticate_user(user_data["email"], password)
        if auth_user:
            print("Authentication successful!")
            print(f"Authenticated user: {auth_user['email']}")
        else:
            print("Authentication failed!")
            
    except Exception as e:
        print(f"Error during user creation: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_auth())
