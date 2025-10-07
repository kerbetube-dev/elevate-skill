# 🧪 Frontend Integration Testing Guide

## 📋 System Status

- **Backend API**: `http://localhost:8004` ✅
- **Frontend**: `http://localhost:8082` ✅
- **Database**: PostgreSQL (Connected) ✅

## 🎯 Test Scenarios

### 1. **User Registration Flow** 🆕

#### Test Steps:

1. **Navigate to Registration**
   - Open browser: `http://localhost:8082`
   - Click "Register" or "Sign Up" button

2. **Test Password Visibility Toggle** 👁️
   - Enter password
   - Click the eye icon to show password
   - Click again to hide password
   - **Expected**: Password should toggle between visible and hidden

3. **Test Form Validation** ✅
   - Try submitting empty form
   - **Expected**: Validation errors appear
   - Enter invalid email (e.g., "notanemail")
   - **Expected**: Email validation error
   - Enter password < 8 characters
   - **Expected**: Password length error
   - Enter password without letter
   - **Expected**: Password must contain letter error

4. **Complete Registration** 📝
   - Full Name: "Test User"
   - Email: "testuser@example.com" (use unique email)
   - Password: "MyPass123" (with visibility toggle)
   - Phone: "+251912345678" (optional)
   - Referral Code: (leave blank or use valid code)
   - **Expected**: Success message, redirect to dashboard

5. **Verify Token Storage** 🔑
   - Open browser DevTools (F12)
   - Go to Application → Local Storage
   - **Expected**:
     - `access_token` present (30-day token)
     - `refresh_token` present (90-day token)
     - `user` object present

---

### 2. **User Login Flow** 🔐

#### Test Steps:

1. **Navigate to Login**
   - Open browser: `http://localhost:8082/login`

2. **Test Password Visibility Toggle** 👁️
   - Enter password
   - Click the eye icon to show/hide password
   - **Expected**: Password visibility toggles

3. **Test Invalid Login** ❌
   - Email: "wrong@example.com"
   - Password: "wrongpass"
   - **Expected**: Error message "Incorrect email or password"

4. **Test Valid Login** ✅
   - Email: Use previously registered email
   - Password: Use correct password
   - **Expected**:
     - Success message
     - Redirect to dashboard
     - Tokens stored in localStorage

5. **Verify User Session** 🔑
   - Check DevTools → Application → Local Storage
   - **Expected**: New access_token and refresh_token

---

### 3. **Dashboard Integration** 📊

#### Test Steps:

1. **Access Dashboard**
   - Navigate to `http://localhost:8082/dashboard`
   - **Expected**:
     - User profile displayed
     - Referral code visible
     - Course statistics shown

2. **Verify Real Data** 📈
   - Check enrolled courses count
   - Check total earnings
   - Check referral statistics
   - **Expected**: Data from database displayed correctly

3. **Test Navigation** 🧭
   - Click "Browse Courses"
   - Click "My Courses"
   - Click "Refer Friends"
   - **Expected**: Smooth navigation, no errors

---

### 4. **Course Browsing & Enrollment** 📚

#### Test Steps:

1. **Browse Courses**
   - Navigate to courses page
   - **Expected**: List of available courses from database

2. **View Course Details**
   - Click on a course card
   - **Expected**:
     - Course title, description, instructor
     - Price, duration, rating
     - Enrollment button

3. **Enroll in Course** 📝
   - Click "Enroll Now" button
   - **Expected**:
     - Payment methods modal appears
     - CBE Birr, Telebirr, Bank Transfer options

4. **Complete Payment** 💳
   - Select payment method
   - Upload receipt (if required)
   - Submit payment
   - **Expected**:
     - Success message
     - Status: "Pending approval"
     - Admin notification created

---

### 5. **Referral System** 🎁

#### Test Steps:

1. **Access Referral Page**
   - Navigate to "Refer Friends"
   - **Expected**:
     - Your referral code displayed
     - Share buttons available
     - Referral history (if any)

2. **Copy Referral Code**
   - Click copy button
   - **Expected**: "Copied!" confirmation

3. **Test Referral Registration**
   - Open incognito/private window
   - Register new user with referral code
   - **Expected**:
     - Registration successful
     - Referrer's account should show new referral

4. **Test Referral Reward** 💰
   - New user enrolls in course and pays
   - Admin approves payment
   - **Expected**:
     - Referrer receives 100 Birr reward
     - Reward visible in dashboard

---

### 6. **Admin Panel Integration** 👨‍💼

#### Test Steps:

1. **Admin Login**
   - Navigate to `http://localhost:8082/admin/login`
   - Email: "admin@elevateskil.com"
   - Password: "admin123"
   - **Expected**: Redirect to admin dashboard

2. **User Management** 👥
   - View all users
   - Search for specific user
   - Filter by status (Active/Inactive)
   - Activate/Deactivate user
   - **Expected**: Real-time updates from database

3. **Payment Approval** 💰
   - View pending payment requests
   - Check payment details
   - Upload receipt image
   - Approve or reject payment
   - **Expected**:
     - User notified
     - Course enrollment updated
     - Referral reward processed (if applicable)

4. **Course Management** 📚
   - View all courses
   - Create new course
   - Edit existing course
   - Delete course
   - Change course status (Active/Inactive)
   - **Expected**: Changes reflected immediately

5. **Analytics & Reports** 📊
   - View platform statistics
   - Check revenue analytics
   - Review user growth charts
   - Export reports
   - **Expected**: Real data from database

---

### 7. **Security Features** 🔒

#### Test Steps:

1. **Rate Limiting** ⏱️
   - Open browser DevTools → Network tab
   - Try to make 100+ requests rapidly
   - **Expected**: 429 error after limit exceeded

2. **Token Expiration** ⏰
   - Clear localStorage
   - Try to access protected page
   - **Expected**: Redirect to login

3. **XSS Protection** 🛡️
   - Try entering `<script>alert('XSS')</script>` in forms
   - **Expected**: Input sanitized, no script execution

4. **SQL Injection Protection** 🛡️
   - Try entering `'; DROP TABLE users; --` in forms
   - **Expected**: Input rejected or sanitized

---

### 8. **Error Handling** ⚠️

#### Test Steps:

1. **Network Error**
   - Stop backend server
   - Try to login
   - **Expected**: User-friendly error message

2. **Validation Errors**
   - Submit forms with invalid data
   - **Expected**: Clear error messages, field-specific errors

3. **404 Pages**
   - Navigate to `/nonexistent-page`
   - **Expected**: Custom 404 page with navigation

---

## 🎯 Expected Results Summary

### ✅ Registration & Login

- [x] Password visibility toggle works
- [x] Form validation prevents invalid submissions
- [x] Successful registration creates user in database
- [x] 30-day access tokens and 90-day refresh tokens issued
- [x] Tokens stored in localStorage
- [x] Login works with registered credentials

### ✅ Dashboard

- [x] Real user data displayed
- [x] Course statistics accurate
- [x] Referral code visible and copyable
- [x] Navigation smooth and responsive

### ✅ Course System

- [x] Courses loaded from database
- [x] Enrollment process works
- [x] Payment methods functional
- [x] Admin approval workflow working

### ✅ Referral System

- [x] Referral code generation works
- [x] New user registration with referral code
- [x] 100 Birr reward only on payment completion
- [x] Reward tracking accurate

### ✅ Admin Panel

- [x] User management CRUD operations
- [x] Payment approval system
- [x] Course management CRUD operations
- [x] Analytics displaying real data

### ✅ Security

- [x] Rate limiting active
- [x] XSS protection working
- [x] SQL injection prevention
- [x] Token-based authentication
- [x] Secure password handling

### ✅ UX Enhancements

- [x] Loading states for async operations
- [x] Toast notifications for feedback
- [x] Error messages clear and helpful
- [x] Forms have real-time validation
- [x] Password visibility toggle

---

## 🐛 Bug Reporting Template

If you encounter any issues:

```markdown
### Bug Description

[Describe the issue]

### Steps to Reproduce

1. ...
2. ...
3. ...

### Expected Behavior

[What should happen]

### Actual Behavior

[What actually happened]

### Screenshots

[If applicable]

### Browser & OS

- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/Linux]
- Version: [Browser version]

### Console Errors

[Copy any errors from browser console]
```

---

## 📞 Quick Commands

### Check Services:

```bash
# Check backend
curl http://localhost:8004/health

# Check frontend
curl http://localhost:8082
```

### Restart Services:

```bash
# Restart backend
pkill -f 'uvicorn app:app'
cd backend && source .venv/bin/activate && uvicorn app:app --host 0.0.0.0 --port 8004

# Restart frontend
# Press Ctrl+C in terminal running npm
cd .. && npm run dev
```

### View Logs:

```bash
# Backend logs
tail -f backend/logs/*.log

# Frontend console
# Open browser DevTools (F12) → Console tab
```

---

## ✅ Testing Checklist

Use this checklist to track your testing progress:

- [ ] Registration with password toggle
- [ ] Login with password toggle
- [ ] Dashboard loads with real data
- [ ] Course browsing works
- [ ] Course enrollment works
- [ ] Payment submission works
- [ ] Referral code generation
- [ ] Referral registration
- [ ] Referral reward (100 Birr on payment)
- [ ] Admin login
- [ ] Admin user management
- [ ] Admin payment approval
- [ ] Admin course management
- [ ] Admin analytics
- [ ] Rate limiting protection
- [ ] XSS protection
- [ ] Error handling
- [ ] Token refresh
- [ ] Logout functionality
- [ ] Mobile responsiveness

---

## 🎉 Success Criteria

Your frontend-backend integration is successful if:

1. ✅ All registration and login flows work smoothly
2. ✅ Password visibility toggle enhances UX
3. ✅ Real data loads from database in all pages
4. ✅ Course enrollment and payment system functional
5. ✅ Referral system rewards correctly (100 Birr on payment)
6. ✅ Admin panel manages all entities successfully
7. ✅ Security features protect against common attacks
8. ✅ Error handling provides clear user feedback
9. ✅ Performance is acceptable (< 2s page loads)
10. ✅ No console errors in normal operation

---

**Happy Testing! 🚀**

For any questions or issues, check the browser console (F12) and backend logs
for detailed error messages.
