#!/usr/bin/env python3
"""
Simple migration runner for withdrawal system
"""
import asyncio
import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from database.connection import get_async_session
from sqlalchemy import text

async def run_migration():
    """Run the withdrawal system migration"""
    
    migration_sql = """
    -- Withdrawal System Migration
    -- Create withdrawal_requests table

    CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
        account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('CBE', 'TeleBirr')),
        account_number VARCHAR(50) NOT NULL,
        account_holder_name VARCHAR(100) NOT NULL,
        phone_number VARCHAR(20),
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        admin_notes TEXT,
        rejection_reason TEXT,
        processed_at TIMESTAMP WITH TIME ZONE,
        processed_by UUID REFERENCES admin_users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_user_id ON withdrawal_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
    CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_created_at ON withdrawal_requests(created_at);

    -- Create trigger for updated_at
    CREATE OR REPLACE FUNCTION update_withdrawal_requests_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    CREATE TRIGGER update_withdrawal_requests_updated_at
        BEFORE UPDATE ON withdrawal_requests
        FOR EACH ROW
        EXECUTE FUNCTION update_withdrawal_requests_updated_at();

    -- Add total_earnings column to users table if it doesn't exist
    DO $$ 
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'users' AND column_name = 'total_earnings') THEN
            ALTER TABLE users ADD COLUMN total_earnings DECIMAL(10,2) DEFAULT 0.0 CHECK (total_earnings >= 0);
        END IF;
    END $$;

    -- Update existing users to have 0 earnings if NULL
    UPDATE users SET total_earnings = 0.0 WHERE total_earnings IS NULL;
    """
    
    try:
        async with get_async_session() as session:
            # Execute the entire migration as one block
            print("Executing withdrawal system migration...")
            await session.execute(text(migration_sql))
            await session.commit()
            print("✅ Withdrawal system migration completed successfully!")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = asyncio.run(run_migration())
    sys.exit(0 if success else 1)
