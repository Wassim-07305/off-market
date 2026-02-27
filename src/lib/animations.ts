import type { Variants, Transition } from "framer-motion";

// ═══════════════════════════════════════════
// Fade variants
// ═══════════════════════════════════════════

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0 },
};

// ═══════════════════════════════════════════
// Scale variants
// ═══════════════════════════════════════════

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1 },
};

// ═══════════════════════════════════════════
// Slide variants
// ═══════════════════════════════════════════

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

// ═══════════════════════════════════════════
// Card hover
// ═══════════════════════════════════════════

export const cardHover: Variants = {
  rest: {
    scale: 1,
    y: 0,
    transition: { duration: 0.25, ease: "easeOut" },
  },
  hover: {
    scale: 1.01,
    y: -2,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

// ═══════════════════════════════════════════
// Page transition
// ═══════════════════════════════════════════

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.4, 0, 1],
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

// ═══════════════════════════════════════════
// Container stagger
// ═══════════════════════════════════════════

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      ease: [0.25, 0.4, 0, 1],
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.25, 0.4, 0, 1],
    },
  },
};

// ═══════════════════════════════════════════
// Transitions
// ═══════════════════════════════════════════

export const defaultTransition: Transition = {
  duration: 0.35,
  ease: [0.25, 0.4, 0, 1],
};

export const springTransition: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 25,
};

export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 20,
};
