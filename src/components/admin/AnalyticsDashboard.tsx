import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  TrendingUp, 
  TrendingDown,
  Users, 
  BookOpen, 
  DollarSign,
  BarChart3,
  PieChart,
  Activity,
  Download,
  Calendar,
  RefreshCw,
  Target,
  Award,
  UserCheck,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/services/admin';

const AnalyticsDashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [courseData, setCourseData] = useState<any>(null);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [referralData, setReferralData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, [selectedPeriod]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [
        overviewData,
        revenueAnalytics,
        userAnalytics,
        courseAnalytics,
        enrollmentAnalytics,
        referralAnalytics
      ] = await Promise.all([
        adminService.getAnalyticsOverview(),
        adminService.getRevenueAnalytics(selectedPeriod),
        adminService.getUserAnalytics(selectedPeriod),
        adminService.getCourseAnalytics(),
        adminService.getEnrollmentAnalytics(selectedPeriod),
        adminService.getReferralAnalytics()
      ]);

      setOverview(overviewData);
      setRevenueData(revenueAnalytics);
      setUserData(userAnalytics);
      setCourseData(courseAnalytics);
      setEnrollmentData(enrollmentAnalytics);
      setReferralData(referralAnalytics);
    } catch (err: any) {
      // Extract error message from backend response structure
      let errorMessage = 'Failed to fetch analytics data';

      if (err.response?.data?.detail) {
        // Handle nested error structure: {"detail": {"message": "error message"}}
        if (typeof err.response.data.detail === 'object' && err.response.data.detail.message) {
          errorMessage = err.response.data.detail.message;
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getPeriodLabel = (period: string) => {
    const labels = {
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days',
      '1y': 'Last Year'
    };
    return labels[period as keyof typeof labels] || 'Last 30 Days';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin mr-2" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mb-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Reports</h2>
          <p className="text-gray-600">Comprehensive insights into your platform performance</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchAllData} disabled={loading} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(overview.total_users)}</div>
              <p className="text-xs text-muted-foreground">
                +{formatNumber(overview.recent_users)} in last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(overview.total_courses)}</div>
              <p className="text-xs text-muted-foreground">
                Active courses available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(overview.total_enrollments)}</div>
              <p className="text-xs text-muted-foreground">
                +{formatNumber(overview.recent_enrollments)} in last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(overview.total_revenue)}</div>
              <p className="text-xs text-muted-foreground">
                +{formatCurrency(overview.recent_revenue)} in last 30 days
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Tabs */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
        </TabsList>

        {/* Revenue Analytics */}
        <TabsContent value="revenue" className="space-y-6">
          {revenueData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(revenueData.total_revenue)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getPeriodLabel(selectedPeriod)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Daily Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {formatCurrency(revenueData.total_revenue / (selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : selectedPeriod === '90d' ? 90 : 365))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Per day
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Growth Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-2xl font-bold text-green-600">+12.5%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      vs previous period
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>
                    Daily revenue for {getPeriodLabel(selectedPeriod)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p>Revenue chart would be displayed here</p>
                      <p className="text-sm">Data points: {revenueData.daily_revenue.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* User Analytics */}
        <TabsContent value="users" className="space-y-6">
          {userData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">New Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {formatNumber(userData.total_new_users)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getPeriodLabel(selectedPeriod)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Daily Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {Math.round(userData.total_new_users / (selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : selectedPeriod === '90d' ? 90 : 365))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      New users per day
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Growth Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-2xl font-bold text-green-600">+8.3%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      vs previous period
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>
                    Daily new user registrations for {getPeriodLabel(selectedPeriod)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Activity className="w-12 h-12 mx-auto mb-2" />
                      <p>User growth chart would be displayed here</p>
                      <p className="text-sm">Data points: {userData.daily_users.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Course Analytics */}
        <TabsContent value="courses" className="space-y-6">
          {courseData && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Courses</CardTitle>
                    <CardDescription>
                      Courses ranked by enrollment count
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courseData.top_courses.slice(0, 5).map((course: any, index: number) => (
                        <div key={course.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <div>
                              <p className="font-medium">{course.title}</p>
                              <p className="text-sm text-gray-500">{course.instructor}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{course.enrollments} enrollments</p>
                            <p className="text-sm text-green-600">{formatCurrency(course.revenue)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Course Completion Rates</CardTitle>
                    <CardDescription>
                      Completion rates by course
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {courseData.completion_rates.slice(0, 5).map((course: any, index: number) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{course.title}</span>
                            <span>{course.completion_rate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${course.completion_rate}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{course.completed_enrollments} completed</span>
                            <span>{course.total_enrollments} total</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Enrollment Analytics */}
        <TabsContent value="enrollments" className="space-y-6">
          {enrollmentData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Enrollments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {formatNumber(enrollmentData.daily_enrollments.reduce((sum: number, day: any) => sum + day.enrollments, 0))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getPeriodLabel(selectedPeriod)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Daily Average</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {Math.round(enrollmentData.daily_enrollments.reduce((sum: number, day: any) => sum + day.enrollments, 0) / (selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : selectedPeriod === '90d' ? 90 : 365))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Enrollments per day
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Peak Day</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-orange-600">
                      {Math.max(...enrollmentData.daily_enrollments.map((day: any) => day.enrollments))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Highest single day
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Enrollment Trend</CardTitle>
                    <CardDescription>
                      Daily enrollments for {getPeriodLabel(selectedPeriod)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                        <p>Enrollment trend chart would be displayed here</p>
                        <p className="text-sm">Data points: {enrollmentData.daily_enrollments.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Courses by Enrollments</CardTitle>
                    <CardDescription>
                      Most popular courses this period
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {enrollmentData.course_enrollments.slice(0, 5).map((course: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">#{index + 1}</Badge>
                            <span className="font-medium">{course.title}</span>
                          </div>
                          <span className="text-sm text-gray-500">{course.enrollments} enrollments</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Referral Analytics */}
        <TabsContent value="referrals" className="space-y-6">
          {referralData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Referrals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {formatNumber(referralData.statistics.total_referrals)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      All time
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Successful</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {formatNumber(referralData.statistics.completed_referrals)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((referralData.statistics.completed_referrals / referralData.statistics.total_referrals) * 100)}% success rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">
                      {formatNumber(referralData.statistics.pending_referrals)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Awaiting completion
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Rewards Paid</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {formatCurrency(referralData.statistics.total_rewards_paid)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total rewards distributed
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top Referrers</CardTitle>
                  <CardDescription>
                    Users with the most successful referrals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {referralData.top_referrers.slice(0, 10).map((referrer: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <div>
                            <p className="font-medium">{referrer.name}</p>
                            <p className="text-sm text-gray-500">{referrer.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{referrer.successful_referrals} successful</p>
                          <p className="text-sm text-green-600">{formatCurrency(referrer.total_earnings)} earned</p>
                          <p className="text-xs text-gray-500">{referrer.total_referrals} total referrals</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
