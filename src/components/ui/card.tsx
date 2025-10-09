import * as React from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "shadow-sm hover:shadow-md",
        elevated: "shadow-elevation-medium hover:shadow-elevation-high",
        glass: "glass border-white/30 shadow-glass",
        gradient: "bg-gradient-primary text-white border-0 shadow-glow",
        outline: "border-2 shadow-none hover:shadow-sm",
        flat: "shadow-none border-0 bg-muted/50",
      },
      hover: {
        none: "",
        lift: "hover:-translate-y-1",
        glow: "hover:shadow-glow",
        scale: "hover:scale-[1.02]",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "none",
    },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  animated?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hover, animated = false, ...props }, ref) => {
    if (animated) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: hover === "scale" ? 1.02 : 1 }}
          ref={ref}
          className={cn(cardVariants({ variant, hover, className }))}
          {...props}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, hover, className }))}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight font-heading", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

// New Card Image component
const CardImage = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("overflow-hidden rounded-t-lg", className)} {...props} />
  ),
);
CardImage.displayName = "CardImage";

// New Card Badge component (for status, categories, etc.)
const CardBadge = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("absolute top-4 right-4 z-10", className)}
      {...props}
    />
  ),
);
CardBadge.displayName = "CardBadge";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent, CardImage, CardBadge, cardVariants };
