#!/usr/bin/env python3
"""
Debug script to test the exact database query
"""

import asyncio
import sys
sys.path.append('/home/jovanijo/Documents/All_projects/skill-flow-projects/elavate-skill/backend')
from database.connection import get_async_session
from sqlalchemy import text

async def debug_database_query():
    """Debug the exact database query used in get_payment_requests"""
    
    print("🔍 Debugging exact database query...")
    
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
            rows = await session.execute(text(query))
            results = []
            for row in rows.mappings().all():
                result_dict = dict(row)
                print(f"Raw result: approved_by = {result_dict.get('approved_by')} (type: {type(result_dict.get('approved_by'))})")
                
                # Test the conversion logic
                if 'approved_by' in result_dict and result_dict['approved_by'] is not None:
                    converted = str(result_dict['approved_by'])
                    print(f"  Converted: {converted} (type: {type(converted)})")
                    result_dict['approved_by'] = converted
                
                results.append(result_dict)
                
                if len(results) >= 2:  # Only test first 2 records
                    break
            
            print(f"\nFinal results:")
            for i, result in enumerate(results):
                print(f"Result {i}: approved_by = {result.get('approved_by')} (type: {type(result.get('approved_by'))})")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_database_query())
