import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export function RevealOnScroll({ children, className, delay = 0, y = 24 }: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      initial={{ opacity: 0, y }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
