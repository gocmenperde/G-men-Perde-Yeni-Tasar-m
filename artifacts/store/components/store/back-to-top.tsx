"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible]   = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(scrolled > 400);
      setProgress(total > 0 ? Math.min(scrolled / total, 1) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const RADIUS = 18;
  const CIRC   = 2 * Math.PI * RADIUS;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 12 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed safe-bottom-offset left-4 z-50 w-12 h-12 md:bottom-8 md:left-8 flex items-center justify-center"
          aria-label="Yukarı çık"
        >
          {/* Progress ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 44 44"
          >
            {/* Track */}
            <circle
              cx="22" cy="22" r={RADIUS}
              stroke="#27272a" strokeWidth="2.5" fill="none"
            />
            {/* Progress */}
            <circle
              cx="22" cy="22" r={RADIUS}
              stroke="#f59e0b" strokeWidth="2.5" fill="none"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.1s linear" }}
            />
          </svg>

          {/* Center button */}
          <div className="relative z-10 w-8 h-8 rounded-full bg-zinc-900 hover:bg-amber-500 transition-colors duration-300 flex items-center justify-center shadow-lg">
            <ArrowUp className="w-3.5 h-3.5 text-white" />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
