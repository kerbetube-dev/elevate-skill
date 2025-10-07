# 🔄 Payment System Redesign

## 📋 Overview

The payment system has been redesigned to implement the correct workflow where:

1. **Admin** configures payment accounts (CBE, TeleBirr, other banks)
2. **User** clicks "Enroll" on a course → Redirected to payment page
3. **Payment Page** displays admin's payment accounts
4. **User** pays to one account and uploads transaction screenshot
5. **Admin** reviews and approves/rejects the payment
6. Upon **approval**:
   - User is enrolled in the course (added to "My Courses")
   - If referred, referrer gets bonus

---

## ✅ Completed Tasks

### 1. **Database Schema** ✅

- ✅ Created `admin_payment_accounts` table
- ✅ Updated `payment_requests` table structure
- ✅ Created `enrollments` table
- ✅ Created `referral_earnings` table
- ✅ Added indexes for performance
- ✅ Added default payment accounts

**Migration file**: `supabase/migrations/20251004_payment_accounts.sql`

### 2. **Backend Models** ✅

Created new Pydantic models in `backend/models.py`:

- ✅ `AdminPaymentAccountCreate`
- ✅ `AdminPaymentAccountUpdate`
- ✅ `AdminPaymentAccountResponse`
- ✅ `PaymentRequestCreate` (updated)
- ✅ `PaymentRequestResponse` (updated)
- ✅ `EnrollmentResponse`
- ✅ `ReferralEarningResponse`
- ✅ Updated `PaymentType` enum with more banks

### 3. **Backend API Routes** ✅

Created two new route files:

#### **`routes/payment_accounts.py`** ✅

Admin can manage payment accounts:

- `GET /payment-accounts/` - List all payment accounts
- `GET /payment-accounts/{id}` - Get specific account
- `POST /payment-accounts/` - Create new account (Admin only)
- `PUT /payment-accounts/{id}` - Update account (Admin only)
- `DELETE /payment-accounts/{id}` - Delete account (Admin only)

#### **`routes/payments.py`** ✅

Payment and enrollment flow:

- `POST /payments/upload-screenshot` - Upload transaction image
- `POST /payments/requests` - Create payment request
- `GET /payments/requests/my` - Get user's payment requests
- `GET /payments/requests/{id}` - Get specific payment request
- `POST /payments/requests/{id}/approve` - Approve payment (Admin, triggers
  enrollment + referral)
- `POST /payments/requests/{id}/reject` - Reject payment (Admin)
- `GET /payments/enrollments/my` - Get user's enrollments ("My Courses")
- `GET /payments/enrollments/{course_id}/check` - Check if enrolled

---

## 🚧 Remaining Tasks

### 4. **Database Operations** 🔄 IN PROGRESS

Need to implement in `backend/database/operations.py`:

- `get_payment_accounts(active_only)`
- `get_payment_account_by_id(account_id)`
- `create_payment_account(data)`
- `update_payment_account(account_id, data)`
- `delete_payment_account(account_id)`
- `create_payment_request(data)`
- `get_user_payment_requests(user_id)`
- `get_payment_request_by_id(request_id)`
- `get_user_payment_for_course(user_id, course_id)`
- `approve_payment_and_enroll(request_id, admin_id, admin_notes)` ⚠️
  **CRITICAL**
- `reject_payment_request(request_id, admin_id, rejection_reason)`
- `get_user_enrollments(user_id)`
- `is_user_enrolled(user_id, course_id)`
- `create_referral_earning(referrer_id, referred_user_id, enrollment_id, course_id, bonus_amount)`

### 5. **Backend Integration** ⏳ PENDING

- Register new routes in `app.py`
- Configure file upload settings
- Set up static file serving for uploads

### 6. **Frontend - Admin Panel** ⏳ PENDING

Create admin payment account management UI:

- List payment accounts
- Add new payment account
- Edit/delete payment accounts
- Toggle active/inactive status

### 7. **Frontend - User Flow** ⏳ PENDING

#### **A. Update Course Card**

- Add "Enroll" button
- On click → redirect to payment page with course ID

#### **B. Create Payment Page**

Components needed:

- Display course details
- Show all active admin payment accounts
- Allow user to select payment method
- Upload transaction screenshot
- Input transaction reference (optional)
- Submit payment request

#### **C. Update Dashboard**

- Add "My Courses" section showing enrollments
- Add "Payment Status" section showing pending/approved/rejected requests
- Show transaction screenshot in payment details

#### **D. Payment Request Tracking**

- User can view their payment requests
- See status (pending, approved, rejected)
- View rejection reason if rejected
- View transaction screenshot

---

## 📊 Database Tables Structure

### **admin_payment_accounts**

```sql
- id (UUID)
- type (VARCHAR) - 'CBE', 'TeleBirr', 'Commercial Bank', etc.
- account_name (VARCHAR)
- account_number (VARCHAR)
- bank_name (VARCHAR, optional)
- instructions (TEXT, optional)
- qr_code_url (TEXT, optional) - for TeleBirr QR
- is_active (BOOLEAN)
- display_order (INTEGER)
- created_at, updated_at (TIMESTAMP)
```

### **payment_requests** (Updated)

```sql
- id (UUID)
- user_id (UUID → users)
- course_id (UUID → courses)
- payment_account_id (UUID → admin_payment_accounts)
- amount (DECIMAL)
- transaction_screenshot_url (TEXT) - S3 URL or file path
- transaction_reference (VARCHAR, optional)
- status ('pending', 'approved', 'rejected')
- admin_notes (TEXT)
- rejection_reason (TEXT)
- approved_by (UUID → admin_users)
- approved_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

### **enrollments**

```sql
- id (UUID)
- user_id (UUID → users)
- course_id (UUID → courses)
- payment_request_id (UUID → payment_requests)
- enrolled_at (TIMESTAMP)
- progress (INTEGER, 0-100)
- completed_at (TIMESTAMP, nullable)
UNIQUE(user_id, course_id)
```

### **referral_earnings**

```sql
- id (UUID)
- referrer_id (UUID → users) - person who referred
- referred_user_id (UUID → users) - person who was referred
- enrollment_id (UUID → enrollments)
- course_id (UUID → courses)
- bonus_amount (DECIMAL)
- status ('pending', 'paid')
- paid_at (TIMESTAMP, nullable)
- created_at (TIMESTAMP)
```

---

## 🎯 Next Steps

### **Immediate Priority:**

1. **Implement Database Operations** (highest priority)
   - The `approve_payment_and_enroll()` function is critical
   - It must:
     - Update payment status to 'approved'
     - Create enrollment record
     - Check if user was referred
     - If referred, create referral_earning record
     - Use database transaction for atomicity

2. **Register Routes in app.py**
   ```python
   from routes import payment_accounts, payments

   app.include_router(payment_accounts.router)
   app.include_router(payments.router)
   ```

3. **Configure File Uploads**
   - Set up static file serving
   - Configure max file size
   - Set up S3 or local storage

4. **Test Backend APIs**
   - Create payment account (admin)
   - Upload screenshot
   - Create payment request
   - Approve payment
   - Verify enrollment created
   - Verify referral bonus created

### **After Backend is Complete:**

5. **Build Frontend UI**
   - Admin payment account management
   - User payment page
   - Course enrollment button
   - My Courses page

---

## 🔑 Key Business Logic

### **`approve_payment_and_enroll()` Function Logic**

````python
async def approve_payment_and_enroll(request_id, admin_id, admin_notes):
    """
    1. Validate payment request exists and is pending
    2. Get payment details (user_id, course_id, amount)
    3. Begin transaction:
       a. Update payment_requests: status='approved', approved_by=admin_id, approved_at=NOW()
       b. Create enrollment: user_id, course_id, payment_request_id
       c. Check if user has referred_by (from users table)
       d. If referred:
          - Get course price (for bonus calculation, e.g., 10%)
          - Create referral_earning record
    4. Commit transaction
    5. Return enrollment details
    ```

### **Referral Bonus Calculation**
- **Example**: 10% of course price
- If course costs 5000 ETB, referrer gets 500 ETB
- Can be configured in admin settings

---

## 📝 Configuration

### **Environment Variables Needed**
```env
# File Upload
MAX_UPLOAD_SIZE=10485760  # 10MB
UPLOAD_DIR=./uploads/transaction_screenshots

# Referral Settings
REFERRAL_BONUS_PERCENTAGE=10  # 10% of course price
````

---

## 🎉 Benefits of New System

1. ✅ **Admin Control**: Admin manages all payment accounts centrally
2. ✅ **Transparency**: Users see exactly where to pay
3. ✅ **Verification**: Admin verifies actual payments
4. ✅ **Automation**: Enrollment happens automatically upon approval
5. ✅ **Referral System**: Automatic bonus distribution
6. ✅ **Audit Trail**: Complete payment history
7. ✅ **Scalability**: Easy to add new payment methods

---

## 📞 API Endpoints Summary

### **Public/User Endpoints:**

- `GET /payment-accounts/` - View payment options
- `POST /payments/upload-screenshot` - Upload receipt
- `POST /payments/requests` - Submit payment
- `GET /payments/requests/my` - My payment requests
- `GET /payments/enrollments/my` - My courses
- `GET /payments/enrollments/{course_id}/check` - Check enrollment

### **Admin Endpoints:**

- `POST /payment-accounts/` - Create payment account
- `PUT /payment-accounts/{id}` - Update payment account
- `DELETE /payment-accounts/{id}` - Delete payment account
- `POST /payments/requests/{id}/approve` - Approve payment
- `POST /payments/requests/{id}/reject` - Reject payment

---

## 🚀 Testing Checklist

### **Backend:**

- [ ] Admin creates payment account
- [ ] User views payment accounts
- [ ] User uploads screenshot
- [ ] User creates payment request
- [ ] Admin approves payment
- [ ] Enrollment is created
- [ ] Referral bonus is created (if applicable)
- [ ] Admin rejects payment
- [ ] User views "My Courses"

### **Frontend:**

- [ ] Admin can manage payment accounts
- [ ] User sees payment accounts on enrollment
- [ ] User can upload screenshot
- [ ] User can submit payment request
- [ ] User sees payment status
- [ ] Admin sees payment requests
- [ ] Admin can approve/reject
- [ ] "My Courses" shows enrolled courses

---

**Status**: 🔄 **30% Complete** - Database and API routes created, need to
implement database operations and frontend.
