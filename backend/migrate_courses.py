#!/usr/bin/env python3
"""
Migration script to add outcomes and curriculum fields to courses table
"""

import asyncio
from database.connection import get_async_session
from sqlalchemy import text

async def migrate_courses():
    """Add outcomes and curriculum columns to courses table"""
    async with get_async_session() as session:
        try:
            # Add outcomes column (JSON array)
            await session.execute(text("""
                ALTER TABLE courses 
                ADD COLUMN IF NOT EXISTS outcomes JSONB DEFAULT '[]'::jsonb
            """))
            
            # Add curriculum column (JSON array)
            await session.execute(text("""
                ALTER TABLE courses 
                ADD COLUMN IF NOT EXISTS curriculum JSONB DEFAULT '[]'::jsonb
            """))
            
            await session.commit()
            print("✅ Successfully added outcomes and curriculum columns to courses table")
            
        except Exception as e:
            print(f"❌ Error adding columns: {e}")
            await session.rollback()
            raise

if __name__ == "__main__":
    asyncio.run(migrate_courses())
