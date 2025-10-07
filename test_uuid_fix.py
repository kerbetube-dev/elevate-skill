#!/usr/bin/env python3
"""
Test script to debug UUID conversion issue
"""

import asyncio
import sys
sys.path.append('/home/jovanijo/Documents/All_projects/skill-flow-projects/elavate-skill/backend')
from database.operations import DatabaseOperations

async def test_uuid_conversion():
    """Test UUID conversion in database operations"""
    
    print("🔍 Testing UUID conversion in database operations...")
    
    db_ops = DatabaseOperations()
    
    try:
        # Test the exact method called by the API
        requests = await db_ops.get_payment_requests()
        
        print(f"Found {len(requests)} payment requests:")
        for i, req in enumerate(requests, 1):
            print(f"\n{i}. ID: {req.get('id')}")
            print(f"   Status: {req.get('status')}")
            print(f"   Approved By: {req.get('approved_by')} (type: {type(req.get('approved_by'))})")
            
            # Test the conversion logic from the route
            approved_by_value = req.get("approved_by")
            converted_value = str(approved_by_value) if approved_by_value else None
            print(f"   Converted: {converted_value} (type: {type(converted_value)})")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_uuid_conversion())
