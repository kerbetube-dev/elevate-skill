/**
 * Payment Page
 * User flow for course enrollment and payment
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import PaymentAccountCard from '@/components/PaymentAccountCard';
import { paymentService, PaymentAccount } from '@/services/payments';
import { coursesService } from '@/services/courses';
import { useToast } from '@/hooks/use-toast';

const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const courseId = searchParams.get('courseId');

  // State
  const [course, setCourse] = useState<any>(null);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);
  const [transactionFile, setTransactionFile] = useState<File | null>(null);
  const [transactionReference, setTransactionReference] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');

  useEffect(() => {
    if (!courseId) {
      navigate('/');
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({
        title: 'Authentication Required',
        description: 'Please login to enroll in courses',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [courseData, accounts] = await Promise.all([
        coursesService.getCourseById(courseId!),
        paymentService.getActivePaymentAccounts(),
      ]);

      setCourse(courseData);
      setPaymentAccounts(accounts);
    } catch (err: any) {
      setError(err.message || 'Failed to load payment information');
      toast({
        title: 'Error',
        description: err.message || 'Failed to load payment information',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a JPG, PNG, or PDF file',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'File size must be less than 10MB',
          variant: 'destructive',
        });
        return;
      }

      setTransactionFile(file);
    }
  };

  const handleUploadFile = async () => {
    if (!transactionFile) {
      toast({
        title: 'No File Selected',
        description: 'Please select a transaction screenshot to upload',
        variant: 'destructive',
      });
      return;
    }

    try {
      setUploading(true);
      const result = await paymentService.uploadTransactionScreenshot(transactionFile);
      setUploadedFileUrl(result.url);
      toast({
        title: 'Upload Successful',
        description: 'Transaction screenshot uploaded successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Upload Failed',
        description: err.message || 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitPayment = async () => {
    // Validation
    if (!selectedAccount) {
      toast({
        title: 'No Payment Account Selected',
        description: 'Please select a payment account',
        variant: 'destructive',
      });
      return;
    }

    if (!uploadedFileUrl) {
      toast({
        title: 'No Transaction Screenshot',
        description: 'Please upload your transaction screenshot first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);

      await paymentService.createPaymentRequest({
        courseId: courseId!,
        paymentAccountId: selectedAccount.id,
        amount: course.price,
        transactionScreenshotUrl: uploadedFileUrl,
        transactionReference: transactionReference || undefined,
      });

      toast({
        title: 'Payment Request Submitted',
        description: 'Your payment request has been submitted for review',
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      toast({
        title: 'Submission Failed',
        description: err.message || 'Failed to submit payment request',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Enrollment</h1>
          <p className="text-gray-600 mt-2">Follow the steps below to enroll in the course</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Course Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{course?.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{course?.description}</p>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Course Price:</span>
                    <span className="text-2xl font-bold text-primary">
                      {paymentService.formatAmount(course?.price || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Payment Process */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Payment Account */}
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Select Payment Account</CardTitle>
                <CardDescription>
                  Choose one of the following payment methods to pay for the course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentAccounts.map((account) => (
                    <PaymentAccountCard
                      key={account.id}
                      account={account}
                      selected={selectedAccount?.id === account.id}
                      onSelect={setSelectedAccount}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Step 2: Upload Transaction Screenshot */}
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Upload Transaction Screenshot</CardTitle>
                <CardDescription>
                  After making the payment, upload a screenshot or photo of your transaction receipt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="transaction-file">Transaction Screenshot *</Label>
                  <Input
                    id="transaction-file"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,application/pdf"
                    onChange={handleFileChange}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Accepted formats: JPG, PNG, PDF (Max 10MB)
                  </p>
                </div>

                {transactionFile && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                    <span className="text-sm text-blue-800">
                      {transactionFile.name} ({(transactionFile.size / 1024).toFixed(2)} KB)
                    </span>
                    {uploadedFileUrl && <CheckCircle className="w-5 h-5 text-green-600" />}
                  </div>
                )}

                <Button
                  onClick={handleUploadFile}
                  disabled={!transactionFile || uploading || !!uploadedFileUrl}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : uploadedFileUrl ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Uploaded Successfully
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Screenshot
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Step 3: Transaction Reference (Optional) */}
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Transaction Reference (Optional)</CardTitle>
                <CardDescription>
                  Enter your transaction reference number if available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="transaction-ref">Transaction Reference</Label>
                  <Input
                    id="transaction-ref"
                    type="text"
                    placeholder="e.g., TXN123456789"
                    value={transactionReference}
                    onChange={(e) => setTransactionReference(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Card className="border-primary">
              <CardContent className="pt-6">
                <Button
                  onClick={handleSubmitPayment}
                  disabled={!selectedAccount || !uploadedFileUrl || submitting}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Submitting Payment Request...
                    </>
                  ) : (
                    'Submit Payment Request'
                  )}
                </Button>
                <p className="text-sm text-gray-500 text-center mt-3">
                  Your payment will be reviewed by our admin team within 24 hours
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;

