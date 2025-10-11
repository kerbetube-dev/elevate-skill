import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, DollarSign, CreditCard, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { withdrawalsService, WithdrawalRequest } from '@/services/withdrawals';

interface WithdrawalRequestFormProps {
  onSuccess?: () => void;
  userEarnings?: number;
}

const WithdrawalRequestForm: React.FC<WithdrawalRequestFormProps> = ({ 
  onSuccess, 
  userEarnings = 0 
}) => {
  const [formData, setFormData] = useState<WithdrawalRequest>({
    amount: 300,
    account_type: 'CBE',
    account_number: '',
    account_holder_name: '',
    phone_number: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.amount < 300) {
      newErrors.amount = 'Minimum withdrawal amount is 300 ETB';
    }

    if (formData.amount > userEarnings) {
      newErrors.amount = `Insufficient earnings. Available: ${userEarnings} ETB`;
    }

    if (!formData.account_number.trim()) {
      newErrors.account_number = 'Account number is required';
    }

    if (!formData.account_holder_name.trim()) {
      newErrors.account_holder_name = 'Account holder name is required';
    }

    if (formData.account_type === 'TeleBirr' && !formData.phone_number?.trim()) {
      newErrors.phone_number = 'Phone number is required for TeleBirr';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await withdrawalsService.createWithdrawalRequest(formData);
      
      toast({
        title: "Withdrawal Request Submitted",
        description: "Your withdrawal request has been submitted successfully. Admin will review it shortly.",
        variant: "default",
      });

      // Reset form
      setFormData({
        amount: 300,
        account_type: 'CBE',
        account_number: '',
        account_holder_name: '',
        phone_number: ''
      });
      setErrors({});

      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof WithdrawalRequest, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          Request Withdrawal
        </CardTitle>
        <CardDescription>
          Withdraw your referral earnings to your bank account or mobile money
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Earnings Info */}
          <Alert>
            <DollarSign className="h-4 w-4" />
            <AlertDescription>
              <strong>Available Earnings:</strong> {userEarnings.toFixed(2)} ETB
              <br />
              <strong>Minimum Withdrawal:</strong> 300 ETB
            </AlertDescription>
          </Alert>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Withdrawal Amount (ETB)</Label>
            <Input
              id="amount"
              type="number"
              min="300"
              max={userEarnings}
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              className={errors.amount ? 'border-red-500' : ''}
              placeholder="Enter amount (minimum 300 ETB)"
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          {/* Account Type */}
          <div className="space-y-2">
            <Label htmlFor="account_type">Account Type</Label>
            <Select 
              value={formData.account_type} 
              onValueChange={(value) => handleInputChange('account_type', value as 'CBE' | 'TeleBirr')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CBE">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Commercial Bank of Ethiopia (CBE)
                  </div>
                </SelectItem>
                <SelectItem value="TeleBirr">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    TeleBirr Mobile Money
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="account_number">
              {formData.account_type === 'CBE' ? 'Account Number' : 'TeleBirr Account Number'}
            </Label>
            <Input
              id="account_number"
              type="text"
              value={formData.account_number}
              onChange={(e) => handleInputChange('account_number', e.target.value)}
              className={errors.account_number ? 'border-red-500' : ''}
              placeholder={formData.account_type === 'CBE' ? 'Enter CBE account number' : 'Enter TeleBirr account number'}
            />
            {errors.account_number && (
              <p className="text-sm text-red-500">{errors.account_number}</p>
            )}
          </div>

          {/* Account Holder Name */}
          <div className="space-y-2">
            <Label htmlFor="account_holder_name">Account Holder Name</Label>
            <Input
              id="account_holder_name"
              type="text"
              value={formData.account_holder_name}
              onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
              className={errors.account_holder_name ? 'border-red-500' : ''}
              placeholder="Enter account holder's full name"
            />
            {errors.account_holder_name && (
              <p className="text-sm text-red-500">{errors.account_holder_name}</p>
            )}
          </div>

          {/* Phone Number (for TeleBirr) */}
          {formData.account_type === 'TeleBirr' && (
            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                className={errors.phone_number ? 'border-red-500' : ''}
                placeholder="Enter phone number (e.g., 0912345678)"
              />
              {errors.phone_number && (
                <p className="text-sm text-red-500">{errors.phone_number}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || userEarnings < 300}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Request...
              </>
            ) : (
              'Submit Withdrawal Request'
            )}
          </Button>

          {userEarnings < 300 && (
            <Alert>
              <AlertDescription>
                You need at least 300 ETB in earnings to request a withdrawal.
                Refer friends to earn more!
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export { WithdrawalRequestForm as WithdrawalRequest };
