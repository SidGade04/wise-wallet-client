import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 0.98
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3
};

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Slide transition for different directions
export function SlideTransition({ 
  children, 
  direction = "right",
  className 
}: { 
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  className?: string;
}) {
  const slideVariants = {
    initial: (direction: string) => ({
      x: direction === "left" ? -300 : direction === "right" ? 300 : 0,
      y: direction === "up" ? -300 : direction === "down" ? 300 : 0,
      opacity: 0
    }),
    in: {
      x: 0,
      y: 0,
      opacity: 1
    },
    out: (direction: string) => ({
      x: direction === "left" ? 300 : direction === "right" ? -300 : 0,
      y: direction === "up" ? 300 : direction === "down" ? -300 : 0,
      opacity: 0
    })
  };

  return (
    <motion.div
      custom={direction}
      initial="initial"
      animate="in"
      exit="out"
      variants={slideVariants}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Fade transition
export function FadeTransition({ 
  children, 
  className,
  delay = 0
}: { 
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.3,
        delay
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animation
export function StaggerContainer({ 
  children, 
  className,
  staggerDelay = 0.1
}: { 
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ 
  children, 
  className 
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{
        duration: 0.3
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
