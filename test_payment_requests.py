#!/usr/bin/env python3
"""
Test script to debug payment requests API
"""

import asyncio
import sys
sys.path.append('/home/jovanijo/Documents/All_projects/skill-flow-projects/elavate-skill/backend')
from database.operations import DatabaseOperations

async def test_payment_requests():
    """Test payment requests method directly"""
    
    print("🔍 Testing payment requests method directly...")
    
    db_ops = DatabaseOperations()
    
    try:
        # Test the exact method called by the API
        requests = await db_ops.get_payment_requests()
        
        print(f"Found {len(requests)} payment requests:")
        for i, req in enumerate(requests, 1):
            print(f"\n{i}. ID: {req.get('id')}")
            print(f"   Status: {req.get('status')}")
            print(f"   Approved By: {req.get('approved_by')} (type: {type(req.get('approved_by'))})")
            print(f"   Created At: {req.get('created_at')}")
            print(f"   Approved At: {req.get('approved_at')}")
            
            # Check if approved_by is properly converted
            if req.get('approved_by'):
                try:
                    converted = str(req['approved_by'])
                    print(f"   Converted: {converted} (type: {type(converted)})")
                except Exception as e:
                    print(f"   Conversion error: {e}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_payment_requests())
