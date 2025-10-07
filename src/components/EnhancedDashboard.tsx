/**
 * Enhanced Dashboard with improved UX, loading states, and error handling
 * Uses the new loading components and error handling utilities
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  Home, 
  User, 
  CreditCard, 
  Share2, 
  GraduationCap,
  Clock,
  Award,
  TrendingUp,
  Settings,
  LogOut,
  Bell,
  Search,
  RefreshCw,
  DollarSign
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToastNotifications } from "./ui/Toast";
import { useErrorHandler } from "../utils/errorHandler";
import { LoadingPage, LoadingCard, LoadingTable, RefreshButton } from "./ui/Loading";
import { CourseDetails } from "./CourseDetails";
import { ReferFriends } from "./ReferFriends";
import { WithdrawalRequest } from "./WithdrawalRequest";
import { WithdrawalHistory } from "./WithdrawalHistory";
import { coursesService, Course } from "@/services/courses";
import { userService } from "@/services/user";
import { dashboardService } from "@/services/dashboard";
import { authService } from "@/services/auth";
import { paymentService, Enrollment, PaymentRequest } from "@/services/payments";
import elevateSkillLogo from "@/assets/elevate-skill-logo.png";

const EnhancedDashboard = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, showError} = useToastNotifications();
  const { handleError } = useErrorHandler();
  const navigate = useNavigate();

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Check if user is authenticated
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Fetch data in parallel
      const [coursesData, enrollmentsData, paymentsData, statsData] = await Promise.all([
        coursesService.getAllCourses(),
        paymentService.getMyEnrollments(),
        paymentService.getMyPaymentRequests(),
        dashboardService.getDashboardStats()
      ]);

      setCourses(coursesData);
      setEnrolledCourses(enrollmentsData);
      setPaymentRequests(paymentsData);
      setDashboardStats(statsData);

      if (isRefresh) {
        showSuccess("Dashboard Updated", "Your dashboard data has been refreshed.");
      }

    } catch (error) {
      const errorMessage = handleError(error);
      setError(errorMessage);
      showError("Failed to Load Dashboard", errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      showSuccess("Logged Out", "You have been successfully logged out.");
      navigate('/');
    } catch (error) {
      const errorMessage = handleError(error);
      showError("Logout Failed", errorMessage);
    }
  };

  const handleEnrollCourse = async (courseId: string) => {
    try {
      // Check if already enrolled
      const isEnrolled = await paymentService.checkEnrollment(courseId);
      if (isEnrolled) {
        showSuccess("Already Enrolled", "You are already enrolled in this course!");
        return;
      }

      // Redirect to payment page
      navigate(`/payment?courseId=${courseId}`);
    } catch (error) {
      console.error('Error checking enrollment:', error);
      // Still redirect to payment page if check fails
      navigate(`/payment?courseId=${courseId}`);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Loading state
  if (loading) {
    return (
      <LoadingPage 
        loading={true} 
        loadingText="Loading your dashboard..."
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error Loading Dashboard</CardTitle>
            <CardDescription className="text-center">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "enrolled", label: "My Courses", icon: GraduationCap },
    { id: "refer", label: "Refer Friends", icon: Share2 },
    { id: "withdrawals", label: "Withdrawals", icon: DollarSign },
  ];

  const renderHomeTab = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Welcome Back!
          </CardTitle>
          <CardDescription>
            Here's what's happening with your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {dashboardStats?.totalCourses || 0}
              </div>
              <div className="text-sm text-blue-600">Available Courses</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {enrolledCourses.length}
              </div>
              <div className="text-sm text-green-600">Enrolled Courses</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {dashboardStats?.totalEarnings || 0}
              </div>
              <div className="text-sm text-purple-600">Total Earnings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={() => setActiveTab("courses")}
              className="h-20 flex flex-col items-center justify-center"
            >
              <BookOpen className="w-6 h-6 mb-2" />
              Browse Courses
            </Button>
            <Button 
              onClick={() => setActiveTab("refer")}
              variant="outline"
              className="h-20 flex flex-col items-center justify-center"
            >
              <Share2 className="w-6 h-6 mb-2" />
              Refer Friends
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {enrolledCourses.slice(0, 3).map((course, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <div className="font-medium">{course.title}</div>
                  <div className="text-sm text-gray-600">Enrolled</div>
                </div>
                <Badge variant="secondary">Active</Badge>
              </div>
            ))}
            {enrolledCourses.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No recent activity. Start by enrolling in a course!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCoursesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Available Courses</h2>
        <RefreshButton refreshing={refreshing} onRefresh={handleRefresh}>
          Refresh
        </RefreshButton>
      </div>

      <LoadingCard loading={refreshing} loadingText="Refreshing courses...">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-12 h-12 text-white" />
              </div>
              <CardContent className="p-4">
                <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                <CardDescription className="mb-4">{course.description}</CardDescription>
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary">{course.level}</Badge>
                  <span className="font-bold text-lg">${course.price}</span>
                </div>
                <Button 
                  onClick={() => handleEnrollCourse(course.id)}
                  className="w-full"
                >
                  Enroll Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </LoadingCard>
    </div>
  );

  const renderEnrolledTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Courses</h2>
        <RefreshButton onRefresh={() => fetchDashboardData(true)} isRefreshing={refreshing} />
      </div>
      
      {/* Enrolled Courses */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Enrolled Courses ({enrolledCourses.length})</h3>
        <LoadingCard loading={refreshing} loadingText="Loading your courses...">
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledCourses.map((enrollment) => (
                <Card key={enrollment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5 text-primary" />
                        <CardTitle className="text-base">{enrollment.courseTitle}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Enrolled
                      </Badge>
                    </div>
                    <CardDescription className="text-sm mt-2">
                      {enrollment.courseDescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{enrollment.courseLevel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">{enrollment.courseDuration}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-primary">{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="h-2" />
                    </div>

                    {/* Enrolled Date */}
                    <div className="text-xs text-gray-500">
                      Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </div>

                    <Button className="w-full" variant="default">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Enrolled Courses Yet</h3>
                <p className="text-gray-600 mb-4">Browse our courses and enroll to start learning!</p>
                <Button onClick={() => navigate('/')}>
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          )}
        </LoadingCard>
      </div>

      {/* Payment Requests Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">Payment Requests ({paymentRequests.length})</h3>
        <LoadingCard loading={refreshing} loadingText="Loading payment requests...">
          {paymentRequests.length > 0 ? (
            <div className="space-y-3">
              {paymentRequests.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{payment.courseTitle}</span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Amount: <span className="font-semibold">{paymentService.formatAmount(payment.amount)}</span></div>
                          <div>Submitted: {new Date(payment.createdAt).toLocaleDateString()}</div>
                          {payment.transactionReference && (
                            <div>Reference: <span className="font-mono text-xs">{payment.transactionReference}</span></div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={paymentService.getStatusColor(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                        {payment.status === 'pending' && (
                          <div className="text-xs text-gray-500 mt-2">Under Review</div>
                        )}
                        {payment.status === 'rejected' && payment.rejectionReason && (
                          <div className="text-xs text-red-600 mt-2 max-w-xs">{payment.rejectionReason}</div>
                        )}
                        {payment.status === 'approved' && (
                          <div className="text-xs text-green-600 mt-2">Approved!</div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-600">No payment requests</p>
              </CardContent>
            </Card>
          )}
        </LoadingCard>
      </div>
    </div>
  );

  const renderWithdrawalsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Withdrawals</h2>
        <RefreshButton refreshing={refreshing} onRefresh={handleRefresh}>
          Refresh
        </RefreshButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WithdrawalRequest 
          userEarnings={dashboardStats?.totalEarnings || 0}
          onSuccess={handleRefresh}
        />
        <WithdrawalHistory onRefresh={handleRefresh} />
      </div>
    </div>
  );

  // Keep the old empty state
  const renderOldEmptyState = () => (
    <LoadingCard>
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Enrolled Courses</h3>
        <p className="text-gray-600 mb-4">Start your learning journey by enrolling in a course.</p>
        <Button onClick={() => setActiveTab("courses")}>
          Browse Courses
        </Button>
      </div>
    </LoadingCard>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src={elevateSkillLogo} alt="Elevate Skil" className="h-8" />
              <h1 className="text-xl font-bold">Elevate Skil</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 space-y-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "home" && renderHomeTab()}
            {activeTab === "courses" && renderCoursesTab()}
            {activeTab === "enrolled" && renderEnrolledTab()}
            {activeTab === "refer" && <ReferFriends />}
            {activeTab === "withdrawals" && renderWithdrawalsTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
