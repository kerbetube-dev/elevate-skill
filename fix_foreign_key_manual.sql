-- Manual SQL script to fix foreign key constraint issue
-- Run this script in your PostgreSQL database (Supabase SQL Editor)

-- Step 1: Drop existing foreign key constraints
ALTER TABLE payment_requests 
DROP CONSTRAINT IF EXISTS payment_requests_approved_by_fkey;

ALTER TABLE enrollments 
DROP CONSTRAINT IF EXISTS enrollments_approved_by_fkey;

-- Step 2: Add new foreign key constraints that reference admin_users
ALTER TABLE payment_requests 
ADD CONSTRAINT payment_requests_approved_by_fkey 
FOREIGN KEY (approved_by) REFERENCES admin_users(id);

ALTER TABLE enrollments 
ADD CONSTRAINT enrollments_approved_by_fkey 
FOREIGN KEY (approved_by) REFERENCES admin_users(id);

-- Step 3: Update existing NULL values to reference the default admin user
-- This will set any existing approved/rejected records to reference the admin user
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

-- Step 4: Add comments to document the change
COMMENT ON COLUMN payment_requests.approved_by IS 'References admin_users.id - the admin who approved/rejected this payment request';
COMMENT ON COLUMN enrollments.approved_by IS 'References admin_users.id - the admin who approved this enrollment';

-- Step 5: Verify the changes
SELECT 
    'payment_requests' as table_name,
    COUNT(*) as total_records,
    COUNT(approved_by) as records_with_approved_by
FROM payment_requests
UNION ALL
SELECT 
    'enrollments' as table_name,
    COUNT(*) as total_records,
    COUNT(approved_by) as records_with_approved_by
FROM enrollments;

-- Step 6: Show the foreign key constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('payment_requests', 'enrollments')
  AND kcu.column_name = 'approved_by';
