import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  CreditCard,
  Smartphone,
  Filter,
  Search,
  User,
  Calendar,
  Eye,
  AlertCircle,
  TrendingUp,
  Banknote
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { withdrawalsService, WithdrawalResponse } from '@/services/withdrawals';

interface WithdrawalManagementProps {
  onRefresh?: () => void;
}

const WithdrawalManagement: React.FC<WithdrawalManagementProps> = ({ onRefresh }) => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [admin_notes, setadmin_notes] = useState<Record<string, string>>({});
  const [rejection_reasons, setrejection_reasons] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { toast } = useToast();

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const data = await withdrawalsService.getAllWithdrawals();
      setWithdrawals(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch withdrawal requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // Filter withdrawals based on status and search term
  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const matchesStatus = filterStatus === 'all' || withdrawal.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      withdrawal.account_holder_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.account_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.account_type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Group withdrawals by status for better organization
  const groupedWithdrawals = {
    pending: filteredWithdrawals.filter(w => w.status === 'pending'),
    approved: filteredWithdrawals.filter(w => w.status === 'approved'),
    rejected: filteredWithdrawals.filter(w => w.status === 'rejected')
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

  const handleApprove = async (withdrawalId: string) => {
    setProcessingId(withdrawalId);
    try {
      await withdrawalsService.approveWithdrawal(withdrawalId, admin_notes[withdrawalId] || '');
      
      toast({
        title: "Withdrawal Approved",
        description: "Withdrawal request has been approved successfully",
        variant: "default",
      });

      // Clear notes
      setadmin_notes(prev => ({ ...prev, [withdrawalId]: '' }));
      
      // Refresh data
      await fetchWithdrawals();
      onRefresh?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve withdrawal request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (withdrawalId: string) => {
    if (!rejection_reasons[withdrawalId]) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(withdrawalId);
    try {
      await withdrawalsService.rejectWithdrawal(withdrawalId, rejection_reasons[withdrawalId]);
      
      toast({
        title: "Withdrawal Rejected",
        description: "Withdrawal request has been rejected",
        variant: "default",
      });

      // Clear rejection reason
      setrejection_reasons(prev => ({ ...prev, [withdrawalId]: '' }));
      
      // Refresh data
      await fetchWithdrawals();
      onRefresh?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject withdrawal request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
            <h2 className="text-2xl font-bold mb-2">Withdrawal Requests</h2>
            <p className="text-green-100">Manage withdrawal requests from users</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-3xl font-bold">{filteredWithdrawals.length}</div>
              <div className="text-green-100 text-sm">Total Requests</div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchWithdrawals}
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
                  placeholder="Search by account holder, account number, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                All ({withdrawals.length})
              </Button>
              <Button
                variant={filterStatus === 'pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('pending')}
                className="flex items-center gap-2"
              >
                <Clock className="w-4 h-4" />
                Pending ({groupedWithdrawals.pending.length})
              </Button>
              <Button
                variant={filterStatus === 'approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('approved')}
                className="flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approved ({groupedWithdrawals.approved.length})
              </Button>
              <Button
                variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('rejected')}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Rejected ({groupedWithdrawals.rejected.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Requests Grid */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Loading withdrawal requests...</p>
        </div>
      ) : filteredWithdrawals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Withdrawal Requests Found</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No withdrawal requests have been submitted yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredWithdrawals.map((withdrawal) => (
            <Card key={withdrawal.id} className="hover:shadow-xl transition-all duration-300 shadow-md border-0 bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Banknote className="w-5 h-5 text-white" />
                      </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 truncate">{withdrawal.account_holder_name}</h3>
                      <p className="text-sm text-gray-500 truncate">{withdrawal.account_type}</p>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(withdrawal.status)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-5 p-6">
                {/* Amount Info */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-800">Amount</span>
                  </div>
                  <p className="text-lg font-bold text-green-600">{withdrawal.amount} ETB</p>
                </div>

                {/* Account Details */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account Number</span>
                    <span className="text-sm font-medium">{withdrawal.account_number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Account Type</span>
                    <span className="text-sm font-medium">{withdrawal.account_type}</span>
                  </div>
                        {withdrawal.phone_number && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Phone</span>
                      <span className="text-sm font-medium">{withdrawal.phone_number}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Requested</span>
                    <span className="text-sm">{new Date(withdrawal.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Admin Notes */}
                {withdrawal.admin_notes && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">Admin Notes</span>
                    </div>
                    <p className="text-sm text-gray-700">{withdrawal.admin_notes}</p>
                      </div>
                )}

                {/* Rejection Reason */}
                {withdrawal.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-2 mb-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Rejection Reason</span>
                    </div>
                    <p className="text-sm text-red-700">{withdrawal.rejection_reason}</p>
                  </div>
                )}

                {/* Action Buttons */}
                    {withdrawal.status === 'pending' && (
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                          <Textarea
                        placeholder="Add admin notes (optional)"
                            value={admin_notes[withdrawal.id] || ''}
                        onChange={(e) => setadmin_notes(prev => ({ ...prev, [withdrawal.id]: e.target.value }))}
                        className="w-full h-20 text-sm"
                      />
                          <Button
                        size="sm"
                            onClick={() => handleApprove(withdrawal.id)}
                            disabled={processingId === withdrawal.id}
                        className="w-full bg-green-600 hover:bg-green-700 shadow-sm"
                          >
                            {processingId === withdrawal.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                          <CheckCircle className="w-4 h-4" />
                            )}
                            Approve
                          </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Rejection reason (required)"
                        value={rejection_reasons[withdrawal.id] || ''}
                        onChange={(e) => setrejection_reasons(prev => ({ ...prev, [withdrawal.id]: e.target.value }))}
                        className="w-full h-20 text-sm"
                      />
                          <Button
                        size="sm"
                        variant="destructive"
                            onClick={() => handleReject(withdrawal.id)}
                        disabled={processingId === withdrawal.id || !rejection_reasons[withdrawal.id]}
                        className="w-full shadow-sm"
                      >
                        <XCircle className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
    </div>
  );
};

export default WithdrawalManagement;