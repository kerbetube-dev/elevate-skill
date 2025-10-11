/**
 * Payment Management Component
 * CRUD operations for payment methods with validation
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	CreditCard,
	Plus,
	Edit,
	Trash2,
	AlertCircle,
	CheckCircle,
	Smartphone,
	Building,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Payment method types
interface PaymentMethod {
	id: string;
	type: "bank" | "mobile" | "card";
	name: string;
	accountNumber: string;
	accountHolder: string;
	isDefault: boolean;
	createdAt: string;
	provider?: string; // For mobile money (CBE Birr, Telebirr, etc.)
	bankName?: string; // For bank accounts
}

// Validation schemas
const paymentMethodSchema = z.object({
	type: z.enum(["bank", "mobile", "card"]),
	name: z.string().min(1, "Payment method name is required"),
	accountNumber: z.string().min(1, "Account number is required"),
	accountHolder: z.string().min(1, "Account holder name is required"),
	provider: z.string().optional(),
	bankName: z.string().optional(),
});

type PaymentMethodForm = z.infer<typeof paymentMethodSchema>;

export function PaymentManagement() {
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
	const [loading, setLoading] = useState(true);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(
		null
	);
	const { toast } = useToast();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<PaymentMethodForm>({
		resolver: zodResolver(paymentMethodSchema),
	});

	const watchType = watch("type");

	// Mock data - replace with actual API calls
	useEffect(() => {
		// Simulate API call
		setTimeout(() => {
			setPaymentMethods([
				{
					id: "1",
					type: "bank",
					name: "Commercial Bank of Ethiopia",
					accountNumber: "1000123456789",
					accountHolder: "Abel Tesfaye",
					isDefault: true,
					createdAt: "2024-01-15",
					bankName: "Commercial Bank of Ethiopia",
				},
				{
					id: "2",
					type: "mobile",
					name: "Telebirr Wallet",
					accountNumber: "+251911234567",
					accountHolder: "Abel Tesfaye",
					isDefault: false,
					createdAt: "2024-02-01",
					provider: "Telebirr",
				},
			]);
			setLoading(false);
		}, 1000);
	}, []);

	const handleAddPaymentMethod = async (data: PaymentMethodForm) => {
		try {
			// TODO: Replace with actual API call
			const newMethod: PaymentMethod = {
				id: Date.now().toString(),
				...data,
				isDefault: paymentMethods.length === 0,
				createdAt: new Date().toISOString(),
			};

			setPaymentMethods((prev) => [...prev, newMethod]);
			toast({
				title: "Success",
				description: "Payment method added successfully",
			});
			setIsDialogOpen(false);
			reset();
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to add payment method",
				variant: "destructive",
			});
		}
	};

	const handleEditPaymentMethod = async (data: PaymentMethodForm) => {
		if (!editingMethod) return;

		try {
			// TODO: Replace with actual API call
			const updatedMethod: PaymentMethod = {
				...editingMethod,
				...data,
			};

			setPaymentMethods((prev) =>
				prev.map((method) =>
					method.id === editingMethod.id ? updatedMethod : method
				)
			);
			toast({
				title: "Success",
				description: "Payment method updated successfully",
			});
			setIsDialogOpen(false);
			setEditingMethod(null);
			reset();
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update payment method",
				variant: "destructive",
			});
		}
	};

	const handleDeletePaymentMethod = async (methodId: string) => {
		try {
			// TODO: Replace with actual API call
			setPaymentMethods((prev) =>
				prev.filter((method) => method.id !== methodId)
			);
			toast({
				title: "Success",
				description: "Payment method deleted successfully",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to delete payment method",
				variant: "destructive",
			});
		}
	};

	const handleSetDefault = async (methodId: string) => {
		try {
			// TODO: Replace with actual API call
			setPaymentMethods((prev) =>
				prev.map((method) => ({
					...method,
					isDefault: method.id === methodId,
				}))
			);
			toast({
				title: "Success",
				description: "Default payment method updated",
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update default payment method",
				variant: "destructive",
			});
		}
	};

	const openEditDialog = (method: PaymentMethod) => {
		setEditingMethod(method);
		setValue("type", method.type);
		setValue("name", method.name);
		setValue("accountNumber", method.accountNumber);
		setValue("accountHolder", method.accountHolder);
		setValue("provider", method.provider || "");
		setValue("bankName", method.bankName || "");
		setIsDialogOpen(true);
	};

	const openAddDialog = () => {
		setEditingMethod(null);
		reset();
		setIsDialogOpen(true);
	};

	const getPaymentIcon = (type: string) => {
		switch (type) {
			case "bank":
				return <Building className="w-5 h-5" />;
			case "mobile":
				return <Smartphone className="w-5 h-5" />;
			case "card":
				return <CreditCard className="w-5 h-5" />;
			default:
				return <CreditCard className="w-5 h-5" />;
		}
	};

	const getTypeColor = (type: string) => {
		switch (type) {
			case "bank":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
			case "mobile":
				return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
			case "card":
				return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
		}
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="space-y-2">
					<h2 className="font-bold text-xl sm:text-2xl md:text-3xl">
						Payment Methods
					</h2>
					<p className="text-muted-foreground text-sm sm:text-base">
						Loading payment methods...
					</p>
				</div>
				<div className="gap-4 grid">
					{Array.from({ length: 2 }).map((_, index) => (
						<Card key={index} className="animate-pulse">
							<CardContent className="p-6">
								<div className="bg-muted rounded-lg h-20"></div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<motion.div
			variants={staggerContainer}
			initial="hidden"
			animate="visible"
			className="space-y-6"
		>
			{/* Header */}
			<div className="flex sm:flex-row flex-col sm:justify-between sm:items-start gap-4">
				<div className="space-y-2">
					<h2 className="font-bold text-xl sm:text-2xl md:text-3xl">
						Payment Methods
					</h2>
					<p className="text-muted-foreground text-sm sm:text-base">
						Manage your payment methods for withdrawals
					</p>
				</div>
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogTrigger asChild>
						<Button
							onClick={openAddDialog}
							className="w-full sm:w-auto"
						>
							<Plus className="mr-2 w-4 h-4" />
							Add Payment Method
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-[500px]">
						<DialogHeader>
							<DialogTitle>
								{editingMethod ? "Edit" : "Add"} Payment Method
							</DialogTitle>
							<DialogDescription>
								{editingMethod
									? "Update your payment method details"
									: "Add a new payment method for withdrawals"}
							</DialogDescription>
						</DialogHeader>

						<form
							onSubmit={handleSubmit(
								editingMethod
									? handleEditPaymentMethod
									: handleAddPaymentMethod
							)}
							className="space-y-4"
						>
							{/* Payment Type */}
							<div className="space-y-2">
								<Label htmlFor="type">Payment Type</Label>
								<Select
									value={watchType}
									onValueChange={(value) =>
										setValue(
											"type",
											value as "bank" | "mobile" | "card"
										)
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select payment type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="bank">
											Bank Account
										</SelectItem>
										<SelectItem value="mobile">
											Mobile Money
										</SelectItem>
										<SelectItem value="card">
											Credit/Debit Card
										</SelectItem>
									</SelectContent>
								</Select>
								{errors.type && (
									<p className="text-destructive text-sm">
										{errors.type.message}
									</p>
								)}
							</div>

							{/* Payment Method Name */}
							<div className="space-y-2">
								<Label htmlFor="name">
									Payment Method Name
								</Label>
								<Input
									{...register("name")}
									placeholder="e.g., My CBE Account"
								/>
								{errors.name && (
									<p className="text-destructive text-sm">
										{errors.name.message}
									</p>
								)}
							</div>

							{/* Bank Name (for bank accounts) */}
							{watchType === "bank" && (
								<div className="space-y-2">
									<Label htmlFor="bankName">Bank Name</Label>
									<Select
										value={watch("bankName")}
										onValueChange={(value) =>
											setValue("bankName", value)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select bank" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Commercial Bank of Ethiopia">
												Commercial Bank of Ethiopia
											</SelectItem>
											<SelectItem value="Dashen Bank">
												Dashen Bank
											</SelectItem>
											<SelectItem value="Bank of Abyssinia">
												Bank of Abyssinia
											</SelectItem>
											<SelectItem value="Awash Bank">
												Awash Bank
											</SelectItem>
											<SelectItem value="United Bank">
												United Bank
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}

							{/* Provider (for mobile money) */}
							{watchType === "mobile" && (
								<div className="space-y-2">
									<Label htmlFor="provider">Provider</Label>
									<Select
										value={watch("provider")}
										onValueChange={(value) =>
											setValue("provider", value)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select provider" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Telebirr">
												Telebirr
											</SelectItem>
											<SelectItem value="CBE Birr">
												CBE Birr
											</SelectItem>
											<SelectItem value="M-Birr">
												M-Birr
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
							)}

							{/* Account Number */}
							<div className="space-y-2">
								<Label htmlFor="accountNumber">
									{watchType === "bank"
										? "Account Number"
										: watchType === "mobile"
										? "Phone Number"
										: "Card Number"}
								</Label>
								<Input
									{...register("accountNumber")}
									placeholder={
										watchType === "bank"
											? "1000123456789"
											: watchType === "mobile"
											? "+251911234567"
											: "1234 5678 9012 3456"
									}
								/>
								{errors.accountNumber && (
									<p className="text-destructive text-sm">
										{errors.accountNumber.message}
									</p>
								)}
							</div>

							{/* Account Holder */}
							<div className="space-y-2">
								<Label htmlFor="accountHolder">
									Account Holder Name
								</Label>
								<Input
									{...register("accountHolder")}
									placeholder="Full name as on account"
								/>
								{errors.accountHolder && (
									<p className="text-destructive text-sm">
										{errors.accountHolder.message}
									</p>
								)}
							</div>

							<div className="flex gap-2 pt-4">
								<Button
									type="button"
									variant="outline"
									onClick={() => setIsDialogOpen(false)}
									className="flex-1"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isSubmitting}
									className="flex-1"
								>
									{isSubmitting
										? "Saving..."
										: editingMethod
										? "Update"
										: "Add"}{" "}
									Method
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</div>

			{/* Payment Methods List */}
			{paymentMethods.length === 0 ? (
				<Card>
					<CardContent className="py-12 text-center">
						<CreditCard className="opacity-50 mx-auto mb-4 w-16 h-16 text-muted-foreground" />
						<h3 className="mb-2 font-semibold text-lg">
							No Payment Methods
						</h3>
						<p className="mb-4 text-muted-foreground text-sm">
							Add a payment method to receive withdrawals
						</p>
						<Button onClick={openAddDialog}>
							<Plus className="mr-2 w-4 h-4" />
							Add Your First Payment Method
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="gap-4 grid">
					{paymentMethods.map((method, index) => (
						<motion.div key={method.id} variants={staggerItem}>
							<Card className="hover-lift">
								<CardContent className="p-6">
									<div className="flex justify-between items-start gap-4">
										<div className="flex flex-1 items-start gap-4">
											<div className="flex justify-center items-center bg-primary/10 rounded-xl w-12 h-12 text-primary">
												{getPaymentIcon(method.type)}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<h3 className="font-semibold truncate">
														{method.name}
													</h3>
													{method.isDefault && (
														<Badge
															variant="default"
															className="text-xs"
														>
															Default
														</Badge>
													)}
												</div>
												<div className="flex items-center gap-2 mb-2">
													<Badge
														className={`text-xs ${getTypeColor(
															method.type
														)}`}
														variant="secondary"
													>
														{method.type === "bank"
															? "Bank Account"
															: method.type ===
															  "mobile"
															? "Mobile Money"
															: "Card"}
													</Badge>
													{method.provider && (
														<span className="text-muted-foreground text-xs">
															{method.provider}
														</span>
													)}
													{method.bankName && (
														<span className="text-muted-foreground text-xs">
															{method.bankName}
														</span>
													)}
												</div>
												<p className="text-muted-foreground text-sm truncate">
													{method.accountNumber} •{" "}
													{method.accountHolder}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											{!method.isDefault && (
												<Button
													variant="outline"
													size="sm"
													onClick={() =>
														handleSetDefault(
															method.id
														)
													}
												>
													Set Default
												</Button>
											)}
											<Button
												variant="outline"
												size="icon"
												onClick={() =>
													openEditDialog(method)
												}
											>
												<Edit className="w-4 h-4" />
											</Button>
											<Button
												variant="outline"
												size="icon"
												onClick={() =>
													handleDeletePaymentMethod(
														method.id
													)
												}
												disabled={method.isDefault}
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					))}
				</div>
			)}

			{/* Info Alert */}
			<Alert>
				<AlertCircle className="w-4 h-4" />
				<AlertDescription>
					Payment methods are used for withdrawing your earnings. Make
					sure the account details are accurate to avoid payment
					delays.
				</AlertDescription>
			</Alert>
		</motion.div>
	);
}
