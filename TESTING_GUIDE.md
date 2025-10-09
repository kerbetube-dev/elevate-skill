# 🧪 Comprehensive Testing Guide

## Current System Status

**Services Running:**

- Backend (Port 8000 or 8004)
- Frontend (Port 5173)

---

## 📋 **Testing Checklist**

### **Phase 1: Services Health Check**

#### Backend API

```bash
# Test 1: Health Check
curl http://localhost:8000/health
# Expected: {"status":"healthy","message":"API is running successfully"}

# Test 2: API Documentation
Open: http://localhost:8000/docs
# Expected: Swagger UI with all endpoints

# Test 3: Courses Endpoint
curl http://localhost:8000/api/courses
# Expected: Array of courses (may be empty)
```

#### Frontend

```bash
# Test: Frontend Accessibility
curl -I http://localhost:5173
# Expected: HTTP/1.1 200 OK

# Visit in Browser:
http://localhost:5173
# Expected: Landing page loads
```

---

### **Phase 2: Landing Page Testing**

**URL:** `http://localhost:5173/`

#### Visual Tests

- [ ] **Hero Section**
  - [ ] Gradient mesh background loads
  - [ ] Floating orbs animate
  - [ ] Typewriter effect on headlines
  - [ ] CountUp stats animate
  - [ ] Glass-effect stat cards visible
  - [ ] "Get Started" button works

- [ ] **Features Section**
  - [ ] 8 feature cards display
  - [ ] Stagger animation on scroll
  - [ ] Icons wiggle on hover
  - [ ] Color-coded badges show

- [ ] **Courses Showcase**
  - [ ] Course cards load with images
  - [ ] Hover zoom effect works
  - [ ] Level badges display
  - [ ] Enrollment badges show
  - [ ] "View Details" button works

- [ ] **Testimonials**
  - [ ] Carousel displays
  - [ ] Auto-advance works (every 5 seconds)
  - [ ] Manual navigation works
  - [ ] Swipe gestures work (mobile)

- [ ] **CTA Section**
  - [ ] Gradient background animates
  - [ ] Floating icons present
  - [ ] Trust indicators visible
  - [ ] CTA buttons work

#### Functional Tests

- [ ] Scroll to sections works
- [ ] All navigation links function
- [ ] Sticky header appears on scroll
- [ ] Mobile menu opens/closes
- [ ] All animations smooth (60fps)

---

### **Phase 3: Authentication Testing**

#### Login Page (`/login`)

**Visual Tests:**

- [ ] **Layout**
  - [ ] Split-screen design (desktop)
  - [ ] Brand panel on left with stats
  - [ ] Form on right
  - [ ] Floating orbs animate
  - [ ] Glass-effect stat cards

- [ ] **Form Elements**
  - [ ] Email input with icon
  - [ ] Password input with icon
  - [ ] Password visibility toggle
  - [ ] Forgot password link
  - [ ] Social login buttons (Google, Facebook)
  - [ ] "Sign up" link

**Functional Tests:**

- [ ] **Real-time Validation**
  ```
  Test Cases:
  1. Empty email → No error until touched
  2. Invalid email (test@) → Red border + error message
  3. Valid email (test@gmail.com) → Green checkmark
  4. Short password (123) → Red border + error
  5. Valid password (123456) → Form enabled
  ```

- [ ] **Login Flow**
  ```
  Credentials:
  Email: testuser1@gmail.com
  Password: password123

  Steps:
  1. Enter credentials
  2. Watch real-time validation
  3. Click "Sign In"
  4. See loading spinner
  5. Success toast appears
  6. Redirect to dashboard (800ms)
  ```

- [ ] **Error Handling**
  ```
  Test wrong credentials:
  1. Enter invalid email/password
  2. Submit form
  3. Error alert displays
  4. Form remains accessible
  ```

#### Register Page (`/register`)

**Visual Tests:**

- [ ] Same split-screen layout
- [ ] 6 form fields visible
- [ ] Password strength meter present
- [ ] Requirements checklist visible

**Functional Tests:**

- [ ] **Password Strength Meter**
  ```
  Test Cases:
  1. "abc" → Weak (red, 20%)
  2. "abc123" → Fair (yellow, 40%)
  3. "Abc123" → Good (blue, 60%)
  4. "Abc123!@" → Strong (green, 80-100%)
  ```

- [ ] **Requirements Checklist**
  ```
  As you type, check marks appear:
  - ✓ At least 6 characters
  - ✓ Contains lowercase letter
  - ✓ Contains uppercase letter
  - ✓ Contains number
  ```

- [ ] **Password Match Validation**
  ```
  1. Enter password: "Test123"
  2. Confirm password: "Test456" → Error
  3. Confirm password: "Test123" → Green checkmark
  ```

- [ ] **Registration Flow**
  ```
  1. Fill all fields
  2. Watch strength meter update
  3. See requirements checklist
  4. Click "Create Account"
  5. Loading state
  6. Success toast
  7. Redirect to dashboard
  ```

---

### **Phase 4: Dashboard Testing**

**URL:** `http://localhost:5173/dashboard` (requires login)

#### Desktop Tests (> 1024px)

- [ ] **Sidebar**
  - [ ] Sidebar displays (280px width)
  - [ ] Logo with hover rotate animation
  - [ ] User profile shows
  - [ ] 5 navigation tabs visible
  - [ ] Settings button present
  - [ ] Logout button visible
  - [ ] Click collapse button → Sidebar shrinks to 80px
  - [ ] Icons remain visible when collapsed
  - [ ] Click expand → Sidebar returns to 280px
  - [ ] Smooth width animation (300ms)

- [ ] **Header**
  - [ ] Sticky on scroll
  - [ ] Search bar visible
  - [ ] Notifications bell (with badge if any)
  - [ ] User avatar on mobile

#### Mobile Tests (< 768px)

- [ ] **Mobile Menu**
  - [ ] Menu button (hamburger) visible
  - [ ] Tap opens drawer from left
  - [ ] Backdrop overlay appears
  - [ ] Drawer contains full sidebar content
  - [ ] Tap outside closes drawer
  - [ ] X button closes drawer
  - [ ] Smooth slide animation

#### Home Tab Tests

- [ ] **Welcome Header**
  - [ ] Displays user's first name
  - [ ] Refresh button present
  - [ ] Click refresh → Loading animation → Data updates

- [ ] **Stat Cards** (4 cards)
  - [ ] Card 1: Enrolled Courses (Primary gradient)
  - [ ] Card 2: Completed Courses (Success gradient)
  - [ ] Card 3: Total Earnings (Warning gradient)
  - [ ] Card 4: Referrals (Ocean gradient)
  - [ ] Numbers animate with CountUp
  - [ ] Trend indicators show (↑/↓ with %)
  - [ ] Hover lift effect works
  - [ ] Icons rotate on hover

- [ ] **Progress Ring**
  - [ ] Circular progress displays
  - [ ] Percentage in center
  - [ ] Smooth animation (1.5s)
  - [ ] Gradient colors

- [ ] **Continue Learning**
  - [ ] Shows enrolled courses (if any)
  - [ ] Max 3 courses displayed
  - [ ] Course cards with progress bars
  - [ ] "Continue Learning" button works
  - [ ] Play button overlay on hover

- [ ] **Achievement Badges**
  - [ ] Grid of badges (3 columns on desktop)
  - [ ] Earned badges colored
  - [ ] Locked badges grayed with lock icon
  - [ ] Rarity levels:
    - Common (gray)
    - Rare (blue)
    - Epic (purple)
    - Legendary (gold with shimmer!)
  - [ ] Progress bars for incomplete
  - [ ] Hover effects work

- [ ] **Activity Timeline**
  - [ ] Recent activities display
  - [ ] Color-coded icons
  - [ ] Relative timestamps ("2 hours ago")
  - [ ] Vertical timeline line
  - [ ] Stagger animation
  - [ ] "View all" link (if >5 activities)

#### Courses Tab Tests

- [ ] **Layout**
  - [ ] Title: "Available Courses"
  - [ ] 3-column grid (desktop)
  - [ ] 2-column grid (tablet)
  - [ ] 1-column grid (mobile)

- [ ] **Course Cards**
  - [ ] Image loads or gradient fallback
  - [ ] Hover zoom on image
  - [ ] Level badge (Beginner/Intermediate/Advanced)
  - [ ] Rating with stars
  - [ ] Title and description
  - [ ] Instructor name with icon
  - [ ] Duration and student count
  - [ ] Price display
  - [ ] "Enroll Now" button
  - [ ] "View Details" icon button
  - [ ] Hover lift effect
  - [ ] Border glow on hover

- [ ] **Actions**
  - [ ] Click "Enroll Now" → Redirects to payment page
  - [ ] Click "View Details" → Opens course details
  - [ ] Hover shows gradient glow

#### My Courses Tab Tests

- [ ] **With Enrolled Courses**
  - [ ] Shows enrolled courses only
  - [ ] Progress bars visible
  - [ ] Lesson completion count
  - [ ] "Next lesson" display
  - [ ] "Continue Learning" button
  - [ ] Play button overlay

- [ ] **Empty State**
  - [ ] Empty icon visible
  - [ ] "No Courses Yet" message
  - [ ] Helpful description
  - [ ] "Browse Courses" button → Switches to Courses tab

#### Refer Friends Tab Tests

- [ ] **Referral Code Card**
  - [ ] Code displays
  - [ ] Copy button works
  - [ ] "Copied!" toast on click
  - [ ] QR code visible
  - [ ] Share buttons (Facebook, Twitter, WhatsApp, Email)

- [ ] **Earnings Summary**
  - [ ] Total earnings displays
  - [ ] Available balance shows
  - [ ] Pending earnings visible
  - [ ] Completed referrals count

- [ ] **Referral Stats**
  - [ ] Total referrals
  - [ ] Active referrals
  - [ ] Completion rate
  - [ ] Progress bars

- [ ] **Referral List**
  - [ ] Each referral shows:
    - Name
    - Status badge (Pending/Completed)
    - Reward amount
    - Date referred
  - [ ] Empty state if no referrals

#### Withdrawals Tab Tests

- [ ] **Withdrawal Request Form**
  - [ ] Amount input
  - [ ] Account type select (CBE/TeleBirr)
  - [ ] Account number input
  - [ ] Account holder name input
  - [ ] Phone number input
  - [ ] 300 ETB minimum enforced
  - [ ] Submit button disabled if < 300 ETB
  - [ ] Success toast on submission

- [ ] **Withdrawal History**
  - [ ] Past requests listed
  - [ ] Status badges:
    - Pending (yellow)
    - Approved (green)
    - Rejected (red)
  - [ ] Amount displays
  - [ ] Date shows
  - [ ] Admin notes visible (if any)
  - [ ] Empty state if no withdrawals

#### Tab Switching Tests

- [ ] **Animations**
  - [ ] Smooth fade in/out (300ms)
  - [ ] Content slides up on enter
  - [ ] Active tab highlighted
  - [ ] Inactive tabs muted
  - [ ] URL updates (if implemented)

---

### **Phase 5: Course Details Testing**

**URL:** `http://localhost:5173/course/[courseId]`

#### Hero Section Tests

- [ ] **Layout**
  - [ ] Gradient background with pattern
  - [ ] Two-column layout (desktop)
  - [ ] Stacked layout (mobile)

- [ ] **Left Column**
  - [ ] Badges display (Level, Certificate, etc.)
  - [ ] Title shows
  - [ ] Description visible
  - [ ] Rating with stars
  - [ ] Student count
  - [ ] Duration
  - [ ] Instructor preview
  - [ ] Language and last updated
  - [ ] Share button works
  - [ ] Favorite button present

- [ ] **Right Column**
  - [ ] Course image loads
  - [ ] Gradient overlay
  - [ ] Hover zoom works
  - [ ] Play button overlay
  - [ ] Floating stats card:
    - Sections count
    - Lessons count
    - Total duration
  - [ ] Stats animate in (delay 0.8s)

#### Tab Navigation Tests

- [ ] **Overview Tab**
  - [ ] "What You'll Learn" section
    - Grid of items with checkmarks
    - Stagger animation
  - [ ] "Requirements" section
    - Bulleted list
  - [ ] "Description" section
    - Full course description

- [ ] **Curriculum Tab**
  - [ ] Summary cards (3 stats)
  - [ ] Sections list
  - [ ] Click section → Expands/collapses
  - [ ] Smooth height animation
  - [ ] Progress bars (if enrolled)
  - [ ] Lesson list shows:
    - Icons (video/article/quiz/download)
    - Duration
    - "Free Preview" badges
    - Lock icons for premium content
    - Completed checkmarks
  - [ ] Hover effects on lessons

- [ ] **Instructor Tab**
  - [ ] Avatar with initials
  - [ ] Name and title
  - [ ] Social links (LinkedIn, Twitter, Website, Email)
  - [ ] Stats cards:
    - Rating
    - Students taught
    - Courses published
  - [ ] Biography section
  - [ ] Specialties badges
  - [ ] "View Profile" button
  - [ ] "View All Courses" button

- [ ] **Reviews Tab**
  - [ ] Overall rating display (large number)
  - [ ] Star visualization
  - [ ] Rating distribution:
    - 5-star bar
    - 4-star bar
    - 3-star bar
    - 2-star bar
    - 1-star bar
    - Percentage for each
  - [ ] Review cards:
    - Avatar
    - Username
    - Star rating
    - Date
    - Comment
    - "Helpful" button with count
    - "Report" button
  - [ ] "Load More" button
  - [ ] Empty state (if no reviews)

#### Enrollment Card Tests (Sticky)

- [ ] **Card sticks** when scrolling
- [ ] **Pricing Section**
  - [ ] Price displays (large)
  - [ ] "One-time payment" label
  - [ ] Original price (if discount)
  - [ ] Savings badge

- [ ] **CTA Button**
  - [ ] "Enroll Now" for non-enrolled
  - [ ] "Continue Learning" for enrolled
  - [ ] Gradient style
  - [ ] Click redirects to payment

- [ ] **Includes Section**
  - [ ] Lifetime access
  - [ ] Mobile & desktop access
  - [ ] Downloadable resources
  - [ ] Certificate

- [ ] **Additional**
  - [ ] "Gift This Course" button
  - [ ] Referral bonus notice
  - [ ] 30-day guarantee (if not enrolled)

#### Related Courses Tests

- [ ] **Carousel**
  - [ ] Horizontal scroll
  - [ ] Left/right arrows
  - [ ] Arrows disable at edges
  - [ ] Smooth scroll animation
  - [ ] Hidden scrollbar

- [ ] **Course Cards**
  - [ ] 6 related courses
  - [ ] Image with hover zoom
  - [ ] Level badge
  - [ ] Title
  - [ ] Description (2 lines)
  - [ ] Rating, students, duration
  - [ ] Price
  - [ ] "View Course" button
  - [ ] Click navigates to course

---

### **Phase 6: Payment Flow Testing**

**URL:** `http://localhost:5173/payment?courseId=[id]`

#### Page Layout Tests

- [ ] **Header**
  - [ ] Back button works
  - [ ] Sticky on scroll

- [ ] **Main Content**
  - [ ] Two-column layout (desktop)
  - [ ] Single column (mobile)
  - [ ] Title: "Complete Your Enrollment"
  - [ ] Subtitle visible

#### Step 1: Payment Account Selection

- [ ] **Account List**
  - [ ] All accounts display
  - [ ] TeleBirr with smartphone icon
  - [ ] Banks with building icon
  - [ ] Account number visible
  - [ ] Account holder name shows
  - [ ] Click selects account
  - [ ] Selected account:
    - Border turns blue
    - Glow effect
    - Checkmark appears
  - [ ] Hover effects work

#### Step 2: File Upload Tests

- [ ] **Drag & Drop**
  ```
  Test Cases:
  1. Drag image file over zone → Border glows, scale up
  2. Drop file → Preview appears, success state
  3. Drag non-image → Alert: "Please upload an image file"
  4. Drag file > 5MB → Alert: "File size must be less than 5MB"
  ```

- [ ] **Click to Upload**
  - [ ] Click zone → File dialog opens
  - [ ] Select image → Preview shows
  - [ ] File info displays:
    - Filename
    - File size in MB
  - [ ] Success checkmark appears
  - [ ] Remove button (X) works
  - [ ] Click remove → Returns to upload zone

- [ ] **Preview**
  - [ ] Image thumbnail shows (32x32)
  - [ ] Success border (green)
  - [ ] Success message
  - [ ] Smooth animations

- [ ] **Transaction Reference**
  - [ ] Input field present
  - [ ] Optional (can be empty)
  - [ ] Accepts text input

#### Order Summary Tests (Sidebar)

- [ ] **Course Info**
  - [ ] Course image
  - [ ] Course title
  - [ ] Level badge

- [ ] **Price Breakdown**
  - [ ] Course price
  - [ ] Discount (if any)
  - [ ] Total (large, bold)

- [ ] **What's Included**
  - [ ] Lifetime access checkmark
  - [ ] Certificate checkmark
  - [ ] All materials checkmark

#### Submission Tests

- [ ] **Validation**
  ```
  Test Cases:
  1. No account selected → Error: "Please select a payment account"
  2. No file uploaded → Error: "Please upload a transaction screenshot"
  3. Both present → Submit enabled
  ```

- [ ] **Submit Flow**
  - [ ] Click "Submit for Verification"
  - [ ] Button shows loading spinner
  - [ ] Button disabled during submission
  - [ ] On success → Success animation page

#### Success Animation Tests

- [ ] **Visual Elements**
  - [ ] Gradient background
  - [ ] 20 floating particles animating
  - [ ] Large success icon (checkmark)
  - [ ] Pulsing glow around icon
  - [ ] 4 rotating sparkles around icon
  - [ ] Spring bounce animation

- [ ] **Content**
  - [ ] "Payment Submitted!" title
  - [ ] Course name displays
  - [ ] "What happens next?" box:
    - 3 numbered steps
    - Clear explanations
  - [ ] Action buttons:
    - "Go to Dashboard" (primary)
    - "View My Courses" (outline)
  - [ ] Support email

- [ ] **Behavior**
  - [ ] Auto-redirect after 3 seconds
  - [ ] Buttons work immediately
  - [ ] Smooth animations
  - [ ] Particles float upward

---

### **Phase 7: Responsive Design Testing**

#### Desktop (1920px)

- [ ] All layouts optimal
- [ ] No horizontal scroll
- [ ] All animations smooth
- [ ] Hover effects work
- [ ] Full feature set visible

#### Laptop (1366px)

- [ ] Layouts adjust properly
- [ ] Sidebar still collapsible
- [ ] Content readable
- [ ] No overflow issues

#### Tablet (768px)

- [ ] 2-column grids
- [ ] Sidebar full width
- [ ] Touch targets 44px minimum
- [ ] No small text

#### Mobile (375px)

- [ ] Single column layouts
- [ ] Drawer menu works
- [ ] Buttons stack vertically
- [ ] Images scale properly
- [ ] No horizontal scroll
- [ ] Touch gestures work
- [ ] Forms easy to fill

---

### **Phase 8: Performance Testing**

#### Load Times

```bash
# Test page load times
curl -o /dev/null -s -w "Time: %{time_total}s\n" http://localhost:5173
# Expected: < 2 seconds

# Test API response times
curl -o /dev/null -s -w "Time: %{time_total}s\n" http://localhost:8000/api/courses
# Expected: < 1 second
```

#### Animation Performance

- [ ] All animations 60fps (check DevTools)
- [ ] No jank during scroll
- [ ] Smooth tab switching
- [ ] Responsive interactions (<100ms)

#### Browser Tests

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

### **Phase 9: Accessibility Testing**

#### Keyboard Navigation

- [ ] Tab through all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals/drawers
- [ ] Arrow keys work in carousels
- [ ] Focus indicators visible
- [ ] No keyboard traps

#### Screen Reader

- [ ] All images have alt text
- [ ] Buttons have aria-labels
- [ ] Form inputs have labels
- [ ] Error messages announced
- [ ] Loading states announced
- [ ] Success messages announced

#### Color Contrast

- [ ] Text readable on all backgrounds
- [ ] WCAG AA compliance
- [ ] Links distinguishable
- [ ] Focus indicators visible

---

### **Phase 10: Error Handling Testing**

#### Network Errors

```
Test Cases:
1. Disconnect internet
2. Try to login → Error message appears
3. Reconnect → Try again works
```

#### API Errors

```
Test Cases:
1. Invalid credentials → Clear error message
2. Server error (500) → Friendly error message
3. Network timeout → Retry option
```

#### Validation Errors

```
Test Cases:
1. Invalid form data → Field-level errors
2. Missing required fields → Highlighted fields
3. File too large → Clear message
```

---

## 📊 **Test Results Template**

Use this template to track your testing:

```markdown
## Test Session: [Date]

### Environment

- Frontend URL: http://localhost:5173
- Backend URL: http://localhost:8000
- Browser: [Chrome/Firefox/Safari]
- Screen Size: [1920x1080 / Mobile]

### Results

#### Landing Page

- Hero Section: ✅ Pass / ❌ Fail
- Features: ✅ Pass / ❌ Fail
- Courses: ✅ Pass / ❌ Fail
- Testimonials: ✅ Pass / ❌ Fail
- CTA: ✅ Pass / ❌ Fail

#### Authentication

- Login: ✅ Pass / ❌ Fail
- Register: ✅ Pass / ❌ Fail
- Validation: ✅ Pass / ❌ Fail

#### Dashboard

- Sidebar: ✅ Pass / ❌ Fail
- Stat Cards: ✅ Pass / ❌ Fail
- Progress Ring: ✅ Pass / ❌ Fail
- Achievements: ✅ Pass / ❌ Fail
- Timeline: ✅ Pass / ❌ Fail
- Tabs: ✅ Pass / ❌ Fail

#### Course Details

- Hero: ✅ Pass / ❌ Fail
- Curriculum: ✅ Pass / ❌ Fail
- Reviews: ✅ Pass / ❌ Fail
- Instructor: ✅ Pass / ❌ Fail

#### Payment

- Account Selection: ✅ Pass / ❌ Fail
- File Upload: ✅ Pass / ❌ Fail
- Submission: ✅ Pass / ❌ Fail
- Success Animation: ✅ Pass / ❌ Fail

### Issues Found

1. [Issue description]
2. [Issue description]

### Notes

[Any additional observations]
```

---

## 🚀 **Quick Test Script**

For rapid testing, use this checklist:

### 5-Minute Smoke Test

1. ✅ Open http://localhost:5173 → Landing page loads
2. ✅ Click "Get Started" → Register page loads
3. ✅ Fill registration form → Success redirect
4. ✅ Dashboard loads with data
5. ✅ Click sidebar tabs → All tabs switch
6. ✅ Click course → Course details load
7. ✅ Click "Enroll" → Payment page loads
8. ✅ Select account + upload file → Submit works
9. ✅ Success animation plays → Redirect works
10. ✅ Check mobile view → Responsive works

### 15-Minute Feature Test

Run the 5-minute test plus: 11. ✅ Test sidebar collapse 12. ✅ Test password
strength meter 13. ✅ Test curriculum expand/collapse 14. ✅ Test drag & drop
upload 15. ✅ Test achievement badges 16. ✅ Test referral code copy 17. ✅ Test
related courses carousel 18. ✅ Test logout → login again

### 30-Minute Full Test

Run the 15-minute test plus all sections above.

---

## 📝 **Testing Best Practices**

1. **Test in Order:** Start with landing → auth → dashboard → course → payment
2. **Use Real Data:** Create actual accounts, enroll in courses
3. **Test Edge Cases:** Empty states, errors, long text
4. **Test All Browsers:** Chrome, Firefox, Safari, Edge
5. **Test All Devices:** Desktop, tablet, mobile
6. **Check Console:** No errors in browser console
7. **Check Network:** All API calls successful
8. **Check Performance:** Lighthouse score > 90
9. **Document Issues:** Screenshot + description
10. **Retest Fixes:** Verify bugs are resolved

---

## 🎯 **Success Criteria**

A feature is considered **PASS** if:

- ✅ Visual design matches expectations
- ✅ All animations smooth (60fps)
- ✅ No console errors
- ✅ Responsive on all screen sizes
- ✅ Accessible (keyboard + screen reader)
- ✅ Error handling works
- ✅ Performance acceptable (<2s load)

---

**Ready to test!** Start with the 5-minute smoke test, then proceed to detailed
testing of each phase. 🧪✨
