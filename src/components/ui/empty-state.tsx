/**
 * Empty State Component
 * Reusable empty states for dashboard sections
 */

import { motion } from "framer-motion";
import {
	LucideIcon,
	BookOpen,
	GraduationCap,
	Users,
	Award,
	TrendingUp,
	CreditCard,
	RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
	icon?: LucideIcon;
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
		variant?: "default" | "outline" | "gradient";
	};
	secondaryAction?: {
		label: string;
		onClick: () => void;
	};
	className?: string;
	size?: "sm" | "md" | "lg";
}

const iconSizes = {
	sm: "w-12 h-12",
	md: "w-16 h-16",
	lg: "w-24 h-24",
};

const titleSizes = {
	sm: "text-lg",
	md: "text-xl",
	lg: "text-2xl",
};

const descriptionSizes = {
	sm: "text-sm",
	md: "text-base",
	lg: "text-lg",
};

export function EmptyState({
	icon: Icon = BookOpen,
	title,
	description,
	action,
	secondaryAction,
	className,
	size = "md",
}: EmptyStateProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className={cn("py-12 text-center", className)}
		>
			<motion.div
				initial={{ scale: 0.8 }}
				animate={{ scale: 1 }}
				transition={{ duration: 0.5, delay: 0.1 }}
				className="flex justify-center mb-6"
			>
				<div className="flex justify-center items-center bg-muted/50 p-6 rounded-full">
					<Icon
						className={cn(
							iconSizes[size],
							"text-muted-foreground opacity-50"
						)}
					/>
				</div>
			</motion.div>

			<motion.h3
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className={cn("mb-2 font-semibold", titleSizes[size])}
			>
				{title}
			</motion.h3>

			<motion.p
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.3 }}
				className={cn(
					"mx-auto mb-6 max-w-md text-muted-foreground",
					descriptionSizes[size]
				)}
			>
				{description}
			</motion.p>

			{(action || secondaryAction) && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="flex sm:flex-row flex-col justify-center gap-3"
				>
					{action && (
						<Button
							variant={action.variant || "default"}
							onClick={action.onClick}
							className={
								action.variant === "gradient" ? "shadow-lg" : ""
							}
						>
							{action.label}
						</Button>
					)}
					{secondaryAction && (
						<Button
							variant="outline"
							onClick={secondaryAction.onClick}
						>
							{secondaryAction.label}
						</Button>
					)}
				</motion.div>
			)}
		</motion.div>
	);
}

// Predefined empty states for common dashboard scenarios
export function NoCourses({
	onBrowseCourses,
}: {
	onBrowseCourses: () => void;
}) {
	return (
		<Card className="p-12">
			<EmptyState
				icon={BookOpen}
				title="No Courses Yet"
				description="You haven't enrolled in any courses yet. Explore our available courses and start learning today!"
				action={{
					label: "Browse Courses",
					onClick: onBrowseCourses,
					variant: "gradient",
				}}
				size="lg"
			/>
		</Card>
	);
}

export function NoEnrollments({
	onViewCourses,
}: {
	onViewCourses: () => void;
}) {
	return (
		<EmptyState
			icon={GraduationCap}
			title="Start Your Learning Journey"
			description="Enroll in courses to track your progress and earn certificates."
			action={{
				label: "View Available Courses",
				onClick: onViewCourses,
				variant: "gradient",
			}}
		/>
	);
}

export function NoReferrals({ referralCode }: { referralCode: string }) {
	return (
		<EmptyState
			icon={Users}
			title="No Referrals Yet"
			description={`Share your referral code "${referralCode}" with friends and earn rewards when they enroll in courses.`}
			size="lg"
		/>
	);
}

export function NoWithdrawals({
	onCreateWithdrawal,
}: {
	onCreateWithdrawal: () => void;
}) {
	return (
		<EmptyState
			icon={CreditCard}
			title="No Withdrawals"
			description="You haven't made any withdrawal requests yet. Request a withdrawal when you have earnings to withdraw."
			action={{
				label: "Request Withdrawal",
				onClick: onCreateWithdrawal,
				variant: "default",
			}}
		/>
	);
}

export function NoActivity() {
	return (
		<EmptyState
			icon={TrendingUp}
			title="No Recent Activity"
			description="Your learning activity will appear here as you progress through courses."
			size="sm"
		/>
	);
}

export function NoProgress() {
	return (
		<EmptyState
			icon={Award}
			title="Start Learning"
			description="Enroll in courses to see your overall progress."
			size="sm"
		/>
	);
}

export function LoadingError({
	onRetry,
	error = "Failed to load data",
}: {
	onRetry: () => void;
	error?: string;
}) {
	return (
		<Card className="p-8">
			<EmptyState
				icon={RefreshCw}
				title="Unable to Load"
				description={error}
				action={{
					label: "Try Again",
					onClick: onRetry,
					variant: "outline",
				}}
				size="md"
			/>
		</Card>
	);
}
