import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  CreditCard, 
  Users, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  Clock,
  LogOut,
  RefreshCw,
  UserCheck,
  UserX,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService, PaymentRequest, AdminStats } from '@/services/admin';
import UserManagement from '@/components/admin/UserManagement';
import CourseManagement from '@/components/admin/CourseManagement';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import PaymentAccountManagement from '@/components/admin/PaymentAccountManagement';
import WithdrawalManagement from '@/components/admin/WithdrawalManagement';

// Interfaces are now imported from admin service

const AdminDashboard: React.FC = () => {
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const adminToken = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');
  
  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/dashboard' || path === '/admin/payments') return 'payments';
    if (path === '/admin/payment-accounts') return 'payment-accounts';
    if (path === '/admin/users') return 'users';
    if (path === '/admin/courses') return 'courses';
    if (path === '/admin/withdrawals') return 'withdrawals';
    if (path === '/admin/analytics') return 'analytics';
    return 'payments'; // default
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTab());
  
  // Update activeTab when URL changes
  useEffect(() => {
    setActiveTab(getActiveTab());
  }, [location.pathname]);

  useEffect(() => {
    if (!adminToken || !adminUser) {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [adminToken, adminUser, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payments, statsData] = await Promise.all([
        adminService.getPaymentRequests(),
        adminService.getStats(),
      ]);
      
      setPaymentRequests(payments);
      setStats(statsData);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string, adminNotes?: string) => {
    try {
      setProcessingId(requestId);
      await adminService.approvePaymentRequest(requestId, {
        status: 'approved',
        adminNotes: adminNotes || 'Payment approved by admin',
      });
      
      toast({
        title: "Payment Approved",
        description: "The payment request has been approved successfully.",
      });
      fetchData(); // Refresh data
    } catch (err: any) {
      toast({
        title: "Approval Failed",
        description: err.response?.data?.detail || 'Failed to approve payment',
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string, rejectionReason: string) => {
    try {
      setProcessingId(requestId);
      await adminService.rejectPaymentRequest(requestId, {
        status: 'rejected',
        rejectionReason: rejectionReason,
      });
      
      toast({
        title: "Payment Rejected",
        description: "The payment request has been rejected.",
      });
      fetchData(); // Refresh data
    } catch (err: any) {
      toast({
        title: "Rejection Failed",
        description: err.response?.data?.detail || 'Failed to reject payment',
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Payments</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.approvedPayments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected Payments</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.rejectedPayments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPayments}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.inactiveUsers}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value);
          // Navigate to corresponding route
          if (value === 'payments') navigate('/admin/payments');
          if (value === 'payment-accounts') navigate('/admin/payment-accounts');
          if (value === 'users') navigate('/admin/users');
          if (value === 'courses') navigate('/admin/courses');
          if (value === 'withdrawals') navigate('/admin/withdrawals');
          if (value === 'analytics') navigate('/admin/analytics');
        }} className="space-y-6">
          <TabsList>
            <TabsTrigger value="payments">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Requests
            </TabsTrigger>
            <TabsTrigger value="payment-accounts">
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Accounts
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="w-4 h-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="withdrawals">
              <DollarSign className="w-4 h-4 mr-2" />
              Withdrawals
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics & Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Requests</CardTitle>
                <CardDescription>
                  Review and approve payment requests from users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p>Loading payment requests...</p>
                  </div>
                ) : paymentRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No payment requests found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentRequests.map((request) => (
                      <Card key={request.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-medium">{request.userName}</h3>
                              <span className="text-sm text-gray-500">{request.userEmail}</span>
                              {getStatusBadge(request.status)}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              <p><strong>Course:</strong> {request.courseTitle}</p>
                              <p><strong>Amount:</strong> {request.amount} ETB</p>
                              <p><strong>Payment Method:</strong> {request.paymentAccountName || request.paymentAccountType || 'N/A'}</p>
                              <p><strong>Requested:</strong> {new Date(request.createdAt).toLocaleString()}</p>
                            </div>
                            
                            {/* Transaction Screenshot */}
                            {request.transactionScreenshotUrl && (
                              <div className="mb-3">
                                <p className="text-sm font-medium text-gray-700 mb-2">Transaction Screenshot:</p>
                                <div className="border rounded-lg p-2 bg-gray-50">
                                  <img 
                                    src={`http://localhost:8004${request.transactionScreenshotUrl}`}
                                    alt="Transaction Screenshot"
                                    className="max-w-full h-auto max-h-64 rounded border"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      e.currentTarget.nextElementSibling.style.display = 'block';
                                    }}
                                  />
                                  <div style={{display: 'none'}} className="text-sm text-gray-500 p-2">
                                    Screenshot not available
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {request.adminNotes && (
                              <p className="text-sm text-blue-600"><strong>Admin Notes:</strong> {request.adminNotes}</p>
                            )}
                            {request.rejectionReason && (
                              <p className="text-sm text-red-600"><strong>Rejection Reason:</strong> {request.rejectionReason}</p>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(request.id)}
                                  disabled={processingId === request.id}
                                >
                                  {processingId === request.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    const reason = prompt('Enter rejection reason:');
                                    if (reason) handleReject(request.id, reason);
                                  }}
                                  disabled={processingId === request.id}
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payment-accounts">
            <PaymentAccountManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="courses">
            <CourseManagement />
          </TabsContent>

          <TabsContent value="withdrawals">
            <WithdrawalManagement onRefresh={fetchPaymentRequests} />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
