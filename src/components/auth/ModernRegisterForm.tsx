/**
 * Modern Register Form with Password Strength Meter
 * Multi-step registration with animations
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import {
	Eye,
	EyeOff,
	Mail,
	Lock,
	User,
	Phone,
	Tag,
	Loader2,
	CheckCircle,
	AlertCircle,
	Check,
	X,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "./AuthLayout";
import { staggerContainer, staggerItem } from "@/lib/animations";

export function ModernRegisterForm() {
	const [searchParams] = useSearchParams();
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		phoneNumber: "",
		password: "",
		confirmPassword: "",
		referralCode: "",
	});

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { toast } = useToast();
	const navigate = useNavigate();

	// Auto-fill referral code from URL query parameter
	useEffect(() => {
		const refCode = searchParams.get("ref");
		if (refCode) {
			setFormData((prev) => ({
				...prev,
				referralCode: refCode,
			}));
		}
	}, [searchParams]);

	// Validation states
	const [touched, setTouched] = useState({
		fullName: false,
		email: false,
		phoneNumber: false,
		password: false,
		confirmPassword: false,
	});

	// Password strength calculation
	const calculatePasswordStrength = (password: string): number => {
		let strength = 0;
		if (password.length >= 6) strength += 20;
		if (password.length >= 8) strength += 20;
		if (/[a-z]/.test(password)) strength += 20;
		if (/[A-Z]/.test(password)) strength += 20;
		if (/[0-9]/.test(password)) strength += 10;
		if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
		return strength;
	};

	const passwordStrength = calculatePasswordStrength(formData.password);
	const getPasswordStrengthLabel = (strength: number): string => {
		if (strength < 40) return "Weak";
		if (strength < 60) return "Fair";
		if (strength < 80) return "Good";
		return "Strong";
	};

	const getPasswordStrengthColor = (strength: number): string => {
		if (strength < 40) return "bg-destructive";
		if (strength < 60) return "bg-warning-500";
		if (strength < 80) return "bg-blue-500";
		return "bg-success-600";
	};

	// Password requirements
	const passwordRequirements = [
		{ label: "At least 6 characters", met: formData.password.length >= 6 },
		{
			label: "Contains lowercase letter",
			met: /[a-z]/.test(formData.password),
		},
		{
			label: "Contains uppercase letter",
			met: /[A-Z]/.test(formData.password),
		},
		{ label: "Contains number", met: /[0-9]/.test(formData.password) },
	];

	// Validation
	const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
	const phoneValid = formData.phoneNumber.length >= 10;
	const passwordsMatch =
		formData.password === formData.confirmPassword &&
		formData.password.length > 0;
	const formValid =
		formData.fullName.length >= 2 &&
		emailValid &&
		phoneValid &&
		formData.password.length >= 6 &&
		passwordsMatch;

	const handleChange =
		(field: keyof typeof formData) =>
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setFormData({ ...formData, [field]: e.target.value });
		};

	const handleBlur = (field: keyof typeof touched) => () => {
		setTouched({ ...touched, [field]: true });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!formValid) {
			setError("Please fill in all required fields correctly");
			return;
		}

		try {
			setLoading(true);
			await authService.register({
				fullName: formData.fullName,
				email: formData.email,
				phone: formData.phoneNumber,
				password: formData.password,
				referralCode: formData.referralCode || undefined,
			});

			toast({
				title: "Account Created!",
				description:
					"Welcome to Elevate Skill! Redirecting to dashboard...",
			});

			// Success animation then redirect
			setTimeout(() => {
				window.location.href = "/dashboard";
			}, 1500);
		} catch (err) {
			setError(
				err.response?.data?.detail ||
					"Registration failed. Please try again."
			);
			setLoading(false);
		}
	};

	return (
		<AuthLayout
			title="Create Account"
			subtitle="Start your learning journey today"
			type="register"
		>
			<motion.form
				variants={staggerContainer}
				initial="hidden"
				animate="visible"
				onSubmit={handleSubmit}
				className="space-y-5"
			>
				{/* Full Name */}
				<motion.div variants={staggerItem} className="space-y-2">
					<Label htmlFor="fullName">Full Name</Label>
					<div className="relative">
						<User className="top-1/2 left-3 absolute w-5 h-5 text-muted-foreground -translate-y-1/2 transform" />
						<Input
							id="fullName"
							placeholder="John Doe"
							value={formData.fullName}
							onChange={handleChange("fullName")}
							onBlur={handleBlur("fullName")}
							className={`pl-10 h-11 ${
								touched.fullName && formData.fullName.length < 2
									? "border-destructive"
									: ""
							}`}
							disabled={loading}
						/>
					</div>
				</motion.div>

				{/* Email */}
				<motion.div variants={staggerItem} className="space-y-2">
					<Label htmlFor="email">Email Address</Label>
					<div className="relative">
						<Mail className="top-1/2 left-3 absolute w-5 h-5 text-muted-foreground -translate-y-1/2 transform" />
						<Input
							id="email"
							type="email"
							placeholder="you@example.com"
							value={formData.email}
							onChange={handleChange("email")}
							onBlur={handleBlur("email")}
							className={`pl-10 h-11 ${
								touched.email && !emailValid
									? "border-destructive"
									: ""
							}`}
							disabled={loading}
						/>
						{touched.email && emailValid && (
							<CheckCircle className="top-1/2 right-3 absolute w-5 h-5 text-success-600 -translate-y-1/2 transform" />
						)}
					</div>
				</motion.div>

				{/* Phone Number */}
				<motion.div variants={staggerItem} className="space-y-2">
					<Label htmlFor="phoneNumber">Phone Number</Label>
					<div className="relative">
						<Phone className="top-1/2 left-3 absolute w-5 h-5 text-muted-foreground -translate-y-1/2 transform" />
						<Input
							id="phoneNumber"
							type="tel"
							placeholder="+251 9XX XXX XXX"
							value={formData.phoneNumber}
							onChange={handleChange("phoneNumber")}
							onBlur={handleBlur("phoneNumber")}
							className={`pl-10 h-11 ${
								touched.phoneNumber && !phoneValid
									? "border-destructive"
									: ""
							}`}
							disabled={loading}
						/>
					</div>
				</motion.div>

				{/* Password */}
				<motion.div variants={staggerItem} className="space-y-2">
					<Label htmlFor="password">Password</Label>
					<div className="relative">
						<Lock className="top-1/2 left-3 absolute w-5 h-5 text-muted-foreground -translate-y-1/2 transform" />
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder="Create a strong password"
							value={formData.password}
							onChange={handleChange("password")}
							onBlur={handleBlur("password")}
							className="pr-10 pl-10 h-11"
							disabled={loading}
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="top-1/2 right-3 absolute text-muted-foreground hover:text-foreground -translate-y-1/2 transform"
							disabled={loading}
						>
							{showPassword ? (
								<EyeOff className="w-5 h-5" />
							) : (
								<Eye className="w-5 h-5" />
							)}
						</button>
					</div>

					{/* Password Strength Meter */}
					{formData.password.length > 0 && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="space-y-2 pt-2"
						>
							<div className="flex justify-between items-center text-sm">
								<span className="text-muted-foreground">
									Password strength:
								</span>
								<span
									className={`font-semibold ${
										passwordStrength < 40
											? "text-destructive"
											: passwordStrength < 60
											? "text-warning-600"
											: passwordStrength < 80
											? "text-blue-600"
											: "text-success-600"
									}`}
								>
									{getPasswordStrengthLabel(passwordStrength)}
								</span>
							</div>
							<Progress
								value={passwordStrength}
								className="h-2"
							/>

							{/* Password Requirements */}
							<div className="gap-2 grid grid-cols-2 text-xs">
								{passwordRequirements.map((req, index) => (
									<div
										key={index}
										className={`flex items-center gap-1 ${
											req.met
												? "text-success-600"
												: "text-muted-foreground"
										}`}
									>
										{req.met ? (
											<Check className="w-3 h-3" />
										) : (
											<X className="w-3 h-3" />
										)}
										<span>{req.label}</span>
									</div>
								))}
							</div>
						</motion.div>
					)}
				</motion.div>

				{/* Confirm Password */}
				<motion.div variants={staggerItem} className="space-y-2">
					<Label htmlFor="confirmPassword">Confirm Password</Label>
					<div className="relative">
						<Lock className="top-1/2 left-3 absolute w-5 h-5 text-muted-foreground -translate-y-1/2 transform" />
						<Input
							id="confirmPassword"
							type={showConfirmPassword ? "text" : "password"}
							placeholder="Re-enter your password"
							value={formData.confirmPassword}
							onChange={handleChange("confirmPassword")}
							onBlur={handleBlur("confirmPassword")}
							className={`pl-10 pr-10 h-11 ${
								touched.confirmPassword && !passwordsMatch
									? "border-destructive"
									: ""
							}`}
							disabled={loading}
						/>
						<button
							type="button"
							onClick={() =>
								setShowConfirmPassword(!showConfirmPassword)
							}
							className="top-1/2 right-3 absolute text-muted-foreground hover:text-foreground -translate-y-1/2 transform"
							disabled={loading}
						>
							{showConfirmPassword ? (
								<EyeOff className="w-5 h-5" />
							) : (
								<Eye className="w-5 h-5" />
							)}
						</button>
						{touched.confirmPassword && passwordsMatch && (
							<CheckCircle className="top-1/2 right-12 absolute w-5 h-5 text-success-600 -translate-y-1/2 transform" />
						)}
					</div>
					{touched.confirmPassword &&
						!passwordsMatch &&
						formData.confirmPassword.length > 0 && (
							<motion.p
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className="flex items-center gap-1 text-destructive text-sm"
							>
								<AlertCircle className="w-4 h-4" />
								Passwords do not match
							</motion.p>
						)}
				</motion.div>

				{/* Referral Code (Optional) */}
				<motion.div variants={staggerItem} className="space-y-2">
					<Label
						htmlFor="referralCode"
						className="flex items-center gap-2"
					>
						Referral Code
						<span className="text-muted-foreground text-xs">
							(Optional)
						</span>
					</Label>
					<div className="relative">
						<Tag className="top-1/2 left-3 absolute w-5 h-5 text-muted-foreground -translate-y-1/2 transform" />
						<Input
							id="referralCode"
							placeholder="Enter referral code"
							value={formData.referralCode}
							onChange={handleChange("referralCode")}
							className="pl-10 h-11"
							disabled={loading}
						/>
					</div>
				</motion.div>

				{/* Error Alert */}
				{error && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						variants={staggerItem}
					>
						<Alert variant="destructive">
							<AlertCircle className="w-4 h-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					</motion.div>
				)}

				{/* Submit Button */}
				<motion.div variants={staggerItem}>
					<Button
						type="submit"
						variant="gradient"
						size="lg"
						className="w-full h-11"
						disabled={loading || !formValid}
					>
						{loading ? (
							<>
								<Loader2 className="mr-2 w-5 h-5 animate-spin" />
								Creating account...
							</>
						) : (
							"Create Account"
						)}
					</Button>
				</motion.div>

				{/* Divider */}
				<motion.div variants={staggerItem} className="relative">
					<Separator />
					<span className="top-1/2 left-1/2 absolute bg-background px-4 text-muted-foreground text-sm -translate-x-1/2 -translate-y-1/2 transform">
						Or continue with
					</span>
				</motion.div>

				{/* Social Registration */}
				<motion.div
					variants={staggerItem}
					className="gap-4 grid grid-cols-2"
				>
					<Button
						type="button"
						variant="outline"
						size="lg"
						className="h-11"
						disabled={loading}
					>
						<svg className="mr-2 w-5 h-5" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="currentColor"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="currentColor"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							/>
							<path
								fill="currentColor"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							/>
						</svg>
						Google
					</Button>
					<Button
						type="button"
						variant="outline"
						size="lg"
						className="h-11"
						disabled={loading}
					>
						<svg
							className="mr-2 w-5 h-5"
							fill="currentColor"
							viewBox="0 0 24 24"
						>
							<path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z" />
						</svg>
						Facebook
					</Button>
				</motion.div>

				{/* Login Link */}
				<motion.div variants={staggerItem} className="text-center">
					<p className="text-muted-foreground text-sm">
						Already have an account?{" "}
						<Link
							to="/login"
							className="font-semibold text-primary hover:underline"
						>
							Sign in
						</Link>
					</p>
				</motion.div>
			</motion.form>
		</AuthLayout>
	);
}
