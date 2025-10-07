/*
  # Payment Approval System Migration
  
  This migration adds:
  1. Payment status tracking to enrollments
  2. Payment requests table for admin approval
  3. Admin users table for admin authentication
  4. Updates to referral system
*/

-- Add payment status to enrollments table
ALTER TABLE enrollments 
ADD COLUMN payment_status TEXT DEFAULT 'pending' 
CHECK (payment_status IN ('pending', 'approved', 'rejected'));

-- Add admin notes to enrollments
ALTER TABLE enrollments 
ADD COLUMN admin_notes TEXT;

-- Add approval tracking to enrollments
ALTER TABLE enrollments 
ADD COLUMN approved_at TIMESTAMPTZ,
ADD COLUMN approved_by UUID REFERENCES users(id);

-- Create payment_requests table for detailed payment tracking
CREATE TABLE IF NOT EXISTS payment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  payment_method_id UUID NOT NULL REFERENCES payment_methods(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES users(id),
  rejection_reason TEXT
);

-- Create admin_users table for admin authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Update referrals table to link with payment requests
ALTER TABLE referrals 
ADD COLUMN payment_request_id UUID REFERENCES payment_requests(id),
ALTER COLUMN status SET DEFAULT 'pending',
ALTER COLUMN reward_earned SET DEFAULT 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrollments_payment_status ON enrollments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id ON payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created_at ON payment_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_referrals_payment_request_id ON referrals(payment_request_id);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (email, password, full_name, role) 
VALUES (
  'admin@elevateskill.com', 
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', -- SHA256 of 'admin123'
  'System Administrator', 
  'super_admin'
) ON CONFLICT (email) DO NOTHING;

-- Update existing enrollments to have 'approved' status (since they were already processed)
UPDATE enrollments 
SET payment_status = 'approved', 
    approved_at = enrolled_at,
    approved_by = (SELECT id FROM admin_users LIMIT 1)
WHERE payment_status = 'pending';

-- Update existing referrals to have 'pending' status (they need to be re-evaluated)
UPDATE referrals 
SET status = 'pending', 
    reward_earned = 0
WHERE status = 'completed';

-- Add RLS policies for new tables
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Payment requests: Only admins can read all, users can read their own
CREATE POLICY "Admins can read all payment requests" ON payment_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = current_setting('request.jwt.claims', true)::json->>'email'
    )
  );

CREATE POLICY "Users can read own payment requests" ON payment_requests
  FOR SELECT USING (
    user_id::text = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Admin users: Only super admins can manage
CREATE POLICY "Super admins can manage admin users" ON admin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.email = current_setting('request.jwt.claims', true)::json->>'email'
      AND admin_users.role = 'super_admin'
    )
  );
