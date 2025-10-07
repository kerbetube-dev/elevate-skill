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
  Smartphone
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
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
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

  const handleApprove = async (withdrawalId: string) => {
    setProcessingId(withdrawalId);
    try {
      await withdrawalsService.approveWithdrawal(withdrawalId, adminNotes[withdrawalId] || '');
      
      toast({
        title: "Withdrawal Approved",
        description: "Withdrawal request has been approved successfully",
        variant: "default",
      });

      // Clear notes
      setAdminNotes(prev => ({ ...prev, [withdrawalId]: '' }));
      
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
    if (!rejectionReasons[withdrawalId]) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(withdrawalId);
    try {
      await withdrawalsService.rejectWithdrawal(withdrawalId, rejectionReasons[withdrawalId]);
      
      toast({
        title: "Withdrawal Rejected",
        description: "Withdrawal request has been rejected",
        variant: "default",
      });

      // Clear rejection reason
      setRejectionReasons(prev => ({ ...prev, [withdrawalId]: '' }));
      
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const approvedWithdrawals = withdrawals.filter(w => w.status === 'approved');
  const rejectedWithdrawals = withdrawals.filter(w => w.status === 'rejected');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Withdrawal Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading withdrawal requests...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{pendingWithdrawals.length}</div>
                <div className="text-sm text-gray-600">Pending Requests</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-green-600">{approvedWithdrawals.length}</div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-600">{rejectedWithdrawals.length}</div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Withdrawal Requests
              </CardTitle>
              <CardDescription>
                Review and manage user withdrawal requests
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchWithdrawals}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <Alert>
              <DollarSign className="h-4 w-4" />
              <AlertDescription>
                No withdrawal requests found.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <Card key={withdrawal.id} className="border-l-4 border-l-green-500">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(withdrawal.status)}
                        <span className="font-semibold text-lg">
                          {withdrawal.amount.toFixed(2)} ETB
                        </span>
                      </div>
                      {getStatusBadge(withdrawal.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-600">
                          <strong>Account Type:</strong> {withdrawal.accountType}
                        </p>
                        <p className="text-gray-600">
                          <strong>Account Number:</strong> {withdrawal.accountNumber}
                        </p>
                        <p className="text-gray-600">
                          <strong>Account Holder:</strong> {withdrawal.accountHolderName}
                        </p>
                        {withdrawal.phoneNumber && (
                          <p className="text-gray-600">
                            <strong>Phone:</strong> {withdrawal.phoneNumber}
                          </p>
                        )}
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <strong>Requested:</strong> {formatDate(withdrawal.createdAt)}
                        </p>
                        {withdrawal.processedAt && (
                          <p className="text-gray-600">
                            <strong>Processed:</strong> {formatDate(withdrawal.processedAt)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Admin Actions for Pending Requests */}
                    {withdrawal.status === 'pending' && (
                      <div className="space-y-3 p-3 bg-gray-50 rounded-md">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Admin Notes (Optional)
                          </label>
                          <Textarea
                            placeholder="Add notes for the user..."
                            value={adminNotes[withdrawal.id] || ''}
                            onChange={(e) => setAdminNotes(prev => ({ 
                              ...prev, 
                              [withdrawal.id]: e.target.value 
                            }))}
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Rejection Reason (Required for rejection)
                          </label>
                          <Textarea
                            placeholder="Provide reason for rejection..."
                            value={rejectionReasons[withdrawal.id] || ''}
                            onChange={(e) => setRejectionReasons(prev => ({ 
                              ...prev, 
                              [withdrawal.id]: e.target.value 
                            }))}
                            className="mt-1"
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(withdrawal.id)}
                            disabled={processingId === withdrawal.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processingId === withdrawal.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(withdrawal.id)}
                            disabled={processingId === withdrawal.id}
                            variant="destructive"
                          >
                            {processingId === withdrawal.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Reject
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Show admin notes and rejection reason for processed requests */}
                    {withdrawal.adminNotes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm">
                          <strong>Admin Notes:</strong> {withdrawal.adminNotes}
                        </p>
                      </div>
                    )}

                    {withdrawal.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-md">
                        <p className="text-sm text-red-700">
                          <strong>Rejection Reason:</strong> {withdrawal.rejectionReason}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WithdrawalManagement;
