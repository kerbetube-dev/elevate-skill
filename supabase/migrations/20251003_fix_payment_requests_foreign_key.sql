-- Fix foreign key constraint for payment_requests.approved_by
-- This migration updates the foreign key to reference admin_users instead of users

-- First, drop the existing foreign key constraint
ALTER TABLE payment_requests 
DROP CONSTRAINT IF EXISTS payment_requests_approved_by_fkey;

-- Add the new foreign key constraint that references admin_users table
ALTER TABLE payment_requests 
ADD CONSTRAINT payment_requests_approved_by_fkey 
FOREIGN KEY (approved_by) REFERENCES admin_users(id);

-- Also fix the enrollments table if it has the same issue
ALTER TABLE enrollments 
DROP CONSTRAINT IF EXISTS enrollments_approved_by_fkey;

ALTER TABLE enrollments 
ADD CONSTRAINT enrollments_approved_by_fkey 
FOREIGN KEY (approved_by) REFERENCES admin_users(id);

-- Update any existing NULL values to reference the default admin user
-- First, let's get the admin user ID (assuming there's at least one admin)
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

-- Add a comment to document the change
COMMENT ON COLUMN payment_requests.approved_by IS 'References admin_users.id - the admin who approved/rejected this payment request';
COMMENT ON COLUMN enrollments.approved_by IS 'References admin_users.id - the admin who approved this enrollment';
