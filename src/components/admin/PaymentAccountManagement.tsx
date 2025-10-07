/**
 * Payment Account Management Component
 * Admin interface for managing payment accounts (CBE, TeleBirr, etc.)
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  Trash2,
  Building2,
  CreditCard,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  adminPaymentAccountService,
  PaymentAccount,
  CreatePaymentAccountData,
} from '@/services/adminPaymentAccounts';

const PaymentAccountManagement: React.FC = () => {
  const { toast } = useToast();

  // State
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PaymentAccount | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CreatePaymentAccountData>({
    type: '',
    accountName: '',
    accountNumber: '',
    bankName: '',
    instructions: '',
    qrCodeUrl: '',
    isActive: true,
    displayOrder: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await adminPaymentAccountService.getAllPaymentAccounts();
      setAccounts(data);

      if (isRefresh) {
        toast({
          title: 'Refreshed',
          description: 'Payment accounts updated successfully',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch payment accounts',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleOpenDialog = (account?: PaymentAccount) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        type: account.type,
        accountName: account.accountName,
        accountNumber: account.accountNumber,
        bankName: account.bankName || '',
        instructions: account.instructions || '',
        qrCodeUrl: account.qrCodeUrl || '',
        isActive: account.isActive,
        displayOrder: account.displayOrder,
      });
    } else {
      setEditingAccount(null);
      setFormData({
        type: '',
        accountName: '',
        accountNumber: '',
        bankName: '',
        instructions: '',
        qrCodeUrl: '',
        isActive: true,
        displayOrder: accounts.length,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAccount(null);
    setFormData({
      type: '',
      accountName: '',
      accountNumber: '',
      bankName: '',
      instructions: '',
      qrCodeUrl: '',
      isActive: true,
      displayOrder: 0,
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.type || !formData.accountName || !formData.accountNumber) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      if (editingAccount) {
        // Update existing account
        await adminPaymentAccountService.updatePaymentAccount(editingAccount.id, formData);
        toast({
          title: 'Updated',
          description: 'Payment account updated successfully',
        });
      } else {
        // Create new account
        await adminPaymentAccountService.createPaymentAccount(formData);
        toast({
          title: 'Created',
          description: 'Payment account created successfully',
        });
      }

      handleCloseDialog();
      fetchAccounts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save payment account',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (accountId: string, currentStatus: boolean) => {
    try {
      await adminPaymentAccountService.toggleAccountStatus(accountId, !currentStatus);
      toast({
        title: 'Status Updated',
        description: `Payment account ${!currentStatus ? 'activated' : 'deactivated'}`,
      });
      fetchAccounts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this payment account?')) {
      return;
    }

    try {
      setDeletingId(accountId);
      await adminPaymentAccountService.deletePaymentAccount(accountId);
      toast({
        title: 'Deleted',
        description: 'Payment account deleted successfully',
      });
      fetchAccounts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete payment account',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payment Account Management</h2>
          <p className="text-gray-600">Manage payment accounts for user enrollments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchAccounts(true)} disabled={refreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Payment Account
          </Button>
        </div>
      </div>

      {/* Accounts List */}
      {accounts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payment Accounts</h3>
            <p className="text-gray-600 mb-4">Create your first payment account to start accepting payments</p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <Card key={account.id} className={`${!account.isActive ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {account.type === 'TeleBirr' ? (
                      <CreditCard className="w-5 h-5 text-orange-500" />
                    ) : (
                      <Building2 className="w-5 h-5 text-blue-500" />
                    )}
                    <CardTitle className="text-lg">{account.type}</CardTitle>
                  </div>
                  <Badge variant={account.isActive ? 'default' : 'secondary'}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <CardDescription>{account.accountName}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-xs text-gray-500 mb-1">Account Number</div>
                  <div className="font-mono font-semibold">{account.accountNumber}</div>
                </div>

                {account.bankName && (
                  <div className="p-3 bg-blue-50 rounded-md">
                    <div className="text-xs text-gray-500 mb-1">Bank</div>
                    <div className="font-medium text-blue-700">{account.bankName}</div>
                  </div>
                )}

                {account.instructions && (
                  <div className="text-sm text-gray-600 p-2 bg-yellow-50 rounded">
                    {account.instructions}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={account.isActive}
                      onCheckedChange={() => handleToggleStatus(account.id, account.isActive)}
                    />
                    <span className="text-sm text-gray-600">
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDialog(account)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(account.id)}
                      disabled={deletingId === account.id}
                    >
                      {deletingId === account.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? 'Edit Payment Account' : 'Add New Payment Account'}
            </DialogTitle>
            <DialogDescription>
              Configure a payment account for users to make payments
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Payment Type */}
            <div>
              <Label htmlFor="type">Payment Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  {adminPaymentAccountService.getPaymentTypeOptions().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Name */}
            <div>
              <Label htmlFor="accountName">Account Name *</Label>
              <Input
                id="accountName"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                placeholder="e.g., ElevateSkill Academy"
              />
            </div>

            {/* Account Number */}
            <div>
              <Label htmlFor="accountNumber">Account Number *</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="e.g., 1000123456789 or 0911234567"
              />
            </div>

            {/* Bank Name */}
            <div>
              <Label htmlFor="bankName">Bank Name (Optional)</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="e.g., Commercial Bank of Ethiopia"
              />
            </div>

            {/* Instructions */}
            <div>
              <Label htmlFor="instructions">Payment Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="e.g., Transfer to this account and upload the receipt"
                rows={3}
              />
            </div>

            {/* QR Code URL */}
            <div>
              <Label htmlFor="qrCodeUrl">QR Code URL (Optional)</Label>
              <Input
                id="qrCodeUrl"
                value={formData.qrCodeUrl}
                onChange={(e) => setFormData({ ...formData, qrCodeUrl: e.target.value })}
                placeholder="https://example.com/qr-code.png"
              />
            </div>

            {/* Display Order */}
            <div>
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Active (visible to users)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {editingAccount ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentAccountManagement;

