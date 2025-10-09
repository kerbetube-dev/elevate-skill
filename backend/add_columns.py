#!/usr/bin/env python3
"""
Add outcomes and curriculum columns to courses table
"""

import asyncio
from database.connection import get_async_session
from sqlalchemy import text

async def add_columns():
    """Add outcomes and curriculum columns to courses table"""
    async with get_async_session() as session:
        try:
            # Check if columns exist first
            result = await session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'courses' AND column_name IN ('outcomes', 'curriculum')
            """))
            existing_columns = [row[0] for row in result.fetchall()]
            
            if 'outcomes' not in existing_columns:
                await session.execute(text("""
                    ALTER TABLE courses 
                    ADD COLUMN outcomes JSONB DEFAULT '[]'::jsonb
                """))
                print("✅ Added outcomes column")
            else:
                print("ℹ️  outcomes column already exists")
            
            if 'curriculum' not in existing_columns:
                await session.execute(text("""
                    ALTER TABLE courses 
                    ADD COLUMN curriculum JSONB DEFAULT '[]'::jsonb
                """))
                print("✅ Added curriculum column")
            else:
                print("ℹ️  curriculum column already exists")
            
            await session.commit()
            print("✅ Successfully added columns to courses table")
            
        except Exception as e:
            print(f"❌ Error adding columns: {e}")
            await session.rollback()
            raise

if __name__ == "__main__":
    asyncio.run(add_columns())
