"use client";

import { useState, useTransition } from "react";
import { Sparkles, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { refineSection } from "@/actions/video-seo";

// ── Tone/Translate sub-options ──────────────────────────────────────────
const TONE_OPTIONS = ["Professional", "Casual", "Witty", "Interesting", "Educational"];
const TRANSLATE_OPTIONS = ["Spanish", "French", "German", "Hindi", "Japanese", "Korean", "Portuguese", "Chinese"];

// ── Menu items ──────────────────────────────────────────────────────────
const REFINE_ITEMS = [
  { label: "Make Shorter", type: "action" as const },
  { label: "Make Longer", type: "action" as const },
  { label: "Add Excitement", type: "action" as const },
  { label: "Change Tone", type: "submenu" as const, options: TONE_OPTIONS },
  { label: "Translate", type: "submenu" as const, options: TRANSLATE_OPTIONS },
  { label: "Custom Instruction", type: "modal" as const },
];

// ── Props ───────────────────────────────────────────────────────────────
interface RefinePopoverProps {
  generationId: string;
  section: "title" | "description";
  content: string;
  onRefined?: (newContent: string) => void;
  className?: string;
}

export function RefinePopover({
  generationId,
  section,
  content,
  onRefined,
  className,
}: RefinePopoverProps) {
  const [open, setOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [customInstruction, setCustomInstruction] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleRefine = (action: string, value?: string) => {
    setOpen(false);
    setActiveSubmenu(null);

    startTransition(async () => {
      const result = await refineSection({
        generationId,
        section,
        content,
        action,
        value,
      });

      if (result.success && result.data) {
        onRefined?.(result.data);
      }
    });
  };

  const handleCustomSubmit = () => {
    if (customInstruction.trim()) {
      handleRefine("Custom Instruction", customInstruction);
      setCustomInstruction("");
    }
    setModalOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setActiveSubmenu(null); }}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            className={cn("text-muted-foreground hover:text-foreground gap-1.5 text-xs", className)}
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Sparkles className="size-3.5" />
            )}
            {isPending ? "Refining..." : "Refine"}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={6}
          className="w-52 p-1.5 rounded-xl"
        >
          {/* Main menu or submenu */}
          {activeSubmenu === null ? (
            <div className="flex flex-col">
              {REFINE_ITEMS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    if (item.type === "action") handleRefine(item.label);
                    else if (item.type === "submenu") setActiveSubmenu(item.label);
                    else if (item.type === "modal") {
                      setOpen(false);
                      setModalOpen(true);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm",
                    "text-foreground/90 hover:bg-secondary/80 transition-colors duration-150",
                    "cursor-pointer select-none"
                  )}
                >
                  <span>{item.label}</span>
                  {item.type === "submenu" && (
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Back header */}
              <button
                type="button"
                onClick={() => setActiveSubmenu(null)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                <ChevronRight className="size-3 rotate-180" />
                <span>{activeSubmenu}</span>
              </button>
              <div className="h-px bg-border/40 my-1" />
              {REFINE_ITEMS.find((i) =>   i.label === activeSubmenu)?.options?.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleRefine(activeSubmenu, opt)}
                  className={cn(
                    "flex items-center w-full px-3 py-2 rounded-lg text-sm",
                    "text-foreground/90 hover:bg-secondary/80 transition-colors duration-150",
                    "cursor-pointer select-none"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Custom Instruction Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl glass-2 p-6 gap-5">
          <DialogTitle className="text-center text-base font-semibold">
            Custom Instruction
          </DialogTitle>

          <textarea
            value={customInstruction}
            onChange={(e) => setCustomInstruction(e.target.value)}
            rows={5}
            placeholder="Enter your refinement instructions"
            className={cn(
              "w-full rounded-xl bg-secondary/60 border border-primary/40 px-4 py-3",
              "text-sm text-foreground/90 leading-relaxed resize-none",
              "outline-none focus:border-primary focus:ring-primary/30 focus:ring-[3px]",
              "transition-all duration-200 placeholder:text-muted-foreground"
            )}
          />

          <Button
            onClick={handleCustomSubmit}
            className="w-full gap-1.5"
            size="lg"
          >
            <Sparkles className="size-4" />
            Refine
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
