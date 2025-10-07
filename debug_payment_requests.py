#!/usr/bin/env python3
"""
Debug script to check payment requests in the database
"""

import asyncio
import sys
sys.path.append('/home/jovanijo/Documents/All_projects/skill-flow-projects/elavate-skill/backend')
from database.connection import get_async_session
from sqlalchemy import text

async def debug_payment_requests():
    """Debug payment requests data"""
    
    print("🔍 Debugging payment requests data...")
    
    query = """
    SELECT pr.*, u.full_name, u.email, c.title as course_title, pm.type as payment_type, pm.account_number
    FROM payment_requests pr
    JOIN users u ON pr.user_id = u.id
    JOIN courses c ON pr.course_id = c.id
    JOIN payment_methods pm ON pr.payment_method_id = pm.id
    ORDER BY pr.created_at DESC
    """
    
    try:
        async with get_async_session() as session:
            result = await session.execute(text(query))
            rows = result.mappings().all()
            
            print(f"Found {len(rows)} payment requests:")
            for i, row in enumerate(rows, 1):
                print(f"\n{i}. ID: {row['id']}")
                print(f"   Status: {row['status']}")
                print(f"   Approved By: {row['approved_by']} (type: {type(row['approved_by'])})")
                print(f"   Created At: {row['created_at']}")
                print(f"   Approved At: {row['approved_at']}")
                
                # Check if approved_by is a UUID that needs conversion
                if row['approved_by']:
                    try:
                        converted = str(row['approved_by'])
                        print(f"   Converted: {converted} (type: {type(converted)})")
                    except Exception as e:
                        print(f"   Conversion error: {e}")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(debug_payment_requests())
