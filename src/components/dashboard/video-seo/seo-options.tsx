"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export interface SeoOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface SeoOptionsProps {
  open: boolean;
  onClose: () => void;
  options: SeoOption[];
  onToggle: (id: string) => void;
  className?: string;
}

export function SeoOptions({
  open,
  onClose,
  options,
  onToggle,
  className,
}: SeoOptionsProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "absolute left-0 top-full mt-3 z-50 w-full sm:w-80",
              "rounded-2xl border border-border/50 bg-card shadow-xl shadow-black/20 backdrop-blur-xl",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="size-[18px] text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">
                  Options
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex items-center justify-center size-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors duration-200"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Toggle rows */}
            <div className="px-4 pb-4 space-y-1.5">
              {options.map((opt) => (
                <div
                  key={opt.id}
                  className={cn(
                    "flex items-center justify-between gap-4 px-4 py-3.5 rounded-xl",
                    "border border-border/30 bg-secondary/30",
                    "transition-colors duration-200"
                  )}
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-foreground leading-none">
                      {opt.label}
                    </p>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {opt.description}
                    </p>
                  </div>
                  <Switch
                    checked={opt.enabled}
                    onCheckedChange={() => onToggle(opt.id)}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
