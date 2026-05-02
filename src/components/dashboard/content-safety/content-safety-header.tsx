"use client";

import { motion } from "framer-motion";
import { IconShieldCheck } from "@tabler/icons-react";

export function ContentSafetyHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-center space-y-3 pt-6 pb-2"
    >
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-primary/10 rounded-2xl ring-1 ring-primary/20">
          <IconShieldCheck className="w-8 h-8 text-primary" />
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
        Content Safety Check
      </h1>
      <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed">
        Check your content for clickbait risk, algorithm issues, and policy violations. Get safe, optimized rewrites.
      </p>
    </motion.div>
  );
}
