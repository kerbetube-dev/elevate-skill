import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  DollarSign,
  Menu,
  X,
  Home,
  Settings,
  Shield,
  Filter,
  Search,
  Calendar,
  Eye,
  Download,
  MoreVertical,
  AlertCircle,
  TrendingUp,
  User
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
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

  // Navigation items
  const navigationItems = [
    { id: 'payments', label: 'Payment Requests', icon: CreditCard, path: '/admin/payments' },
    { id: 'payment-accounts', label: 'Payment Accounts', icon: CreditCard, path: '/admin/payment-accounts' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'courses', label: 'Courses', icon: BookOpen, path: '/admin/courses' },
    { id: 'withdrawals', label: 'Withdrawals', icon: DollarSign, path: '/admin/withdrawals' },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, path: '/admin/analytics' },
  ];

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

  const handleApprove = async (requestId: string, admin_notes?: string) => {
    try {
      setProcessingId(requestId);
      await adminService.approvePaymentRequest(requestId, {
        status: 'approved',
        admin_notes: admin_notes || 'Payment approved by admin',
      });
      
      toast({
        title: "Payment Approved",
        description: "The payment request has been approved successfully.",
      });
      fetchData(); // Refresh data
    } catch (err: any) {
      // Extract error message from backend response structure
      let errorMessage = 'Failed to approve payment';

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

      toast({
        title: "Approval Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string, rejection_reason: string) => {
    try {
      setProcessingId(requestId);
      await adminService.rejectPaymentRequest(requestId, {
        status: 'rejected',
        rejection_reason: rejection_reason,
      });
      
      toast({
        title: "Payment Rejected",
        description: "The payment request has been rejected.",
      });
      fetchData(); // Refresh data
    } catch (err: any) {
      // Extract error message from backend response structure
      let errorMessage = 'Failed to reject payment';

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

      toast({
        title: "Rejection Failed",
        description: errorMessage,
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
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 whitespace-nowrap"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800 text-xs px-2 py-1 whitespace-nowrap"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs px-2 py-1 whitespace-nowrap"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-xs px-2 py-1 whitespace-nowrap">{status}</Badge>;
    }
  };

  const handleNavigation = (item: typeof navigationItems[0]) => {
    setActiveTab(item.id);
    navigate(item.path);
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  // Filter payment requests based on status and search term
  const filteredPaymentRequests = paymentRequests.filter((request) => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Group payment requests by status for better organization
  const groupedRequests = {
    pending: filteredPaymentRequests.filter(req => req.status === 'pending'),
    approved: filteredPaymentRequests.filter(req => req.status === 'approved'),
    rejected: filteredPaymentRequests.filter(req => req.status === 'rejected')
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'payments':
  return (
          <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Payment Requests</h2>
                  <p className="text-blue-100">Review and approve payment requests from users</p>
            </div>
            <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-3xl font-bold">{filteredPaymentRequests.length}</div>
                    <div className="text-blue-100 text-sm">Total Requests</div>
                  </div>
              <Button
                    variant="secondary"
                size="sm"
                onClick={fetchData}
                disabled={loading}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

            {/* Filters and Search */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search by user name, email, or course..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  {/* Status Filter */}
                  <div className="flex gap-2">
                    <Button
                      variant={filterStatus === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('all')}
                      className="flex items-center gap-2"
                    >
                      <Filter className="w-4 h-4" />
                      All ({paymentRequests.length})
                    </Button>
                    <Button
                      variant={filterStatus === 'pending' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('pending')}
                      className="flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      Pending ({groupedRequests.pending.length})
                    </Button>
                    <Button
                      variant={filterStatus === 'approved' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('approved')}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approved ({groupedRequests.approved.length})
                    </Button>
                    <Button
                      variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus('rejected')}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejected ({groupedRequests.rejected.length})
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Requests Grid */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading payment requests...</p>
              </div>
            ) : filteredPaymentRequests.length === 0 ? (
            <Card>
                <CardContent className="text-center py-12">
                  <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Requests Found</h3>
                  <p className="text-gray-500">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'No payment requests have been submitted yet.'}
                  </p>
              </CardContent>
            </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredPaymentRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-xl transition-all duration-300 shadow-md border-0 bg-white">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="w-10 h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-white" />
          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">{request.userName}</h3>
                            <p className="text-sm text-gray-500 truncate">{request.userEmail}</p>
                  </div>
                  </div>
                        <div className="flex-shrink-0">
                              {getStatusBadge(request.status)}
                            </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-5 p-6">
                      {/* Course Info */}
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                        <div className="flex items-center space-x-2 mb-2">
                          <BookOpen className="w-4 h-4 text-gray-600" />
                          <span className="font-medium text-gray-800">Course</span>
                        </div>
                        <p className="text-sm text-gray-700">{request.courseTitle}</p>
                      </div>

                      {/* Payment Details */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Amount</span>
                          <span className="font-semibold text-green-600">{request.amount} ETB</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Payment Method</span>
                          <span className="text-sm font-medium">{request.paymentAccountName || request.paymentaccount_type || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Requested</span>
                          <span className="text-sm">{new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                            </div>
                            
                            {/* Transaction Screenshot */}
                            {request.transactionScreenshotUrl && (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Eye className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">Transaction Screenshot</span>
                          </div>
                          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 shadow-sm">
                            <Dialog>
                              <DialogTrigger asChild>
                                <div className="cursor-pointer group relative">
                                  <img 
                                    src={`http://localhost:8000${request.transactionScreenshotUrl}`}
                                    alt="Transaction Screenshot"
                                    className="w-full h-32 object-cover rounded border border-gray-200 group-hover:opacity-90 transition-opacity"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                                    }}
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Eye className="w-8 h-8 text-white" />
                                    </div>
                                  </div>
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Transaction Screenshot</DialogTitle>
                                  <DialogDescription>
                                    Payment request screenshot for {request.userName} - {request.courseTitle}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="bg-gray-50 rounded-lg p-4">
                                    <img 
                                      src={`http://localhost:8000${request.transactionScreenshotUrl}`}
                                      alt="Transaction Screenshot"
                                      className="w-full h-auto max-h-[60vh] object-contain rounded border border-gray-200"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                                      }}
                                    />
                                    <div style={{display: 'none'}} className="text-center py-8 text-gray-500">
                                      <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                      <p>Screenshot not available</p>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium text-gray-700">Amount:</span>
                                      <span className="ml-2 text-gray-600">ETB {request.amount.toLocaleString()}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-700">Reference:</span>
                                      <span className="ml-2 text-gray-600">{request.transactionReference || 'N/A'}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-700">Submitted:</span>
                                      <span className="ml-2 text-gray-600">{new Date(request.created_at).toLocaleString()}</span>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-700">Status:</span>
                                      <Badge 
                                        variant={request.status === 'approved' ? 'default' : request.status === 'rejected' ? 'destructive' : 'secondary'}
                                        className="ml-2"
                                      >
                                        {request.status}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <div style={{display: 'none'}} className="text-sm text-gray-500 p-2 text-center">
                                    Screenshot not available
                                  </div>
                                </div>
                              </div>
                            )}
                            
                      {/* Admin Notes */}
                            {request.admin_notes && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-800">Admin Notes</span>
                          </div>
                          <p className="text-sm text-gray-700">{request.admin_notes}</p>
                        </div>
                      )}

                      {/* Rejection Reason */}
                            {request.rejection_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-center space-x-2 mb-2">
                            <XCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-red-800">Rejection Reason</span>
                          </div>
                          <p className="text-sm text-red-700">{request.rejection_reason}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                            {request.status === 'pending' && (
                        <div className="flex space-x-3 pt-4">
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(request.id)}
                                  disabled={processingId === request.id}
                            className="flex-1 bg-green-600 hover:bg-green-700 shadow-sm"
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
                            className="flex-1 shadow-sm"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Reject
                                </Button>
                        </div>
                      )}
                    </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
          </div>
        );
      case 'payment-accounts':
        return <PaymentAccountManagement />;
      case 'users':
        return <UserManagement />;
      case 'courses':
        return <CourseManagement />;
      case 'withdrawals':
        return <WithdrawalManagement onRefresh={() => setPaymentRequests([])} />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return null;
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-blue-600" />
                <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchData}
                disabled={loading}
                className="hidden sm:flex"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
                  <p className="text-xs text-gray-500">Course Management</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {adminUser ? JSON.parse(adminUser).username : 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchData}
                  disabled={loading}
                  className="w-full"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Desktop Header */}
          <header className="hidden lg:block bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {navigationItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {activeTab === 'payments' && 'Manage payment requests and approvals'}
                    {activeTab === 'payment-accounts' && 'Configure payment account settings'}
                    {activeTab === 'users' && 'Manage user accounts and permissions'}
                    {activeTab === 'courses' && 'Create and manage course content'}
                    {activeTab === 'withdrawals' && 'Process withdrawal requests'}
                    {activeTab === 'analytics' && 'View analytics and generate reports'}
                  </p>
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
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="p-6">
            {error && (
              <Alert className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-800">Pending Payments</CardTitle>
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-700">{stats.pendingPayments}</div>
                    <p className="text-xs text-yellow-600 mt-1">Awaiting approval</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">Approved Payments</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-700">{stats.approvedPayments}</div>
                    <p className="text-xs text-green-600 mt-1">Successfully processed</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-800">Rejected Payments</CardTitle>
                    <XCircle className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-700">{stats.rejectedPayments}</div>
                    <p className="text-xs text-red-600 mt-1">Declined requests</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">Total Users</CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-700">{stats.totalUsers}</div>
                    <p className="text-xs text-blue-600 mt-1">Registered users</p>
              </CardContent>
            </Card>
              </div>
            )}

            {/* Dynamic Content */}
            <div className="space-y-6">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
