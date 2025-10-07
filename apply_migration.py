#!/usr/bin/env python3
"""
Script to apply the foreign key constraint fix migration
Run this script to fix the payment_requests.approved_by foreign key constraint
"""

import asyncio
import os
import sys
sys.path.append('/home/jovanijo/Documents/All_projects/skill-flow-projects/elavate-skill/backend')
from database.connection import get_async_session
from sqlalchemy import text

async def apply_migration():
    """Apply the foreign key constraint fix migration"""
    
    print("🔧 Applying foreign key constraint fix migration...")
    
    migration_sql = """
    -- Drop existing foreign key constraints
    ALTER TABLE payment_requests 
    DROP CONSTRAINT IF EXISTS payment_requests_approved_by_fkey;
    
    ALTER TABLE enrollments 
    DROP CONSTRAINT IF EXISTS enrollments_approved_by_fkey;
    
    -- Add new foreign key constraints that reference admin_users
    ALTER TABLE payment_requests 
    ADD CONSTRAINT payment_requests_approved_by_fkey 
    FOREIGN KEY (approved_by) REFERENCES admin_users(id);
    
    ALTER TABLE enrollments 
    ADD CONSTRAINT enrollments_approved_by_fkey 
    FOREIGN KEY (approved_by) REFERENCES admin_users(id);
    
    -- Update existing NULL values to reference the default admin user
    UPDATE payment_requests 
    SET approved_by = (
        SELECT id FROM admin_users 
        WHERE role = 'super_admin' 
        ORDER BY created_at ASC 
        LIMIT 1
    )
    WHERE approved_by IS NULL AND status IN ('approved', 'rejected');
    
    UPDATE enrollments 
    SET approved_by = (
        SELECT id FROM admin_users 
        WHERE role = 'super_admin' 
        ORDER BY created_at ASC 
        LIMIT 1
    )
    WHERE approved_by IS NULL AND payment_status = 'approved';
    """
    
    try:
        async with get_async_session() as session:
            # Split the migration into individual statements
            statements = [stmt.strip() for stmt in migration_sql.split(';') if stmt.strip()]
            
            for i, statement in enumerate(statements, 1):
                if statement:
                    print(f"  Executing statement {i}/{len(statements)}...")
                    await session.execute(text(statement))
            
            await session.commit()
            print("✅ Migration applied successfully!")
            print("✅ Foreign key constraints now reference admin_users table")
            print("✅ Existing records updated to reference admin user")
            
    except Exception as e:
        print(f"❌ Error applying migration: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(apply_migration())
