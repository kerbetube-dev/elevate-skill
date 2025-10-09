/**
 * Animation Library - Framer Motion Variants
 * Reusable animation configurations for consistent motion design
 */

import { Variants } from "framer-motion";

// ============================================================================
// FADE ANIMATIONS
// ============================================================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// ============================================================================
// SCALE ANIMATIONS
// ============================================================================

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export const scaleUp: Variants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

export const scalePulse: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

// ============================================================================
// SLIDE ANIMATIONS
// ============================================================================

export const slideInUp: Variants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export const slideInDown: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export const slideInLeft: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export const slideInRight: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

// ============================================================================
// STAGGER ANIMATIONS
// ============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// ============================================================================
// HOVER ANIMATIONS
// ============================================================================

export const hoverScale = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
  tap: {
    scale: 0.95,
  },
};

export const hoverLift = {
  rest: { y: 0 },
  hover: {
    y: -8,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export const hoverGlow = {
  rest: {
    boxShadow: "0 0 0 rgba(102, 126, 234, 0)",
  },
  hover: {
    boxShadow: "0 0 20px rgba(102, 126, 234, 0.4)",
    transition: {
      duration: 0.3,
      ease: "easeInOut",
    },
  },
};

// ============================================================================
// ROTATION ANIMATIONS
// ============================================================================

export const rotate360: Variants = {
  initial: { rotate: 0 },
  animate: {
    rotate: 360,
    transition: {
      duration: 2,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

export const rotateIn: Variants = {
  hidden: { opacity: 0, rotate: -180 },
  visible: {
    opacity: 1,
    rotate: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// ============================================================================
// FLIP ANIMATIONS
// ============================================================================

export const flipIn: Variants = {
  hidden: { opacity: 0, rotateY: -180 },
  visible: {
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// ============================================================================
// BOUNCE ANIMATIONS
// ============================================================================

export const bounceIn: Variants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 10,
    },
  },
};

export const float: Variants = {
  initial: { y: 0 },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

export const pageTransition: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

export const pageSlideTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

// ============================================================================
// MODAL / DIALOG ANIMATIONS
// ============================================================================

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      delay: 0.1,
    },
  },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

// ============================================================================
// DRAWER / SIDEBAR ANIMATIONS
// ============================================================================

export const drawerSlideIn: Variants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: "-100%",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
};

// ============================================================================
// NOTIFICATION / TOAST ANIMATIONS
// ============================================================================

export const toastSlideIn: Variants = {
  hidden: { x: 400, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    x: 400,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

// ============================================================================
// CARD ANIMATIONS
// ============================================================================

export const cardHover = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  hover: {
    scale: 1.02,
    y: -4,
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)",
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export const cardTilt = {
  rest: { rotateX: 0, rotateY: 0 },
  hover: {
    rotateX: 5,
    rotateY: 5,
    transition: {
      duration: 0.3,
    },
  },
};

// ============================================================================
// SHIMMER / LOADING ANIMATIONS
// ============================================================================

export const shimmer: Variants = {
  animate: {
    backgroundPosition: ["200% 0", "-200% 0"],
    transition: {
      duration: 2,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

// ============================================================================
// CONFETTI / SUCCESS ANIMATIONS
// ============================================================================

export const successPop: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 12,
    },
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a custom stagger container with configurable delays
 */
export const createStaggerContainer = (
  staggerDelay: number = 0.1,
  childrenDelay: number = 0.1
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: childrenDelay,
    },
  },
});

/**
 * Create a custom fade-in animation with configurable duration
 */
export const createFadeIn = (duration: number = 0.3, delay: number = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration,
      delay,
      ease: "easeOut",
    },
  },
});

/**
 * Create a custom slide-in animation
 */
export const createSlideIn = (
  direction: "up" | "down" | "left" | "right" = "up",
  distance: number = 20
): Variants => {
  const getInitialPosition = () => {
    switch (direction) {
      case "up":
        return { y: distance };
      case "down":
        return { y: -distance };
      case "left":
        return { x: -distance };
      case "right":
        return { x: distance };
    }
  };

  return {
    hidden: { opacity: 0, ...getInitialPosition() },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut",
      },
    },
  };
};

// ============================================================================
// EXPORT COMMON TRANSITION CONFIGS
// ============================================================================

export const transitions = {
  smooth: { duration: 0.3, ease: "easeOut" },
  fast: { duration: 0.15, ease: "easeOut" },
  slow: { duration: 0.6, ease: "easeOut" },
  spring: { type: "spring", stiffness: 300, damping: 25 },
  bouncy: { type: "spring", stiffness: 500, damping: 10 },
};

export const easings = {
  easeInOut: [0.4, 0, 0.2, 1],
  easeOut: [0, 0, 0.2, 1],
  easeIn: [0.4, 0, 1, 1],
  sharp: [0.4, 0, 0.6, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
};

