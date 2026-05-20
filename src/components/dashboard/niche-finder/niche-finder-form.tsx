"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconWand,
  IconLoader2,
  IconBrain,
  IconBolt,
  IconMovie,
  IconVideo,
  IconMessageCircle,
  IconChecklist,
  IconBookmark,
  IconCompass,
  IconChevronRight,
  IconArrowLeft,
} from "@tabler/icons-react";
import { generateNicheIdeas } from "@/actions/niche-finder";
import { cn } from "@/lib/utils";

interface NicheFinderFormProps {
  onGenerated: (result?: any) => void;
}

const SUGGESTED_TAGS = [
  "Minimalist Coding",
  "Mechanical Keyboards",
  "Vegan Meal Prep",
  "Productivity Apps",
  "Vintage Camera Reviews",
  "Budget Travel",
] as const;

const SKILL_LEVELS = [
  {
    value: "Beginner",
    label: "Beginner",
    description: "Simple setup, low-cost gear",
    icon: IconCompass,
  },
  {
    value: "Intermediate",
    label: "Intermediate",
    description: "Multi-cam, b-roll, graphics",
    icon: IconBolt,
  },
  {
    value: "Advanced",
    label: "Advanced",
    description: "Cinematic, VFX, scripted",
    icon: IconBrain,
  },
] as const;

const CONTENT_TYPES = [
  {
    value: "Shorts & Reels",
    label: "Shorts & Reels",
    description: "15–60s, vertical, hook-first",
    icon: IconMovie,
  },
  {
    value: "Video Tutorials",
    label: "Tutorials",
    description: "Structured, screen-based",
    icon: IconVideo,
  },
  {
    value: "Vlogs & Storytelling",
    label: "Vlogs",
    description: "Personal, day-in-the-life",
    icon: IconMessageCircle,
  },
  {
    value: "Reviews & deep-dives",
    label: "Reviews",
    description: "Comparisons, buyer guides",
    icon: IconChecklist,
  },
  {
    value: "Video Essays & Analysis",
    label: "Video Essays",
    description: "Research, documentary style",
    icon: IconBookmark,
  },
] as const;

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 40 : -40,
    opacity: 0,
  }),
};

export function NicheFinderForm({ onGenerated }: NicheFinderFormProps) {
  const [interest, setInterest] = useState("");
  const [skillLevel, setSkillLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [contentType, setContentType] = useState("Shorts & Reels");

  const [[step, direction], setStep] = useState([1, 0]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleNext = () => {
    if (step === 1 && !interest.trim()) {
      toast.error("Please share your interests first.");
      return;
    }
    if (step === 1 && interest.trim().length < 3) {
      toast.error("Interest must be at least 3 characters.");
      return;
    }
    if (step < 4) {
      setStep([step + 1, 1]);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep([step - 1, -1]);
    }
  };

  const handleTagClick = (tag: string) => {
    setInterest(tag);
    setTimeout(() => {
      setStep([2, 1]);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && step === 1) {
      e.preventDefault();
      handleNext();
    }
  };

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateNicheIdeas({
        interest: interest.trim(),
        skillLevel,
        contentType,
      });

      if (result.success && result.generationId) {
        toast.success("Niches discovered!");
        onGenerated({
          id: result.generationId,
          input: { interest: interest.trim(), skillLevel, contentType },
          output: result.data,
          createdAt: new Date(),
          isFavorite: false,
        });
      } else {
        toast.error(result.error || "Failed to discover niches. Try again.");
      }
    });
  };

  const STEP_TITLES = ["Your Interest", "Skill Level", "Content Format", "Confirm"];

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden rounded-2xl">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-border/40">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-primary font-outfit mb-0.5">
              Step {step} of 4
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-foreground font-outfit">
              {STEP_TITLES[step - 1]}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  s === step
                    ? "w-6 bg-primary"
                    : s < step
                    ? "w-2 bg-primary/40"
                    : "w-2 bg-muted-foreground/15"
                )}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="relative overflow-hidden">
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="px-4 sm:px-6 py-4 sm:py-6"
            >
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-4">
                  <Textarea
                    id="interests"
                    placeholder="e.g., retro mechanical keyboards, vegan meal prep, iOS productivity..."
                    value={interest}
                    onChange={(e) => setInterest(e.target.value.slice(0, 500))}
                    disabled={isPending}
                    onKeyDown={handleKeyDown}
                    className="min-h-[100px] resize-none text-sm rounded-xl border-border/50 bg-background/30 focus-visible:ring-primary/30 leading-relaxed disabled:opacity-50 transition-all placeholder:text-muted-foreground/40"
                  />

                  <div>
                    <p className="text-xs text-muted-foreground mb-2.5 font-medium">
                      Quick picks:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagClick(tag)}
                          className="px-3 py-1 rounded-full text-xs font-medium border border-border/50 bg-muted/20 hover:border-primary/60 hover:bg-primary/5 hover:text-primary transition-all"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-3">
                  {SKILL_LEVELS.map((level) => {
                    const Icon = level.icon;
                    const isActive = skillLevel === level.value;
                    return (
                      <button
                        type="button"
                        key={level.value}
                        onClick={() => setSkillLevel(level.value)}
                        className={cn(
                          // On mobile: horizontal row layout. On sm+: vertical card layout
                          "text-left p-3 sm:p-4 rounded-xl border transition-all duration-200 group",
                          "flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-3",
                          isActive
                            ? "border-primary bg-primary/5"
                            : "border-border/50 bg-background/20 hover:border-border hover:bg-muted/20"
                        )}
                      >
                        {/* Icon */}
                        <div
                          className={cn(
                            "p-1.5 rounded-lg transition-colors shrink-0",
                            isActive
                              ? "bg-primary/20 text-primary"
                              : "bg-muted/60 text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        {/* Text — grows to fill row on mobile */}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-semibold font-outfit",
                            isActive ? "text-foreground" : "text-foreground/80"
                          )}>
                            {level.label}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                            {level.description}
                          </p>
                        </div>
                        {/* Radio — pushed to far right on mobile row */}
                        <div
                          className={cn(
                            "h-3.5 w-3.5 rounded-full border-2 transition-all duration-200 shrink-0",
                            isActive
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/30"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
                  {CONTENT_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isActive = contentType === type.value;
                    return (
                      <button
                        type="button"
                        key={type.value}
                        onClick={() => setContentType(type.value)}
                        className={cn(
                          "text-left p-3 sm:p-4 rounded-xl border transition-all duration-200 group flex flex-col gap-2.5",
                          isActive
                            ? "border-primary bg-primary/5"
                            : "border-border/50 bg-background/20 hover:border-border hover:bg-muted/20"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={cn(
                              "p-1.5 rounded-lg transition-colors",
                              isActive
                                ? "bg-primary/20 text-primary"
                                : "bg-muted/60 text-muted-foreground group-hover:text-foreground"
                            )}
                          >
                            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </div>
                          <div
                            className={cn(
                              "h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border-2 transition-all duration-200",
                              isActive
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/30"
                            )}
                          />
                        </div>
                        <div>
                          <p className={cn(
                            "text-xs sm:text-sm font-semibold font-outfit leading-tight",
                            isActive ? "text-foreground" : "text-foreground/80"
                          )}>
                            {type.label}
                          </p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 leading-snug">
                            {type.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Review your selections before generating your niche report.
                  </p>
                  <div className="rounded-xl border border-border/50 bg-background/30 divide-y divide-border/40 overflow-hidden">
                    <div className="px-4 py-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Interest</p>
                      <p className="text-sm font-semibold text-foreground font-outfit">"{interest}"</p>
                    </div>
                    <div className="px-4 py-3 flex items-center gap-6">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Level</p>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {skillLevel}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Format</p>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted/50 text-foreground border border-border/50">
                          {contentType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
          <div>
            {step > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={isPending}
                className="text-muted-foreground hover:text-foreground h-9 px-3 gap-1.5"
              >
                <IconArrowLeft className="w-3.5 h-3.5" />
                Back
              </Button>
            )}
          </div>

          <div>
            {step < 4 ? (
              <Button
                size="sm"
                onClick={handleNext}
                disabled={step === 1 && !interest.trim()}
                className="h-9 px-5 gap-2 font-medium"
              >
                Continue
                <IconChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={isPending}
                className="h-9 px-5 gap-2 font-medium shadow-sm"
              >
                {isPending ? (
                  <>
                    <IconLoader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <IconWand className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
