/**
 * Utility helpers for class names and styling
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with tailwind-merge to handle conflicts
 * Already exported from utils.ts, but re-exported here for convenience
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Conditional class helper - returns class only if condition is true
 */
export function conditionalClass(condition: boolean, trueClass: string, falseClass: string = ""): string {
  return condition ? trueClass : falseClass;
}

/**
 * Responsive padding helper
 */
export const responsivePadding = {
  sm: "px-4 py-2",
  md: "px-6 py-3",
  lg: "px-8 py-4",
  xl: "px-12 py-6",
};

/**
 * Common gradient classes
 */
export const gradients = {
  primary: "bg-gradient-primary",
  ocean: "bg-gradient-ocean",
  sunset: "bg-gradient-sunset",
  forest: "bg-gradient-forest",
  cosmic: "bg-gradient-cosmic",
  success: "bg-gradient-success",
  warning: "bg-gradient-warning",
  danger: "bg-gradient-danger",
  mesh: "bg-gradient-mesh",
};

/**
 * Common shadow classes
 */
export const shadows = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  glow: "shadow-glow",
  glowSm: "shadow-glow-sm",
  glowLg: "shadow-glow-lg",
  glass: "shadow-glass",
  elegant: "shadow-elegant",
};

/**
 * Glassmorphism preset
 */
export const glassEffect = "glass backdrop-blur-lg border border-white/30";

/**
 * Hover effects
 */
export const hoverEffects = {
  lift: "hover-lift",
  glow: "card-glow",
  scale: "hover:scale-105 transition-transform duration-300",
};

/**
 * Text gradient helper
 */
export function textGradient(gradient: keyof typeof gradients = "primary"): string {
  return `${gradients[gradient]} bg-clip-text text-transparent`;
}

/**
 * Generate responsive grid classes
 */
export function responsiveGrid(cols: { sm?: number; md?: number; lg?: number; xl?: number }): string {
  const classes: string[] = [];
  
  if (cols.sm) classes.push(`grid-cols-${cols.sm}`);
  if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
  
  return cn("grid gap-4", ...classes);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(lines: number = 1): string {
  if (lines === 1) {
    return "truncate";
  }
  return `line-clamp-${lines}`;
}

/**
 * Center content helpers
 */
export const center = {
  xy: "flex items-center justify-center",
  x: "flex justify-center",
  y: "flex items-center",
};

/**
 * Spacing helpers
 */
export const spacing = {
  section: "py-16 md:py-24",
  container: "px-4 md:px-6 lg:px-8",
  gap: {
    xs: "gap-2",
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
    xl: "gap-12",
  },
};

/**
 * Typography helpers
 */
export const typography = {
  h1: "text-4xl md:text-5xl lg:text-6xl font-bold font-heading",
  h2: "text-3xl md:text-4xl lg:text-5xl font-bold font-heading",
  h3: "text-2xl md:text-3xl lg:text-4xl font-semibold font-heading",
  h4: "text-xl md:text-2xl lg:text-3xl font-semibold font-heading",
  h5: "text-lg md:text-xl font-semibold font-heading",
  h6: "text-base md:text-lg font-semibold font-heading",
  body: "text-base",
  small: "text-sm",
  tiny: "text-xs",
};

/**
 * Animation delay helper
 */
export function animationDelay(ms: number): string {
  return `delay-${ms}`;
}

/**
 * Aspect ratio helper
 */
export const aspectRatio = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[21/9]",
  ultraWide: "aspect-[32/9]",
};

