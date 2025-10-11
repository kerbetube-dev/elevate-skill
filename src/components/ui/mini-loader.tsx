/**
 * Mini Loader Component
 * Small loading indicators for dashboard data fetching
 */

import { motion } from "framer-motion";
import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface MiniLoaderProps {
	size?: "sm" | "md" | "lg";
	variant?: "spinner" | "pulse" | "dots" | "refresh";
	className?: string;
	text?: string;
}

const sizeClasses = {
	sm: "w-4 h-4",
	md: "w-6 h-6",
	lg: "w-8 h-8",
};

const textSizeClasses = {
	sm: "text-xs",
	md: "text-sm",
	lg: "text-base",
};

export function MiniLoader({
	size = "md",
	variant = "spinner",
	className,
	text,
}: MiniLoaderProps) {
	const renderLoader = () => {
		switch (variant) {
			case "spinner":
				return (
					<Loader2
						className={cn(
							sizeClasses[size],
							"animate-spin text-primary",
							className
						)}
					/>
				);

			case "refresh":
				return (
					<RefreshCw
						className={cn(
							sizeClasses[size],
							"animate-spin text-primary",
							className
						)}
					/>
				);

			case "pulse":
				return (
					<motion.div
						className={cn(
							sizeClasses[size],
							"bg-primary rounded-full",
							className
						)}
						animate={{
							scale: [1, 1.2, 1],
							opacity: [1, 0.5, 1],
						}}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
				);

			case "dots":
				return (
					<div className={cn("flex gap-1", className)}>
						{[0, 1, 2].map((index) => (
							<motion.div
								key={index}
								className="bg-primary rounded-full w-2 h-2"
								animate={{
									scale: [1, 1.5, 1],
									opacity: [0.5, 1, 0.5],
								}}
								transition={{
									duration: 1,
									repeat: Infinity,
									delay: index * 0.2,
									ease: "easeInOut",
								}}
							/>
						))}
					</div>
				);

			default:
				return null;
		}
	};

	if (text) {
		return (
			<div className="flex items-center gap-2">
				{renderLoader()}
				<span
					className={cn(
						"text-muted-foreground",
						textSizeClasses[size]
					)}
				>
					{text}
				</span>
			</div>
		);
	}

	return renderLoader();
}

// Skeleton loader for cards and content
export function CardSkeleton({ className }: { className?: string }) {
	return (
		<motion.div
			className={cn("bg-muted/50 rounded-lg", className)}
			animate={{
				opacity: [0.5, 1, 0.5],
			}}
			transition={{
				duration: 2,
				repeat: Infinity,
				ease: "easeInOut",
			}}
		/>
	);
}

// Stat card skeleton
export function StatCardSkeleton() {
	return (
		<div className="bg-card p-6 border rounded-lg">
			<div className="flex justify-between items-start mb-4">
				<CardSkeleton className="rounded-xl w-12 h-12" />
				<CardSkeleton className="rounded-full w-12 h-6" />
			</div>
			<div className="space-y-2">
				<CardSkeleton className="w-16 h-8" />
				<CardSkeleton className="w-24 h-4" />
			</div>
		</div>
	);
}

// Course card skeleton
export function CourseCardSkeleton() {
	return (
		<div className="bg-card border rounded-lg overflow-hidden">
			<CardSkeleton className="w-full h-48" />
			<div className="space-y-4 p-6">
				<CardSkeleton className="w-3/4 h-6" />
				<CardSkeleton className="w-full h-4" />
				<CardSkeleton className="w-full h-4" />
				<div className="flex justify-between items-center">
					<CardSkeleton className="w-16 h-6" />
					<CardSkeleton className="rounded-full w-20 h-8" />
				</div>
			</div>
		</div>
	);
}

// Grid skeleton for multiple items
export function GridSkeleton({
	columns = 3,
	rows = 2,
	ItemSkeleton = CardSkeleton,
}: {
	columns?: number;
	rows?: number;
	ItemSkeleton?: React.ComponentType<{ className?: string }>;
}) {
	return (
		<div
			className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns} gap-6`}
		>
			{Array.from({ length: columns * rows }).map((_, index) => (
				<ItemSkeleton key={index} className="w-full h-32" />
			))}
		</div>
	);
}
