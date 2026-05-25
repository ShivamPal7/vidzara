"use client";

import { useState } from "react";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";

export function CopyCodeBadge({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(`Referral code "${code}" copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="group font-mono bg-zinc-950/60 hover:bg-zinc-900 text-zinc-300 hover:text-indigo-400 border border-zinc-800 hover:border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold select-none flex items-center gap-2 transition-all active:scale-95 duration-200 cursor-pointer shadow-inner"
      title="Click to copy referral code"
    >
      <span>{code}</span>
      {copied ? (
        <IconCheck className="w-3.5 h-3.5 text-emerald-400 animate-in fade-in zoom-in-75 duration-200" />
      ) : (
        <IconCopy className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-200" />
      )}
    </button>
  );
}
