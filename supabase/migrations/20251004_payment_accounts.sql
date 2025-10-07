-- ================================================
-- Payment System Redesign Migration
-- ================================================

-- 1. Create admin_payment_accounts table
-- This stores the payment accounts configured by admin
CREATE TABLE IF NOT EXISTS admin_payment_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL, -- 'CBE', 'TeleBirr', 'Commercial Bank', 'Other'
    account_name VARCHAR(255) NOT NULL, -- Account holder name
    account_number VARCHAR(100) NOT NULL, -- Account/phone number
    bank_name VARCHAR(255), -- Bank name if applicable
    instructions TEXT, -- Additional payment instructions
    qr_code_url TEXT, -- Optional QR code for TeleBirr, etc.
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0, -- Order to display payment methods
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Drop old payment_methods table if it exists
DROP TABLE IF EXISTS payment_methods CASCADE;

-- 3. Update payment_requests table structure
-- First, check if we need to recreate it
DO $$ 
BEGIN
    -- Drop the old table and recreate with correct structure
    DROP TABLE IF EXISTS payment_requests CASCADE;
    
    CREATE TABLE payment_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
        payment_account_id UUID NOT NULL REFERENCES admin_payment_accounts(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        transaction_screenshot_url TEXT NOT NULL, -- S3 URL or file path
        transaction_reference VARCHAR(255), -- User provided reference number
        status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
        admin_notes TEXT,
        rejection_reason TEXT,
        approved_by UUID REFERENCES admin_users(id),
        approved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
END $$;

-- 4. Create enrollments table (for approved courses)
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    payment_request_id UUID REFERENCES payment_requests(id),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 0, -- 0-100
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, course_id) -- One enrollment per user per course
);

-- 5. Create referral_earnings table (track referral bonuses)
CREATE TABLE IF NOT EXISTS referral_earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    bonus_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, paid
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_requests_user ON payment_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_course ON payment_requests(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referrer ON referral_earnings(referrer_id);
CREATE INDEX IF NOT EXISTS idx_admin_payment_accounts_active ON admin_payment_accounts(is_active);

-- 7. Insert default admin payment accounts (example data)
INSERT INTO admin_payment_accounts (type, account_name, account_number, bank_name, instructions, is_active, display_order)
VALUES 
    ('CBE', 'ElevateSkill Academy', '1000123456789', 'Commercial Bank of Ethiopia', 'Transfer to this account and upload the receipt', true, 1),
    ('TeleBirr', 'ElevateSkill Support', '0911234567', NULL, 'Send payment via TeleBirr to this number', true, 2)
ON CONFLICT DO NOTHING;

-- 8. Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_payment_accounts_updated_at BEFORE UPDATE ON admin_payment_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_requests_updated_at BEFORE UPDATE ON payment_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Grant permissions
GRANT ALL ON admin_payment_accounts TO postgres;
GRANT ALL ON payment_requests TO postgres;
GRANT ALL ON enrollments TO postgres;
GRANT ALL ON referral_earnings TO postgres;

