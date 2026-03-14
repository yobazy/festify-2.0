"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RotatingWordsProps {
  words: string[];
  interval?: number;
}

export function RotatingWords({ words, interval = 3000 }: RotatingWordsProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  return (
    <div className="h-16 sm:h-20 lg:h-24 flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="font-brand-thin text-4xl sm:text-5xl lg:text-7xl text-primary uppercase tracking-widest"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
