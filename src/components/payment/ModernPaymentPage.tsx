/**
 * Modern Payment Page - Phase 6
 * Modernized payment page with account selection, transaction reference, and order summary
 */

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { coursesService, Course } from "@/services/courses";
import { paymentService } from "@/services/payments";
import { getImageUrl } from "@/services/admin";
import { FileUploadZone } from "./FileUploadZone";
import { PaymentSuccess } from "./PaymentSuccess";
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  CheckCircle, 
  Clock, 
  Shield,
  ArrowLeft,
  Receipt
} from "lucide-react";

interface PaymentAccount {
  id: string;
  type: "CBE" | "TeleBirr" | "Commercial Bank" | "Awash Bank" | "Dashen Bank" | "Abyssinia Bank" | "Other";
  accountNumber: string;
  accountHolderName: string;
  phoneNumber?: string;
  isActive: boolean;
}

export function ModernPaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const courseId = searchParams.get('courseId');
  const [course, setCourse] = useState<Course | null>(null);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);
  const [transactionReference, setTransactionReference] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        
        // Fetch course details
        const courseData = await coursesService.getCourseById(courseId);
        setCourse(courseData);
        
        // Fetch payment accounts
        const accounts = await paymentService.getPaymentAccounts();
        setPaymentAccounts(accounts);
        
        // Set default account if available
        if (accounts.length > 0) {
          setSelectedAccount(accounts[0]);
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load payment information",
          variant: "destructive"
        });
        console.error('Error fetching payment data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, navigate, toast]);

  const getAccountIcon = (type: PaymentAccount["type"]) => {
    switch (type) {
      case "CBE":
        return <Building2 className="w-5 h-5 text-blue-600" />;
      case "TeleBirr":
        return <Smartphone className="w-5 h-5 text-green-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-purple-600" />;
    }
  };

  const getAccountColor = (type: PaymentAccount["type"]) => {
    switch (type) {
      case "CBE":
        return "border-blue-200 bg-blue-50";
      case "TeleBirr":
        return "border-green-200 bg-green-50";
      default:
        return "border-purple-200 bg-purple-50";
    }
  };

  const handleSubmit = async () => {
    if (!course || !selectedAccount || !transactionReference || !uploadedFile) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and upload a transaction screenshot",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // Create payment request
      const paymentData = {
        courseId: course.id,
        paymentAccountId: selectedAccount.id,
        transactionReference,
        transactionScreenshot: uploadedFile
      };
      
      await paymentService.createPaymentRequestWithFile(paymentData);
      
      // Show success animation
      setShowSuccess(true);
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
      
    } catch (err) {
      toast({
        title: "Payment Failed",
        description: err instanceof Error ? err.message : "Failed to submit payment request",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">Course Not Found</h1>
          <p className="text-gray-600">The course you're trying to enroll in doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return <PaymentSuccess courseName={course.title} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Complete Your Enrollment</h1>
            <div className="w-20" /> {/* Spacer */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    Course Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <img
                      src={getImageUrl(course.image) || "/placeholder.svg"}
                      alt={course.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{course.title}</h3>
                      <p className="text-sm text-gray-600">{course.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <Badge variant="outline">{course.level}</Badge>
                        <span>{course.duration || "8 weeks"}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{course.price} ETB</div>
                      <div className="text-sm text-gray-600">One-time payment</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Payment Method Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Select Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {paymentAccounts.map((account) => (
                    <div
                      key={account.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAccount?.id === account.id
                          ? `${getAccountColor(account.type)} border-current`
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedAccount(account)}
                    >
                      <div className="flex items-center gap-3">
                        {getAccountIcon(account.type)}
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{account.type}</div>
                          <div className="text-sm text-gray-600">
                            Account: {account.accountNumber}
                          </div>
                          <div className="text-sm text-gray-600">
                            Holder: {account.accountHolderName}
                          </div>
                          {account.phoneNumber && (
                            <div className="text-sm text-gray-600">
                              Phone: {account.phoneNumber}
                            </div>
                          )}
                        </div>
                        {selectedAccount?.id === account.id && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Transaction Reference */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="transactionRef">Transaction Reference (Optional)</Label>
                    <Input
                      id="transactionRef"
                      placeholder="Enter your transaction reference number (optional)"
                      value={transactionReference}
                      onChange={(e) => setTransactionReference(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      Optional: Reference number you received after making the payment
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* File Upload */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Transaction Screenshot *</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUploadZone
                    onFileSelect={setUploadedFile}
                    acceptedFileTypes={["image/*"]}
                    maxFileSize={5 * 1024 * 1024} // 5MB
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Course Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Course:</span>
                      <span className="font-medium">{course.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className="font-medium">{course.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{course.duration || "8 weeks"}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Course Price:</span>
                      <span className="font-medium">{course.price} ETB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Processing Fee:</span>
                      <span className="font-medium">0 ETB</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{course.price} ETB</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Security Features */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Secure payment processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>Instant enrollment after approval</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span>Certificate upon completion</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !selectedAccount || !transactionReference || !uploadedFile}
                    className="w-full py-3 text-lg font-semibold"
                    variant="gradient"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Receipt className="w-5 h-5 mr-2" />
                        Submit Payment Request
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    By submitting, you agree to our terms and conditions
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}