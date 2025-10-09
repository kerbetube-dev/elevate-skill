import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Search, 
  Filter, 
  Eye, 
  UserCheck, 
  UserX, 
  Users, 
  UserPlus,
  Mail,
  Calendar,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService, User, UsersResponse } from '@/services/admin';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const limit = 20;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(
        currentPage, 
        limit, 
        searchTerm || undefined, 
        statusFilter !== 'all' ? statusFilter : undefined
      );
      setUsers(response.users);
      setPagination(response.pagination);
    } catch (err: any) {
      // Extract error message from backend response structure
      let errorMessage = 'Failed to fetch users';

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

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleViewDetails = async (user: User) => {
    try {
      setDetailsLoading(true);
      setSelectedUser(user);
      const details = await adminService.getUserDetails(user.id);
      setUserDetails(details);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "Failed to fetch user details",
        variant: "destructive",
      });
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setProcessingId(userId);
      await adminService.updateUserStatus(userId, !currentStatus);
      
      toast({
        title: "User Status Updated",
        description: `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      });
      
      fetchUsers(); // Refresh the list
    } catch (err: any) {
      // Extract error message from backend response structure
      let errorMessage = 'Failed to update user status';

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
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <UserCheck className="w-3 h-3 mr-1" />
        Active
      </Badge>
    ) : (
      <Badge variant="destructive">
        <UserX className="w-3 h-3 mr-1" />
        Inactive
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage user accounts and view user information</p>
        </div>
        <Button onClick={fetchUsers} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Users ({pagination.total})
          </CardTitle>
          <CardDescription>
            Showing {users.length} of {pagination.total} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No users found</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.referralCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-2 text-gray-400" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(user.isActive ?? true)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(user.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                            {user.totalEarnings || 0} ETB
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetails(user)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>User Details</DialogTitle>
                                  <DialogDescription>
                                    Detailed information for {user.fullName}
                                  </DialogDescription>
                                </DialogHeader>
                                {detailsLoading ? (
                                  <div className="text-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                    <p>Loading user details...</p>
                                  </div>
                                ) : userDetails ? (
                                  <div className="space-y-6">
                                    {/* User Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Basic Information</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          <div><strong>Name:</strong> {userDetails.user.fullName}</div>
                                          <div><strong>Email:</strong> {userDetails.user.email}</div>
                                          <div><strong>Referral Code:</strong> {userDetails.user.referralCode}</div>
                                          <div><strong>Status:</strong> {getStatusBadge(userDetails.user.isActive ?? true)}</div>
                                          <div><strong>Joined:</strong> {formatDate(userDetails.user.created_at)}</div>
                                          <div><strong>Total Earnings:</strong> {userDetails.user.totalEarnings || 0} ETB</div>
                                        </CardContent>
                                      </Card>
                                      
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Statistics</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          <div><strong>Enrollments:</strong> {userDetails.enrollments.length}</div>
                                          <div><strong>Payment Methods:</strong> {userDetails.paymentMethods.length}</div>
                                          <div><strong>Referrals:</strong> {userDetails.referrals.length}</div>
                                        </CardContent>
                                      </Card>
                                    </div>

                                    {/* Enrollments */}
                                    {userDetails.enrollments.length > 0 && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Course Enrollments</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-2">
                                            {userDetails.enrollments.map((enrollment: any, index: number) => (
                                              <div key={index} className="p-3 border rounded-lg">
                                                <div className="font-medium">{enrollment.courseTitle || 'Unknown Course'}</div>
                                                <div className="text-sm text-gray-500">
                                                  Status: {enrollment.status} | Progress: {enrollment.progress || 0}%
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}

                                    {/* Referrals */}
                                    {userDetails.referrals.length > 0 && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle className="text-lg">Referrals</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <div className="space-y-2">
                                            {userDetails.referrals.map((referral: any, index: number) => (
                                              <div key={index} className="p-3 border rounded-lg">
                                                <div className="font-medium">{referral.name}</div>
                                                <div className="text-sm text-gray-500">
                                                  Email: {referral.email} | Status: {referral.status} | Reward: {referral.reward_earned} ETB
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}
                                  </div>
                                ) : null}
                              </DialogContent>
                            </Dialog>

                            <Button
                              size="sm"
                              variant={user.isActive ? "destructive" : "default"}
                              onClick={() => handleToggleStatus(user.id, user.isActive ?? true)}
                              disabled={processingId === user.id}
                            >
                              {processingId === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : user.isActive ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
