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
import { paymentService, PaymentAccount } from "@/services/payments";
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
	Receipt,
} from "lucide-react";

export function ModernPaymentPage() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { toast } = useToast();

	const courseId = searchParams.get("courseId");
	const [course, setCourse] = useState<Course | null>(null);
	const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>(
		[]
	);
	const [selectedAccount, setSelectedAccount] =
		useState<PaymentAccount | null>(null);
	const [transactionReference, setTransactionReference] = useState("");
	const [uploadedFile, setUploadedFile] = useState<File | null>(null);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			if (!courseId) {
				navigate("/");
				return;
			}

			try {
				setLoading(true);

				// Fetch course details
				const courseData = await coursesService.getCourseById(courseId);
				setCourse(courseData);

				// Fetch payment accounts
				console.log("Fetching payment accounts...");
				const accounts = await paymentService.getPaymentAccounts();
				console.log("Payment accounts fetched:", accounts);
				setPaymentAccounts(accounts);

				// Set default account if available
				if (accounts.length > 0) {
					setSelectedAccount(accounts[0]);
					console.log("Default account selected:", accounts[0]);
				} else {
					console.log("No payment accounts available");
				}
			} catch (err) {
				console.error("Error fetching payment data:", err);
				toast({
					title: "Error",
					description:
						"Failed to load payment information. Please refresh the page.",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [courseId, navigate, toast]);

	const getAccountIcon = (type: string) => {
		switch (type?.toLowerCase()) {
			case "cbe":
			case "commercial bank of ethiopia":
				return <Building2 className="w-5 h-5 text-blue-600" />;
			case "telebirr":
			case "tele birr":
				return <Smartphone className="w-5 h-5 text-green-600" />;
			case "dashen":
			case "dashen bank":
				return <Building2 className="w-5 h-5 text-orange-600" />;
			case "awash":
			case "awash bank":
				return <Building2 className="w-5 h-5 text-red-600" />;
			case "abyssinia":
			case "abyssinia bank":
				return <Building2 className="w-5 h-5 text-indigo-600" />;
			default:
				return <CreditCard className="w-5 h-5 text-purple-600" />;
		}
	};

	const getAccountColor = (type: string) => {
		switch (type?.toLowerCase()) {
			case "cbe":
			case "commercial bank of ethiopia":
				return "border-blue-200 bg-blue-50";
			case "telebirr":
			case "tele birr":
				return "border-green-200 bg-green-50";
			case "dashen":
			case "dashen bank":
				return "border-orange-200 bg-orange-50";
			case "awash":
			case "awash bank":
				return "border-red-200 bg-red-50";
			case "abyssinia":
			case "abyssinia bank":
				return "border-indigo-200 bg-indigo-50";
			default:
				return "border-purple-200 bg-purple-50";
		}
	};

	const handleSubmit = async () => {
		if (!course) {
			toast({
				title: "Error",
				description: "Course information not found",
				variant: "destructive",
			});
			return;
		}

		if (paymentAccounts.length === 0) {
			toast({
				title: "No Payment Methods",
				description:
					"No payment methods are available. Please contact support.",
				variant: "destructive",
			});
			return;
		}

		if (!selectedAccount) {
			toast({
				title: "Missing Information",
				description: "Please select a payment method",
				variant: "destructive",
			});
			return;
		}

		if (!uploadedFile) {
			toast({
				title: "Missing Information",
				description: "Please upload a transaction screenshot",
				variant: "destructive",
			});
			return;
		}

		try {
			setSubmitting(true);

			// Create payment request
			const paymentData = {
				courseId: course.id,
				paymentAccountId: selectedAccount.id,
				transactionReference: transactionReference || "",
				transactionScreenshot: uploadedFile,
			};

			await paymentService.createPaymentRequestWithFile(paymentData);

			// Show success animation
			setShowSuccess(true);

			// Auto redirect after 3 seconds
			setTimeout(() => {
				navigate("/dashboard");
			}, 3000);
		} catch (err) {
			toast({
				title: "Payment Failed",
				description:
					err instanceof Error
						? err.message
						: "Failed to submit payment request",
				variant: "destructive",
			});
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center bg-gray-50 min-h-screen">
				<div className="space-y-4 text-center">
					<div className="mx-auto border-4 border-purple-600 border-t-transparent rounded-full w-16 h-16 animate-spin" />
					<p className="text-gray-600">
						Loading payment information...
					</p>
				</div>
			</div>
		);
	}

	if (!course) {
		return (
			<div className="flex justify-center items-center bg-gray-50 min-h-screen">
				<div className="space-y-4 text-center">
					<h1 className="font-bold text-gray-900 text-2xl">
						Course Not Found
					</h1>
					<p className="text-gray-600">
						The course you're trying to enroll in doesn't exist.
					</p>
					<Button onClick={() => navigate("/")}>
						<ArrowLeft className="mr-2 w-4 h-4" />
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
		<div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="mx-auto px-4 py-4 container">
					<div className="flex justify-between items-center">
						<Button
							variant="ghost"
							onClick={() => navigate(-1)}
							className="flex items-center gap-2"
						>
							<ArrowLeft className="w-4 h-4" />
							Back
						</Button>
						<h1 className="font-semibold text-gray-900 text-xl">
							Complete Your Enrollment
						</h1>
						<div className="w-20" /> {/* Spacer */}
					</div>
				</div>
			</div>

			<div className="mx-auto px-4 py-8 container">
				<div className="gap-8 grid lg:grid-cols-3">
					{/* Payment Form */}
					<div className="space-y-6 lg:col-span-2">
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
											src={
												getImageUrl(course.image) ||
												"/placeholder.svg"
											}
											alt={course.title}
											className="rounded-lg w-16 h-16 object-cover"
										/>
										<div className="flex-1">
											<h3 className="font-semibold text-gray-900">
												{course.title}
											</h3>
											<p className="text-gray-600 text-sm">
												{course.description}
											</p>
											<div className="flex items-center gap-4 mt-2 text-gray-600 text-sm">
												<Badge variant="outline">
													{course.level}
												</Badge>
												<span>
													{course.duration ||
														"8 weeks"}
												</span>
											</div>
										</div>
										<div className="text-right">
											<div className="font-bold text-gray-900 text-2xl">
												{course.price} ETB
											</div>
											<div className="text-gray-600 text-sm">
												One-time payment
											</div>
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
									{paymentAccounts.length === 0 ? (
										<div className="py-8 text-gray-500 text-center">
											<CreditCard className="mx-auto mb-4 w-12 h-12 text-gray-300" />
											<p className="font-medium text-lg">
												No Payment Methods Available
											</p>
											<p className="text-sm">
												Please contact support to set up
												payment methods.
											</p>
										</div>
									) : (
										paymentAccounts.map((account) => (
											<div
												key={account.id}
												className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
													selectedAccount?.id ===
													account.id
														? `${getAccountColor(
																account.type
														  )} border-current`
														: "border-gray-200 hover:border-gray-300"
												}`}
												onClick={() =>
													setSelectedAccount(account)
												}
											>
												<div className="flex items-center gap-3">
													{getAccountIcon(
														account.type
													)}
													<div className="flex-1">
														<div className="font-semibold text-gray-900">
															{account.type}
														</div>
														<div className="text-gray-600 text-sm">
															Account:{" "}
															{
																account.account_number
															}
														</div>
														<div className="text-gray-600 text-sm">
															Holder:{" "}
															{
																account.accountName
															}
														</div>
														{account.bankName && (
															<div className="text-gray-600 text-sm">
																Bank:{" "}
																{
																	account.bankName
																}
															</div>
														)}
													</div>
													{selectedAccount?.id ===
														account.id && (
														<CheckCircle className="w-5 h-5 text-green-600" />
													)}
												</div>
											</div>
										))
									)}
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
										<Label htmlFor="transactionRef">
											Transaction Reference (Optional)
										</Label>
										<Input
											id="transactionRef"
											placeholder="Enter your transaction reference number (optional)"
											value={transactionReference}
											onChange={(e) =>
												setTransactionReference(
													e.target.value
												)
											}
											className="mt-1"
										/>
										<p className="mt-1 text-gray-600 text-sm">
											Optional: Reference number you
											received after making the payment
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
									<CardTitle>
										Transaction Screenshot *
									</CardTitle>
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
							<Card className="top-6 sticky">
								<CardHeader>
									<CardTitle>Order Summary</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{/* Course Details */}
									<div className="space-y-2">
										<div className="flex justify-between">
											<span className="text-gray-600">
												Course:
											</span>
											<span className="font-medium">
												{course.title}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">
												Level:
											</span>
											<span className="font-medium">
												{course.level}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">
												Duration:
											</span>
											<span className="font-medium">
												{course.duration || "8 weeks"}
											</span>
										</div>
									</div>

									<Separator />

									{/* Pricing */}
									<div className="space-y-2">
										<div className="flex justify-between">
											<span className="text-gray-600">
												Course Price:
											</span>
											<span className="font-medium">
												{course.price} ETB
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">
												Processing Fee:
											</span>
											<span className="font-medium">
												0 ETB
											</span>
										</div>
										<Separator />
										<div className="flex justify-between font-bold text-lg">
											<span>Total:</span>
											<span>{course.price} ETB</span>
										</div>
									</div>

									<Separator />

									{/* Security Features */}
									<div className="space-y-3">
										<div className="flex items-center gap-2 text-gray-600 text-sm">
											<Shield className="w-4 h-4 text-green-600" />
											<span>
												Secure payment processing
											</span>
										</div>
										<div className="flex items-center gap-2 text-gray-600 text-sm">
											<Clock className="w-4 h-4 text-blue-600" />
											<span>
												Instant enrollment after
												approval
											</span>
										</div>
										<div className="flex items-center gap-2 text-gray-600 text-sm">
											<CheckCircle className="w-4 h-4 text-purple-600" />
											<span>
												Certificate upon completion
											</span>
										</div>
									</div>

									{/* Submit Button */}
									<Button
										onClick={handleSubmit}
										disabled={
											submitting ||
											!selectedAccount ||
											!transactionReference ||
											!uploadedFile
										}
										className="py-3 w-full font-semibold text-lg"
										variant="gradient"
									>
										{submitting ? (
											<>
												<div className="mr-2 border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin" />
												Processing...
											</>
										) : (
											<>
												<Receipt className="mr-2 w-5 h-5" />
												Submit Payment Request
											</>
										)}
									</Button>

									<p className="text-gray-500 text-xs text-center">
										By submitting, you agree to our terms
										and conditions
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
