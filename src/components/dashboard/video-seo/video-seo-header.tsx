"use client";

import { motion } from "framer-motion";

export function VideoSeoHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="text-center space-y-3 pt-6 pb-2"
    >
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
        Optimize Your Videos
      </h1>
      <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed">
        Generate titles, descriptions, tags, and more.
      </p>
    </motion.div>
  );
}
