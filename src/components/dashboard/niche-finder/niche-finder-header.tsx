"use client";

import { motion } from "framer-motion";
import { IconCompass } from "@tabler/icons-react";

export function NicheFinderHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-3 pb-2"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-500/5 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-500/5">
          <IconCompass className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-outfit">
          Niche Finder
        </h1>
      </div>
      <p className="text-sm sm:text-base text-muted-foreground/80 max-w-3xl leading-relaxed pl-1 font-outfit">
        Discover highly targeted, profitable, and low-competition micro-niches tailored to your personal skills, interests, and creative style.
      </p>
    </motion.div>
  );
}

