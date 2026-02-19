"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefinePopover } from "./refine-popover";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  showRefine?: boolean;
  onCopy?: () => void;
  className?: string;
}

export function SectionHeader({
  title,
  showRefine = false,
  onCopy,
  className,
}: SectionHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={cn("flex items-center justify-between", className)}>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <div className="flex items-center gap-1">
        {showRefine && <RefinePopover />}
        {onCopy && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <Check className="size-3.5 text-chart-1" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
