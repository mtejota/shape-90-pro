import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

type Variant = "up" | "down" | "left" | "right" | "zoom" | "blur" | "fade";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: Variant;
  duration?: number;
}

const variants: Record<Variant, { initial: any; whileInView: any }> = {
  up:    { initial: { opacity: 0, y: 60 },    whileInView: { opacity: 1, y: 0 } },
  down:  { initial: { opacity: 0, y: -60 },   whileInView: { opacity: 1, y: 0 } },
  left:  { initial: { opacity: 0, x: -60 },   whileInView: { opacity: 1, x: 0 } },
  right: { initial: { opacity: 0, x: 60 },    whileInView: { opacity: 1, x: 0 } },
  zoom:  { initial: { opacity: 0, scale: 0.85 }, whileInView: { opacity: 1, scale: 1 } },
  blur:  { initial: { opacity: 0, filter: "blur(12px)" }, whileInView: { opacity: 1, filter: "blur(0px)" } },
  fade:  { initial: { opacity: 0 }, whileInView: { opacity: 1 } },
};

const AnimatedSection = ({
  children,
  className,
  delay = 0,
  variant = "up",
  duration = 0.7,
}: AnimatedSectionProps) => {
  const v = variants[variant];
  return (
    <motion.div
      className={className}
      initial={v.initial}
      whileInView={v.whileInView}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({
  children,
  delay = 0,
  variant = "left",
}: { children: ReactNode; delay?: number; variant?: Variant }) => {
  const v = variants[variant];
  return (
    <motion.div
      initial={v.initial}
      whileInView={v.whileInView}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

/** Subtle parallax wrapper — moves content as it scrolls into view */
export const ParallaxBlock = ({
  children,
  offset = 60,
  className,
}: { children: ReactNode; offset?: number; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
};

/** Scroll progress bar fixed at the top of the page */
export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    restDelta: 0.001,
  });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/60 origin-left z-[60]"
    />
  );
};

export default AnimatedSection;
