# 📊 How to Use the Modern Dashboard

## Quick Start

Your stunning modern dashboard is ready! Here's how to activate it:

---

## Option 1: Replace Current Dashboard (Recommended)

### Step 1: Update your router

Find your routing file and update the import:

**Before:**

```tsx
import EnhancedDashboard from "@/components/EnhancedDashboard";
```

**After:**

```tsx
import { ModernDashboard } from "@/components/dashboard/ModernDashboard";
```

### Step 2: Update the route

**Before:**

```tsx
<Route path="/dashboard" element={<EnhancedDashboard />} />;
```

**After:**

```tsx
<Route path="/dashboard" element={<ModernDashboard />} />;
```

### Step 3: Test it out!

1. Login to your account
2. You'll see the new dashboard with:
   - Collapsible sidebar
   - Animated stat cards
   - Progress rings
   - Activity timeline
   - Achievement badges
   - Enhanced course cards

---

## Option 2: Use Individual Components

Import components separately:

```tsx
import { StatCards } from '@/components/dashboard/StatCards';
import { ProgressRing } from '@/components/dashboard/ProgressRing';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { AchievementBadges } from '@/components/dashboard/AchievementBadges';
import { EnhancedCourseGrid } from '@/components/dashboard/EnhancedCourseCard';

// Use in your custom dashboard
<StatCards stats={myStats} />
<ProgressRing progress={75} />
<ActivityTimeline activities={myActivities} />
```

---

## 📁 Component Overview

### 1. DashboardLayout

Main layout with collapsible sidebar and header.

```tsx
<DashboardLayout
    activeTab="home"
    onTabChange={setActiveTab}
    userName="John Doe"
    userEmail="john@example.com"
    notifications={3}
    onLogout={handleLogout}
>
    {children}
</DashboardLayout>;
```

### 2. StatCards

Animated cards showing key metrics.

```tsx
const stats = [
    {
        title: "Total Users",
        value: 1234,
        icon: Users,
        gradient: "primary",
        trend: { value: 12, positive: true },
    },
];

<StatCards stats={stats} />;
```

### 3. ProgressRing

Circular progress indicator.

```tsx
<ProgressRing
    progress={75}
    size={160}
    color="url(#gradient)"
    showPercentage={true}
/>;
```

### 4. ActivityTimeline

Recent activity feed.

```tsx
const activities = [
    {
        id: "1",
        type: "enrollment",
        title: "Enrolled in Course",
        description: "Web Development Bootcamp",
        timestamp: new Date().toISOString(),
    },
];

<ActivityTimeline activities={activities} maxItems={5} />;
```

### 5. AchievementBadges

Achievement showcase.

```tsx
const achievements = [
    {
        id: "1",
        name: "Quick Learner",
        description: "Complete a course in 7 days",
        icon: Zap,
        earned: true,
        earnedDate: new Date().toISOString(),
        rarity: "rare",
    },
];

<AchievementBadges achievements={achievements} />;
```

### 6. EnhancedCourseCard / EnhancedCourseGrid

Beautiful course cards.

```tsx
<EnhancedCourseGrid
    courses={myCourses}
    variant="enrolled" // or "default"
    onEnroll={handleEnroll}
    onContinue={handleContinue}
    onViewDetails={handleViewDetails}
/>;
```

### 7. ReferralDashboard

Complete referral management.

```tsx
<ReferralDashboard />;
```

---

## 🎨 Customization

### Change Sidebar Width

Edit `src/components/dashboard/DashboardLayout.tsx`:

```tsx
// Line ~70
animate={{ width: sidebarCollapsed ? 80 : 320 }} // Change 320 to your preferred width
```

### Add Custom Stat Card

```tsx
const customStats = [
    ...existingStats,
    {
        title: "Custom Metric",
        value: 999,
        icon: CustomIcon,
        gradient: "ocean", // primary, success, warning, ocean, sunset, purple
        trend: { value: 15, positive: true },
    },
];
```

### Customize Progress Ring Colors

```tsx
// In the component
<ProgressRing
    progress={75}
    color="url(#gradient-success)" // or any custom gradient
/>;
```

### Modify Achievement Rarity Colors

Edit `src/components/dashboard/AchievementBadges.tsx`:

```tsx
const rarityConfig = {
    mythic: {
        gradient: "from-red-400 to-pink-600",
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-300",
        glow: "shadow-red-500/50",
    },
};
```

### Add New Navigation Tab

Edit `DashboardLayout.tsx`:

```tsx
const tabs: Tab[] = [
    ...existingTabs,
    { id: "custom", label: "Custom Tab", icon: YourIcon },
];
```

Then add content in `ModernDashboard.tsx`:

```tsx
{
    activeTab === "custom" && renderCustomTab();
}
```

---

## 🐛 Troubleshooting

### Issue: Sidebar not collapsing

**Solution:** Check that you're using the DashboardLayout component and it's
rendering on desktop (>1024px).

### Issue: Stat cards not animating

**Solution:** Ensure `react-countup` is installed:

```bash
npm install react-countup
```

### Issue: Progress ring not showing

**Solution:** Verify SVG gradients are defined and progress value is 0-100.

### Issue: Timeline empty

**Solution:** Pass activities array with proper format (see example above).

### Issue: Course cards not displaying images

**Solution:** Check image paths and ensure `getImageUrl` function is working.

### Issue: Animations laggy

**Solution:** Reduce animation complexity or disable for low-end devices.

---

## 📱 Testing Checklist

### Desktop Testing

- [ ] Sidebar collapses/expands
- [ ] Stat cards display in 4 columns
- [ ] Progress ring animates
- [ ] Course cards in 3 columns
- [ ] Hover effects work
- [ ] Tab switching smooth

### Tablet Testing (768px - 1024px)

- [ ] Sidebar visible
- [ ] Stat cards in 2 columns
- [ ] Course cards in 2 columns
- [ ] Timeline responsive

### Mobile Testing (< 768px)

- [ ] Sidebar opens as drawer
- [ ] Backdrop overlay works
- [ ] Stat cards stack vertically
- [ ] Course cards full width
- [ ] Touch interactions work
- [ ] Search bar accessible

### Functionality

- [ ] API calls succeed
- [ ] Loading states display
- [ ] Error states display
- [ ] Logout works
- [ ] Refresh button works
- [ ] Toast notifications appear
- [ ] Navigation works
- [ ] Enroll button works
- [ ] Continue learning works

---

## 🎯 Feature Highlights

### Sidebar

- **Desktop:** Collapsible (280px → 80px)
- **Mobile:** Drawer with backdrop
- **Animations:** Smooth width transition
- **State:** Icon-only when collapsed

### Stat Cards

- **Animation:** CountUp numbers
- **Hover:** Lift + glow effect
- **Trend:** Up/down indicators
- **Gradients:** 6 color themes

### Progress Ring

- **Animation:** Smooth circular progress
- **Gradients:** Multiple color options
- **Center:** Percentage display
- **Customizable:** Size, stroke, duration

### Activity Timeline

- **Icons:** Color-coded by type
- **Time:** Relative timestamps
- **Animation:** Stagger reveal
- **Overflow:** View all option

### Achievement Badges

- **Rarity:** 4 tiers (Common → Legendary)
- **Progress:** Track incomplete
- **Effects:** Shimmer for legendary
- **States:** Earned vs locked

### Course Cards

- **Image:** Zoom on hover
- **Badges:** Level, rating, progress
- **Progress:** Bar + lesson count
- **Actions:** Enroll, continue, details

---

## 🚀 Best Practices

### Performance

1. **Lazy Load:** Use React.lazy for routes
2. **Memoize:** Wrap expensive components
3. **Debounce:** Search and filters
4. **Virtual Scroll:** For long lists
5. **Image Optimization:** Compress and lazy load

### UX

1. **Feedback:** Show loading states
2. **Errors:** Provide retry options
3. **Empty States:** Guide users
4. **Tooltips:** Explain features
5. **Animations:** Keep under 300ms

### Accessibility

1. **Keyboard:** Test tab navigation
2. **Screen Readers:** Use ARIA labels
3. **Contrast:** Check color ratios
4. **Focus:** Visible indicators
5. **Text Size:** Support zoom

### Data Management

1. **Cache:** Store frequently accessed data
2. **Refresh:** Provide manual refresh
3. **Optimistic Updates:** Update UI immediately
4. **Error Recovery:** Retry failed requests
5. **State:** Use proper state management

---

## 📊 Analytics to Track

Monitor these metrics:

```typescript
// Dashboard usage
analytics.track("dashboard_viewed", { tab: activeTab });
analytics.track("sidebar_toggled", { collapsed: true });

// Stat card interactions
analytics.track("stat_card_clicked", { metric: "enrollments" });

// Course interactions
analytics.track("course_enrolled", { courseId, source: "dashboard" });
analytics.track("course_continued", { courseId });

// Referral actions
analytics.track("referral_code_copied");
analytics.track("referral_link_shared", { platform: "facebook" });

// Achievement engagement
analytics.track("achievement_viewed", { achievementId });
```

---

## 🎓 Advanced Customization

### Add Custom Activity Type

```tsx
// In ActivityTimeline.tsx
const activityIcons = {
    ...existingTypes,
    custom: {
        icon: YourIcon,
        color: "text-custom-600",
        bg: "bg-custom-100 dark:bg-custom-900/30",
    },
};
```

### Create Multi-Ring Progress

```tsx
import { MultiProgressRing } from "@/components/dashboard/ProgressRing";

<MultiProgressRing
    rings={[
        { progress: 80, color: "url(#gradient-1)", label: "Web Dev" },
        { progress: 60, color: "url(#gradient-2)", label: "Design" },
        { progress: 40, color: "url(#gradient-3)", label: "Marketing" },
    ]}
    size={200}
/>;
```

### Add Progress to Achievements

```tsx
{
  id: "progress-achievement",
  name: "On Track",
  description: "Complete 50% of a course",
  icon: Target,
  earned: false,
  rarity: "rare",
  progress: { current: 35, total: 50 } // Shows progress bar
}
```

---

## 🎉 You're All Set!

Your modern dashboard is production-ready with:

✅ Beautiful design\
✅ Smooth animations\
✅ Responsive layout\
✅ Intuitive navigation\
✅ Professional UX

**Need help?** Check component files for detailed code comments.

**Want more?** Phase 5 (Course Details & Payment) is next!

Happy dashboarding! 📊✨
