import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md",
        outline: "border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground hover:border-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-md",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // New modern variants
        gradient: "bg-gradient-primary text-white hover:shadow-glow hover:scale-105 active:scale-95",
        "gradient-ocean": "bg-gradient-ocean text-white hover:shadow-glow hover:scale-105 active:scale-95",
        "gradient-sunset": "bg-gradient-sunset text-white hover:shadow-glow hover:scale-105 active:scale-95",
        "gradient-forest": "bg-gradient-forest text-white hover:shadow-glow hover:scale-105 active:scale-95",
        "gradient-cosmic": "bg-gradient-cosmic text-white hover:shadow-glow hover:scale-105 active:scale-95",
        glass: "glass text-foreground hover:bg-white/20 backdrop-blur-lg border border-white/30",
        "glass-dark": "glass text-white hover:bg-black/20 backdrop-blur-lg border border-white/20",
        success: "bg-success-500 text-white hover:bg-success-600 hover:shadow-md hover:scale-105",
        warning: "bg-warning-500 text-white hover:bg-warning-600 hover:shadow-md hover:scale-105",
        glow: "bg-primary text-primary-foreground hover:shadow-glow hover:scale-105 animate-pulse-glow",
        // Hero button for landing pages
        hero: "bg-gradient-primary text-white px-8 py-6 text-lg font-bold rounded-xl hover:shadow-glow hover:scale-105 active:scale-95 transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  animated?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, animated = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    if (animated) {
      return (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        />
      );
    }
    
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
