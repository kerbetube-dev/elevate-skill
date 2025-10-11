/**
 * Responsive utility functions and hooks for better mobile experience
 */

import { useState, useEffect } from "react";

// Breakpoint configuration matching Tailwind CSS
export const breakpoints = {
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	"2xl": 1536,
} as const;

// Hook to detect current screen size
export function useScreenSize() {
	const [screenSize, setScreenSize] = useState({
		width: typeof window !== "undefined" ? window.innerWidth : 0,
		height: typeof window !== "undefined" ? window.innerHeight : 0,
	});

	useEffect(() => {
		if (typeof window === "undefined") return;

		const handleResize = () => {
			setScreenSize({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return screenSize;
}

// Hook to detect if screen is mobile/tablet/desktop
export function useDeviceType() {
	const { width } = useScreenSize();

	return {
		isMobile: width < breakpoints.md,
		isTablet: width >= breakpoints.md && width < breakpoints.lg,
		isDesktop: width >= breakpoints.lg,
		isSmallMobile: width < breakpoints.sm,
	};
}

// Hook for responsive values
export function useResponsiveValue<T>(values: {
	mobile?: T;
	tablet?: T;
	desktop?: T;
	default: T;
}): T {
	const { isMobile, isTablet, isDesktop } = useDeviceType();

	if (isMobile && values.mobile !== undefined) return values.mobile;
	if (isTablet && values.tablet !== undefined) return values.tablet;
	if (isDesktop && values.desktop !== undefined) return values.desktop;

	return values.default;
}

// Utility function to get responsive text size
export function getResponsiveTextSize(
	size: "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl"
) {
	const sizeMap = {
		sm: "text-sm md:text-base",
		base: "text-base md:text-lg",
		lg: "text-lg md:text-xl",
		xl: "text-xl md:text-2xl",
		"2xl": "text-2xl md:text-3xl lg:text-4xl",
		"3xl": "text-3xl md:text-4xl lg:text-5xl",
		"4xl": "text-4xl md:text-5xl lg:text-6xl",
	};

	return sizeMap[size];
}

// Utility function to get responsive spacing
export function getResponsiveSpacing(size: "sm" | "base" | "lg" | "xl") {
	const spacingMap = {
		sm: "py-8 md:py-12 lg:py-16",
		base: "py-12 md:py-16 lg:py-20",
		lg: "py-16 md:py-20 lg:py-24",
		xl: "py-20 md:py-24 lg:py-32",
	};

	return spacingMap[size];
}

// Utility function to get responsive container
export function getResponsiveContainer() {
	return "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
}

// Utility function to get responsive grid
export function getResponsiveGrid(columns: 2 | 3 | 4) {
	const gridMap = {
		2: "grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8",
		3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8",
		4: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8",
	};

	return gridMap[columns];
}

// Safe area utilities for mobile devices with notches
export function getSafeAreaClasses() {
	return {
		top: "pt-safe-top",
		bottom: "pb-safe-bottom",
		left: "pl-safe-left",
		right: "pr-safe-right",
		all: "pt-safe-top pb-safe-bottom pl-safe-left pr-safe-right",
	};
}

// Touch target utilities for mobile accessibility
export function getTouchTargetClass() {
	return "min-h-[44px] min-w-[44px]";
}

// Animation utilities for better mobile performance
export function getReducedMotionClass() {
	return "motion-reduce:animate-none motion-reduce:transition-none";
}
