import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, CreditCard, Smartphone, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: string;
  type: 'cbe' | 'telebirr';
  accountNumber: string;
  holderName: string;
  isDefault: boolean;
}

export function PaymentMethods() {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'cbe',
      accountNumber: '1000123456789',
      holderName: 'John Doe',
      isDefault: true
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethod, setNewMethod] = useState({
    type: 'cbe' as 'cbe' | 'telebirr',
    accountNumber: '',
    holderName: ''
  });

  const handleAddMethod = () => {
    if (!newMethod.accountNumber || !newMethod.holderName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const method: PaymentMethod = {
      id: Date.now().toString(),
      ...newMethod,
      isDefault: paymentMethods.length === 0
    };

    setPaymentMethods([...paymentMethods, method]);
    setNewMethod({ type: 'cbe', accountNumber: '', holderName: '' });
    setShowAddForm(false);
    
    toast({
      title: "Success",
      description: "Payment method added successfully"
    });
  };

  const handleRemoveMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter(method => method.id !== id));
    toast({
      title: "Success",
      description: "Payment method removed"
    });
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(methods => 
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    
    toast({
      title: "Success",
      description: "Default payment method updated"
    });
  };

  const handleResetUpload = () => {
    toast({
      title: "Upload Reset",
      description: "Payment receipt upload has been reset"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payment Methods</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {/* Upload Reset Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Management
          </CardTitle>
          <CardDescription>
            Reset payment receipt uploads or clear pending transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handleResetUpload}>
            Reset Upload Method
          </Button>
        </CardContent>
      </Card>

      {/* Add New Payment Method */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Payment Method</CardTitle>
            <CardDescription>
              Add CBE or Telebirr account for course payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={newMethod.type === 'cbe' ? 'default' : 'outline'}
                onClick={() => setNewMethod({ ...newMethod, type: 'cbe' })}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                CBE
              </Button>
              <Button
                variant={newMethod.type === 'telebirr' ? 'default' : 'outline'}
                onClick={() => setNewMethod({ ...newMethod, type: 'telebirr' })}
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Telebirr
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder={newMethod.type === 'cbe' ? 'CBE Account Number' : 'Telebirr Phone Number'}
                value={newMethod.accountNumber}
                onChange={(e) => setNewMethod({ ...newMethod, accountNumber: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="holderName">Account Holder Name</Label>
              <Input
                id="holderName"
                placeholder="Full name as on account"
                value={newMethod.holderName}
                onChange={(e) => setNewMethod({ ...newMethod, holderName: e.target.value })}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAddMethod}>Add Method</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing Payment Methods */}
      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <Card key={method.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10">
                    {method.type === 'cbe' ? (
                      <CreditCard className="h-6 w-6 text-primary" />
                    ) : (
                      <Smartphone className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold capitalize">{method.type}</h3>
                      {method.isDefault && (
                        <Badge variant="secondary">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {method.accountNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {method.holderName}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMethod(method.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {paymentMethods.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Payment Methods</h3>
            <p className="text-muted-foreground mb-4">
              Add your CBE or Telebirr account to make course payments
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              Add Your First Payment Method
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
