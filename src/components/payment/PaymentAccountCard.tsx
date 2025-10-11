/**
 * Payment Account Card Component
 * Displays a payment account option for users
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, CreditCard, Check } from 'lucide-react';
import { PaymentAccount } from '@/services/payments';

interface PaymentAccountCardProps {
  account: PaymentAccount;
  selected?: boolean;
  onSelect: (account: PaymentAccount) => void;
}

const PaymentAccountCard: React.FC<PaymentAccountCardProps> = ({
  account,
  selected = false,
  onSelect,
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        selected ? 'ring-2 ring-primary border-primary' : ''
      }`}
      onClick={() => onSelect(account)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {account.type === 'TeleBirr' ? (
              <CreditCard className="w-5 h-5 text-orange-500" />
            ) : (
              <Building2 className="w-5 h-5 text-blue-500" />
            )}
            <CardTitle className="text-lg">{account.type}</CardTitle>
          </div>
          {selected && (
            <Badge className="bg-green-500">
              <Check className="w-3 h-3 mr-1" />
              Selected
            </Badge>
          )}
        </div>
        <CardDescription>{account.accountName}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Account Number */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <span className="text-sm text-gray-600">Account Number</span>
          <span className="font-mono font-semibold">{account.account_number}</span>
        </div>

        {/* Bank Name */}
        {account.bankName && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
            <span className="text-sm text-gray-600">Bank</span>
            <span className="font-medium text-blue-700">{account.bankName}</span>
          </div>
        )}

        {/* Instructions */}
        {account.instructions && (
          <div className="p-3 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Instructions:</strong> {account.instructions}
            </p>
          </div>
        )}

        {/* QR Code */}
        {account.qrCodeUrl && (
          <div className="flex flex-col items-center p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600 mb-2">Scan QR Code</p>
            <img
              src={account.qrCodeUrl}
              alt="QR Code"
              className="w-32 h-32 object-contain"
            />
          </div>
        )}

        {/* Select Button */}
        <Button
          onClick={() => onSelect(account)}
          variant={selected ? 'default' : 'outline'}
          className="w-full"
        >
          {selected ? 'Selected' : 'Select This Account'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentAccountCard;

