import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, DollarSign, Clock, CheckCircle, XCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { withdrawalsService, WithdrawalResponse } from '@/services/withdrawals';

interface WithdrawalHistoryProps {
  onRefresh?: () => void;
}

export const WithdrawalHistory: React.FC<WithdrawalHistoryProps> = ({ onRefresh }) => {
  const [withdrawals, setWithdrawals] = useState<WithdrawalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(5);
  const { toast } = useToast();

  const fetchWithdrawals = async () => {
    try {
      const data = await withdrawalsService.getMyWithdrawals();
      setWithdrawals(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch withdrawal history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWithdrawals();
    setVisibleCount(5); // Reset to show only top 5 after refresh
    onRefresh?.();
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 5, withdrawals.length));
  };

  const visibleWithdrawals = withdrawals.slice(0, visibleCount);
  const hasMore = visibleCount < withdrawals.length;

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

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Withdrawal History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading withdrawal history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Withdrawal History
            </CardTitle>
            <CardDescription>
              Track your withdrawal requests and their status
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
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
              No withdrawal requests found. Submit your first withdrawal request to see it here.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {visibleWithdrawals.map((withdrawal) => (
              <Card key={withdrawal.id} className="shadow-md hover:shadow-lg transition-shadow duration-200 border-0 bg-white">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">
                        <strong>Account Type:</strong> {withdrawal.account_type}
                      </p>
                      <p className="text-gray-600">
                        <strong>Account Number:</strong> {withdrawal.account_number}
                      </p>
                      <p className="text-gray-600">
                        <strong>Account Holder:</strong> {withdrawal.account_holder_name}
                      </p>
                      {withdrawal.phone_number && (
                        <p className="text-gray-600">
                          <strong>Phone:</strong> {withdrawal.phone_number}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-gray-600">
                        <strong>Requested:</strong> {formatDate(withdrawal.created_at)}
                      </p>
                      {withdrawal.processed_at && (
                        <p className="text-gray-600">
                          <strong>Processed:</strong> {formatDate(withdrawal.processed_at)}
                        </p>
                      )}
                    </div>
                  </div>

                  {withdrawal.admin_notes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm">
                        <strong>Admin Notes:</strong> {withdrawal.admin_notes}
                      </p>
                    </div>
                  )}

                  {withdrawal.rejection_reason && (
                    <div className="mt-3 p-3 bg-red-50 rounded-md">
                      <p className="text-sm text-red-700">
                        <strong>Rejection Reason:</strong> {withdrawal.rejection_reason}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  className="flex items-center gap-2 hover:bg-blue-50"
                >
                  <ChevronDown className="h-4 w-4" />
                  Load More ({withdrawals.length - visibleCount} remaining)
                </Button>
              </div>
            )}
            
            {/* Show All Loaded Message */}
            {!hasMore && withdrawals.length > 5 && (
              <div className="text-center pt-4">
                <p className="text-sm text-gray-500">
                  Showing all {withdrawals.length} withdrawal requests
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
