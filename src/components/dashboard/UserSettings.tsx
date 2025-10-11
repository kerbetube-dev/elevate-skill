/**
 * User Settings Component
 * Manage account settings: change name, password, and other preferences
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	User,
	Lock,
	Mail,
	Calendar,
	Shield,
	Eye,
	EyeOff,
	CheckCircle,
	AlertCircle,
	Edit,
	Save,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDate } from "@/utils/dateUtils";

// Validation schemas
const nameChangeSchema = z.object({
	fullName: z
		.string()
		.min(2, "Name must be at least 2 characters")
		.max(50, "Name must be less than 50 characters"),
	currentPassword: z.string().min(1, "Current password is required"),
});

const passwordChangeSchema = z
	.object({
		currentPassword: z.string().min(1, "Current password is required"),
		newPassword: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.regex(
				/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
				"Password must contain at least one uppercase letter, one lowercase letter, and one number"
			),
		confirmPassword: z.string().min(1, "Please confirm your password"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords don't match",
		path: ["confirmPassword"],
	});

type NameChangeForm = z.infer<typeof nameChangeSchema>;
type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;

interface UserData {
	id: string;
	fullName: string;
	email: string;
	createdAt: string;
	lastLogin?: string;
	isEmailVerified: boolean;
	referralCode: string;
}

export function UserSettings() {
	const [userData, setUserData] = useState<UserData | null>(null);
	const [loading, setLoading] = useState(true);
	const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
	const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const { toast } = useToast();

	// Name change form
	const nameForm = useForm<NameChangeForm>({
		resolver: zodResolver(nameChangeSchema),
	});

	// Password change form
	const passwordForm = useForm<PasswordChangeForm>({
		resolver: zodResolver(passwordChangeSchema),
	});

	// Load user data
	useEffect(() => {
		// TODO: Replace with actual API call
		setTimeout(() => {
			const user = JSON.parse(localStorage.getItem("user") || "{}");
			setUserData({
				id: user.id || "1",
				fullName: user.fullName || "Abel Tesfaye",
				email: user.email || "abel@example.com",
				createdAt: user.createdAt || "2024-01-15T10:30:00Z",
				lastLogin: user.lastLogin || "2024-10-11T08:15:00Z",
				isEmailVerified: user.isEmailVerified || true,
				referralCode: user.referralCode || "ABEL2024",
			});
			setLoading(false);
		}, 500);
	}, []);

	const handleNameChange = async (data: NameChangeForm) => {
		try {
			// TODO: Replace with actual API call
			// await userService.updateName(data.fullName, data.currentPassword);

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// Update local state
			if (userData) {
				const updatedUser = { ...userData, fullName: data.fullName };
				setUserData(updatedUser);

				// Update localStorage
				const currentUser = JSON.parse(
					localStorage.getItem("user") || "{}"
				);
				localStorage.setItem(
					"user",
					JSON.stringify({ ...currentUser, fullName: data.fullName })
				);
			}

			toast({
				title: "Success",
				description: "Your name has been updated successfully",
			});
			setIsNameDialogOpen(false);
			nameForm.reset();
		} catch (error) {
			toast({
				title: "Error",
				description:
					"Failed to update name. Please check your current password.",
				variant: "destructive",
			});
		}
	};

	const handlePasswordChange = async (data: PasswordChangeForm) => {
		try {
			// TODO: Replace with actual API call
			// await userService.updatePassword(data.currentPassword, data.newPassword);

			// Simulate API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast({
				title: "Success",
				description: "Your password has been updated successfully",
			});
			setIsPasswordDialogOpen(false);
			passwordForm.reset();
		} catch (error) {
			toast({
				title: "Error",
				description:
					"Failed to update password. Please check your current password.",
				variant: "destructive",
			});
		}
	};

	const openNameDialog = () => {
		if (userData) {
			nameForm.setValue("fullName", userData.fullName);
		}
		setIsNameDialogOpen(true);
	};

	const openPasswordDialog = () => {
		passwordForm.reset();
		setIsPasswordDialogOpen(true);
	};

	const getUserInitials = (name: string) => {
		return name
			.split(" ")
			.map((n) => n[0])
			.join("")
			.toUpperCase()
			.substring(0, 2);
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="space-y-2">
					<h2 className="font-bold text-xl sm:text-2xl md:text-3xl">
						Settings
					</h2>
					<p className="text-muted-foreground text-sm sm:text-base">
						Loading settings...
					</p>
				</div>
				<div className="gap-6 grid">
					{Array.from({ length: 3 }).map((_, index) => (
						<Card key={index} className="animate-pulse">
							<CardContent className="p-6">
								<div className="bg-muted rounded-lg h-24"></div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (!userData) {
		return (
			<div className="space-y-6">
				<div className="space-y-2">
					<h2 className="font-bold text-xl sm:text-2xl md:text-3xl">
						Settings
					</h2>
					<p className="text-muted-foreground text-sm sm:text-base">
						Failed to load user data
					</p>
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
			<div className="space-y-2">
				<h2 className="font-bold text-xl sm:text-2xl md:text-3xl">
					Settings
				</h2>
				<p className="text-muted-foreground text-sm sm:text-base">
					Manage your account settings and preferences
				</p>
			</div>

			{/* Profile Information */}
			<motion.div variants={staggerItem}>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="w-5 h-5 text-primary" />
							Profile Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Profile Header */}
						<div className="flex items-center gap-4">
							<Avatar className="bg-gradient-primary w-16 h-16">
								<AvatarFallback className="bg-gradient-primary font-semibold text-white text-lg">
									{getUserInitials(userData.fullName)}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<h3 className="font-semibold text-lg">
									{userData.fullName}
								</h3>
								<p className="text-muted-foreground">
									{userData.email}
								</p>
								<div className="flex items-center gap-2 mt-1">
									{userData.isEmailVerified ? (
										<div className="flex items-center gap-1 text-green-600 text-sm">
											<CheckCircle className="w-4 h-4" />
											Email Verified
										</div>
									) : (
										<div className="flex items-center gap-1 text-orange-600 text-sm">
											<AlertCircle className="w-4 h-4" />
											Email Not Verified
										</div>
									)}
								</div>
							</div>
						</div>

						<Separator />

						{/* Account Details */}
						<div className="gap-4 grid sm:grid-cols-2">
							<div className="space-y-2">
								<Label className="font-medium text-sm">
									Full Name
								</Label>
								<div className="flex justify-between items-center bg-muted p-3 rounded-lg">
									<span>{userData.fullName}</span>
									<Dialog
										open={isNameDialogOpen}
										onOpenChange={setIsNameDialogOpen}
									>
										<DialogTrigger asChild>
											<Button
												variant="ghost"
												size="sm"
												onClick={openNameDialog}
											>
												<Edit className="w-4 h-4" />
											</Button>
										</DialogTrigger>
										<DialogContent className="sm:max-w-[400px]">
											<DialogHeader>
												<DialogTitle>
													Change Name
												</DialogTitle>
												<DialogDescription>
													Update your full name.
													You'll need to enter your
													current password to confirm
													this change.
												</DialogDescription>
											</DialogHeader>
											<form
												onSubmit={nameForm.handleSubmit(
													handleNameChange
												)}
												className="space-y-4"
											>
												<div className="space-y-2">
													<Label htmlFor="fullName">
														Full Name
													</Label>
													<Input
														{...nameForm.register(
															"fullName"
														)}
														placeholder="Enter your full name"
													/>
													{nameForm.formState.errors
														.fullName && (
														<p className="text-destructive text-sm">
															{
																nameForm
																	.formState
																	.errors
																	.fullName
																	.message
															}
														</p>
													)}
												</div>
												<div className="space-y-2">
													<Label htmlFor="currentPassword">
														Current Password
													</Label>
													<div className="relative">
														<Input
															{...nameForm.register(
																"currentPassword"
															)}
															type={
																showCurrentPassword
																	? "text"
																	: "password"
															}
															placeholder="Enter your current password"
														/>
														<Button
															type="button"
															variant="ghost"
															size="sm"
															className="top-0 right-0 absolute hover:bg-transparent px-3 py-2 h-full"
															onClick={() =>
																setShowCurrentPassword(
																	!showCurrentPassword
																)
															}
														>
															{showCurrentPassword ? (
																<EyeOff className="w-4 h-4" />
															) : (
																<Eye className="w-4 h-4" />
															)}
														</Button>
													</div>
													{nameForm.formState.errors
														.currentPassword && (
														<p className="text-destructive text-sm">
															{
																nameForm
																	.formState
																	.errors
																	.currentPassword
																	.message
															}
														</p>
													)}
												</div>
												<div className="flex gap-2 pt-4">
													<Button
														type="button"
														variant="outline"
														onClick={() =>
															setIsNameDialogOpen(
																false
															)
														}
														className="flex-1"
													>
														Cancel
													</Button>
													<Button
														type="submit"
														disabled={
															nameForm.formState
																.isSubmitting
														}
														className="flex-1"
													>
														{nameForm.formState
															.isSubmitting
															? "Updating..."
															: "Update Name"}
													</Button>
												</div>
											</form>
										</DialogContent>
									</Dialog>
								</div>
							</div>

							<div className="space-y-2">
								<Label className="font-medium text-sm">
									Email Address
								</Label>
								<div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
									<Mail className="w-4 h-4 text-muted-foreground" />
									<span className="flex-1">
										{userData.email}
									</span>
									{userData.isEmailVerified && (
										<CheckCircle className="w-4 h-4 text-green-600" />
									)}
								</div>
							</div>

							<div className="space-y-2">
								<Label className="font-medium text-sm">
									Member Since
								</Label>
								<div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
									<Calendar className="w-4 h-4 text-muted-foreground" />
									<span>
										{formatDate(userData.createdAt)}
									</span>
								</div>
							</div>

							<div className="space-y-2">
								<Label className="font-medium text-sm">
									Referral Code
								</Label>
								<div className="flex items-center gap-2 bg-muted p-3 rounded-lg">
									<span className="font-mono font-bold">
										{userData.referralCode}
									</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>

			{/* Security Settings */}
			<motion.div variants={staggerItem}>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Shield className="w-5 h-5 text-primary" />
							Security Settings
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex justify-between items-center p-4 border rounded-lg">
							<div className="flex items-center gap-3">
								<Lock className="w-5 h-5 text-muted-foreground" />
								<div>
									<h4 className="font-medium">Password</h4>
									<p className="text-muted-foreground text-sm">
										Last updated:{" "}
										{formatDate(userData.lastLogin)}
									</p>
								</div>
							</div>
							<Dialog
								open={isPasswordDialogOpen}
								onOpenChange={setIsPasswordDialogOpen}
							>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										onClick={openPasswordDialog}
									>
										Change Password
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-[400px]">
									<DialogHeader>
										<DialogTitle>
											Change Password
										</DialogTitle>
										<DialogDescription>
											Create a new password for your
											account. Make sure it's strong and
											secure.
										</DialogDescription>
									</DialogHeader>
									<form
										onSubmit={passwordForm.handleSubmit(
											handlePasswordChange
										)}
										className="space-y-4"
									>
										<div className="space-y-2">
											<Label htmlFor="currentPassword">
												Current Password
											</Label>
											<div className="relative">
												<Input
													{...passwordForm.register(
														"currentPassword"
													)}
													type={
														showCurrentPassword
															? "text"
															: "password"
													}
													placeholder="Enter your current password"
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="top-0 right-0 absolute hover:bg-transparent px-3 py-2 h-full"
													onClick={() =>
														setShowCurrentPassword(
															!showCurrentPassword
														)
													}
												>
													{showCurrentPassword ? (
														<EyeOff className="w-4 h-4" />
													) : (
														<Eye className="w-4 h-4" />
													)}
												</Button>
											</div>
											{passwordForm.formState.errors
												.currentPassword && (
												<p className="text-destructive text-sm">
													{
														passwordForm.formState
															.errors
															.currentPassword
															.message
													}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="newPassword">
												New Password
											</Label>
											<div className="relative">
												<Input
													{...passwordForm.register(
														"newPassword"
													)}
													type={
														showNewPassword
															? "text"
															: "password"
													}
													placeholder="Enter your new password"
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="top-0 right-0 absolute hover:bg-transparent px-3 py-2 h-full"
													onClick={() =>
														setShowNewPassword(
															!showNewPassword
														)
													}
												>
													{showNewPassword ? (
														<EyeOff className="w-4 h-4" />
													) : (
														<Eye className="w-4 h-4" />
													)}
												</Button>
											</div>
											{passwordForm.formState.errors
												.newPassword && (
												<p className="text-destructive text-sm">
													{
														passwordForm.formState
															.errors.newPassword
															.message
													}
												</p>
											)}
										</div>

										<div className="space-y-2">
											<Label htmlFor="confirmPassword">
												Confirm New Password
											</Label>
											<div className="relative">
												<Input
													{...passwordForm.register(
														"confirmPassword"
													)}
													type={
														showConfirmPassword
															? "text"
															: "password"
													}
													placeholder="Confirm your new password"
												/>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="top-0 right-0 absolute hover:bg-transparent px-3 py-2 h-full"
													onClick={() =>
														setShowConfirmPassword(
															!showConfirmPassword
														)
													}
												>
													{showConfirmPassword ? (
														<EyeOff className="w-4 h-4" />
													) : (
														<Eye className="w-4 h-4" />
													)}
												</Button>
											</div>
											{passwordForm.formState.errors
												.confirmPassword && (
												<p className="text-destructive text-sm">
													{
														passwordForm.formState
															.errors
															.confirmPassword
															.message
													}
												</p>
											)}
										</div>

										<div className="flex gap-2 pt-4">
											<Button
												type="button"
												variant="outline"
												onClick={() =>
													setIsPasswordDialogOpen(
														false
													)
												}
												className="flex-1"
											>
												Cancel
											</Button>
											<Button
												type="submit"
												disabled={
													passwordForm.formState
														.isSubmitting
												}
												className="flex-1"
											>
												{passwordForm.formState
													.isSubmitting
													? "Updating..."
													: "Update Password"}
											</Button>
										</div>
									</form>
								</DialogContent>
							</Dialog>
						</div>

						<Alert>
							<Shield className="w-4 h-4" />
							<AlertDescription>
								Choose a strong password with at least 8
								characters including uppercase, lowercase, and
								numbers.
							</AlertDescription>
						</Alert>
					</CardContent>
				</Card>
			</motion.div>

			{/* Account Information */}
			<motion.div variants={staggerItem}>
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="w-5 h-5 text-primary" />
							Account Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="gap-4 grid sm:grid-cols-2">
							<div className="space-y-2">
								<Label className="font-medium text-sm">
									Last Login
								</Label>
								<div className="bg-muted p-3 rounded-lg">
									{userData.lastLogin
										? formatDate(userData.lastLogin)
										: "Never"}
								</div>
							</div>
							<div className="space-y-2">
								<Label className="font-medium text-sm">
									Account Status
								</Label>
								<div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-3 border border-green-200 dark:border-green-800 rounded-lg">
									<CheckCircle className="w-4 h-4 text-green-600" />
									<span className="font-medium text-green-700 dark:text-green-400">
										Active
									</span>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</motion.div>
		</motion.div>
	);
}
