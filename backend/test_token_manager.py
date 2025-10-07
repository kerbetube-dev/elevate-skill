#!/usr/bin/env python3
"""
Test token manager directly
"""

import sys
import os

# Add the backend directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from token_manager import token_manager

def test_token_manager():
    """Test token manager"""
    print("=== TESTING TOKEN MANAGER ===")
    
    try:
        # Test user data
        user_data = {
            'id': 'test-user-id',
            'email': 'test@example.com',
            'role': 'student',
            'permissions': []
        }
        
        print("Creating token pair...")
        access_token, refresh_token, token_info = token_manager.create_token_pair(user_data)
        
        print("Token pair created successfully!")
        print(f"Access token length: {len(access_token)}")
        print(f"Refresh token length: {len(refresh_token)}")
        print(f"Token info keys: {list(token_info.keys())}")
        print(f"Expires in: {token_info['expires_in']} seconds")
        
        # Test token verification
        print("\nTesting token verification...")
        payload = token_manager.verify_access_token(access_token)
        print(f"Token verified successfully! User: {payload.get('sub')}")
        
    except Exception as e:
        print(f"Token manager test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_token_manager()
