/**
 * Mini Loading States Component
 * Provides various small loading indicators for different UI contexts
 */

import React from "react";
import { Loader2, RefreshCw, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MiniLoadingProps {
	variant?: "spinner" | "dots" | "pulse" | "bounce" | "refresh";
	size?: "xs" | "sm" | "md" | "lg";
	color?: "primary" | "secondary" | "muted" | "white";
	className?: string;
}

const sizeMap = {
	xs: "w-3 h-3",
	sm: "w-4 h-4",
	md: "w-5 h-5",
	lg: "w-6 h-6",
};

const colorMap = {
	primary: "text-primary",
	secondary: "text-secondary",
	muted: "text-muted-foreground",
	white: "text-white",
};

export const MiniLoading: React.FC<MiniLoadingProps> = ({
	variant = "spinner",
	size = "sm",
	color = "primary",
	className,
}) => {
	const baseClasses = cn(sizeMap[size], colorMap[color], className);

	switch (variant) {
		case "spinner":
			return <Loader2 className={cn(baseClasses, "animate-spin")} />;

		case "refresh":
			return <RefreshCw className={cn(baseClasses, "animate-spin")} />;

		case "dots":
			return (
				<div className={cn("flex space-x-1", className)}>
					{[0, 1, 2].map((i) => (
						<Circle
							key={i}
							className={cn(
								sizeMap[size],
								colorMap[color],
								"animate-pulse fill-current",
								`animation-delay-${i * 150}ms`
							)}
							style={{
								animationDelay: `${i * 150}ms`,
							}}
						/>
					))}
				</div>
			);

		case "pulse":
			return (
				<div
					className={cn(
						sizeMap[size],
						"bg-current rounded-full animate-pulse opacity-75",
						colorMap[color],
						className
					)}
				/>
			);

		case "bounce":
			return (
				<div className={cn("flex space-x-1", className)}>
					{[0, 1, 2].map((i) => (
						<div
							key={i}
							className={cn(
								sizeMap[size],
								"bg-current rounded-full animate-bounce",
								colorMap[color]
							)}
							style={{
								animationDelay: `${i * 100}ms`,
							}}
						/>
					))}
				</div>
			);

		default:
			return <Loader2 className={cn(baseClasses, "animate-spin")} />;
	}
};

// Inline loading component for buttons
export interface InlineLoadingProps {
	loading?: boolean;
	children: React.ReactNode;
	loadingText?: string;
	variant?: MiniLoadingProps["variant"];
	size?: MiniLoadingProps["size"];
	className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
	loading = false,
	children,
	loadingText,
	variant = "spinner",
	size = "sm",
	className,
}) => {
	if (!loading) {
		return <>{children}</>;
	}

	return (
		<div className={cn("flex items-center space-x-2", className)}>
			<MiniLoading variant={variant} size={size} color="white" />
			<span>{loadingText || "Loading..."}</span>
		</div>
	);
};

// Loading overlay for small components
export interface LoadingOverlayProps {
	loading?: boolean;
	children: React.ReactNode;
	variant?: MiniLoadingProps["variant"];
	size?: MiniLoadingProps["size"];
	className?: string;
	overlayClassName?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
	loading = false,
	children,
	variant = "spinner",
	size = "md",
	className,
	overlayClassName,
}) => {
	return (
		<div className={cn("relative", className)}>
			{children}
			{loading && (
				<div
					className={cn(
						"absolute inset-0 bg-background/50 backdrop-blur-sm",
						"flex items-center justify-center",
						"rounded-md z-10",
						overlayClassName
					)}
				>
					<MiniLoading variant={variant} size={size} />
				</div>
			)}
		</div>
	);
};

// Loading skeleton for text/content
export interface LoadingSkeletonProps {
	className?: string;
	lines?: number;
	width?: "full" | "3/4" | "1/2" | "1/4";
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
	className,
	lines = 1,
	width = "full",
}) => {
	const widthMap = {
		full: "w-full",
		"3/4": "w-3/4",
		"1/2": "w-1/2",
		"1/4": "w-1/4",
	};

	return (
		<div className={cn("space-y-2", className)}>
			{Array.from({ length: lines }).map((_, i) => (
				<div
					key={i}
					className={cn(
						"bg-muted rounded h-3 animate-pulse",
						i === lines - 1 && lines > 1
							? widthMap["3/4"]
							: widthMap[width]
					)}
				/>
			))}
		</div>
	);
};

// Export all components as named exports
export default MiniLoading;
