"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  IconMapPin,
  IconCategory,
  IconTag,
  IconTarget,
} from "@tabler/icons-react";
import { generateNicheIdeas, getSubCategories, getSubSubCategories } from "@/actions/niche-finder";
import { cn } from "@/lib/utils";
import { useCredits } from "@/components/dashboard/credits-provider";
import { getCreditCost } from "@/lib/credits";
import { Feature } from "../../../../prisma/generated/prisma/enums";

interface NicheFinderFormProps {
  onGenerated: (result?: any) => void;
}

const SUGGESTED_COUNTRIES = [
  { code: "India", name: "India", flag: "🇮🇳" },
  { code: "USA", name: "USA", flag: "🇺🇸" },
  { code: "UK", name: "UK", flag: "🇬🇧" },
  { code: "Canada", name: "Canada", flag: "🇨🇦" },
  { code: "Australia", name: "Australia", flag: "🇦🇺" },
  { code: "Germany", name: "Germany", flag: "🇩🇪" },
  { code: "Global", name: "Global", flag: "🌐" },
];

const SUGGESTED_CATEGORIES = [
  "AI",
  "Gaming",
  "Education",
  "Finance",
  "Motivation",
  "Cartoon Story",
  "Tech & Gadgets",
  "Travel & Vlogs",
  "Food & Cooking",
  "Fitness & Health",
  "Fashion & Beauty",
  "Lifestyle",
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
  const { credits, openCreditGate, deductCreditsLocal } = useCredits();
  // Wizard States
  const [country, setCountry] = useState("India");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [subSubCategory, setSubSubCategory] = useState("");
  const [customInterest, setCustomInterest] = useState("");
  const [skillLevel, setSkillLevel] = useState<"Beginner" | "Intermediate" | "Advanced">("Beginner");
  const [contentType, setContentType] = useState("Shorts & Reels");

  // Dynamic Suggestion Lists
  const [subCategoriesList, setSubCategoriesList] = useState<string[]>([]);
  const [subSubCategoriesList, setSubSubCategoriesList] = useState<string[]>([]);
  
  // Loaders
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [loadingSubSubCategories, setLoadingSubSubCategories] = useState(false);

  const [[step, direction], setStep] = useState([1, 0]);
  const [isPending, startTransition] = useTransition();

  const fetchSubCategories = async (cat: string) => {
    setLoadingSubCategories(true);
    setSubCategoriesList([]);
    setSubCategory("");
    setSubSubCategory("");
    try {
      const res = await getSubCategories(cat, country);
      if (res.success && res.data) {
        setSubCategoriesList(res.data);
      } else {
        toast.error("Failed to load sub-categories.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong loading sub-categories.");
    } finally {
      setLoadingSubCategories(false);
    }
  };

  const fetchSubSubCategories = async (cat: string, sub: string) => {
    setLoadingSubSubCategories(true);
    setSubSubCategoriesList([]);
    setSubSubCategory("");
    try {
      const res = await getSubSubCategories(cat, sub, country);
      if (res.success && res.data) {
        setSubSubCategoriesList(res.data);
      } else {
        toast.error("Failed to load topics.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong loading topics.");
    } finally {
      setLoadingSubSubCategories(false);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep([2, 1]);
    } else if (step === 2) {
      if (!category.trim()) {
        toast.error("Please enter or select a category.");
        return;
      }
      setStep([3, 1]);
      await fetchSubCategories(category.trim());
    } else if (step === 3) {
      if (!subCategory.trim()) {
        toast.error("Please select or enter a sub-category.");
        return;
      }
      setStep([4, 1]);
    } else if (step === 4) {
      setStep([5, 1]);
    } else if (step === 5) {
      setStep([6, 1]);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep([step - 1, -1]);
    }
  };

  const handleCountryClick = (cName: string) => {
    setCountry(cName);
    setTimeout(() => {
      setStep([2, 1]);
    }, 200);
  };

  const handleCategoryClick = async (cat: string) => {
    setCategory(cat);
    setStep([3, 1]);
    await fetchSubCategories(cat);
  };

  const handleSubCategoryClick = async (sub: string) => {
    setSubCategory(sub);
    setStep([4, 1]);
  };

  const handleSubSubCategoryClick = (subSub: string) => {
    setSubSubCategory(subSub);
    setStep([5, 1]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  const handleGenerate = () => {
    const cost = getCreditCost(Feature.NICHE_FINDER);

    if (credits !== null && credits < cost) {
      openCreditGate("Niche Finder", cost);
      return;
    }

    deductCreditsLocal(cost);

    startTransition(async () => {
      const payload = {
        country,
        category: category.trim(),
        subCategory: subCategory.trim() || undefined,
        subSubCategory: subSubCategory.trim() || undefined,
        customInterest: category === "Other" ? customInterest.trim() : undefined,
        skillLevel,
        contentType,
      };

      const result = await generateNicheIdeas(payload);

      if (result.success && result.generationId) {
        toast.success("Niches discovered!");
        onGenerated({
          id: result.generationId,
          input: payload,
          output: result.data,
          createdAt: new Date(),
          isFavorite: false,
        });
      } else {
        deductCreditsLocal(-cost);
        toast.error(result.error || "Failed to discover niches. Try again.");
      }
    });
  };

  const STEP_TITLES = [
    "Target Country",
    "General Category",
    "Sub-Category",
    "Skill Level",
    "Content Format",
    "Confirm Details",
  ];

  return (
    <Card className="border-border/50 bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden rounded-2xl">
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-border/40">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold text-primary font-outfit mb-0.5">
              Step {step} of 6
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-foreground font-outfit">
              {STEP_TITLES[step - 1]}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5, 6].map((s) => (
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
              {/* STEP 1: Country */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground font-medium">
                    Select the target market for your content:
                  </p>
                  <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                    {SUGGESTED_COUNTRIES.map((c) => {
                      const isActive = country === c.code;
                      return (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => handleCountryClick(c.code)}
                          className={cn(
                            "flex items-center gap-3 p-3.5 rounded-xl border text-sm font-semibold transition-all duration-200 font-outfit",
                            isActive
                              ? "border-primary bg-primary/5 text-primary"
                              : "border-border/50 bg-background/20 hover:border-border hover:bg-muted/20 text-foreground"
                          )}
                        >
                          <span className="text-lg shrink-0">{c.flag}</span>
                          <span className="truncate">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 2: General Category */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      Enter your category or pick a popular option:
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <IconCategory className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-muted-foreground/50" />
                        <Input
                          id="category-input"
                          placeholder="e.g. Mechanical Keyboards, Space Exploration, AI..."
                          value={category}
                          onChange={(e) => setCategory(e.target.value.slice(0, 100))}
                          disabled={isPending}
                          onKeyDown={handleKeyDown}
                          className="pl-10 text-sm rounded-xl border-border/50 bg-background/30 focus-visible:ring-primary/30 h-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2.5 font-medium">
                      Popular categories:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategoryClick(cat)}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-150 font-outfit",
                            category === cat
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border/50 bg-muted/20 hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Sub-Category */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground font-medium">
                      Select or type a sub-category:
                    </p>
                    <div className="relative">
                      <IconTag className="absolute left-3.5 top-2.5 h-4.5 w-4.5 text-muted-foreground/50" />
                      <Input
                        id="subcategory-input"
                        placeholder="e.g. AI Story Videos, PC Gaming, Personal Finance..."
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value.slice(0, 100))}
                        disabled={isPending}
                        onKeyDown={handleKeyDown}
                        className="pl-10 text-sm rounded-xl border-border/50 bg-background/30 focus-visible:ring-primary/30 h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2.5 font-medium">
                      Suggested sub-categories for <span className="text-primary font-semibold">"{category}"</span>:
                    </p>
                    {loadingSubCategories ? (
                      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div key={i} className="h-9 rounded-xl bg-muted/30 animate-pulse border border-border/20" />
                        ))}
                      </div>
                    ) : subCategoriesList.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {subCategoriesList.map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => handleSubCategoryClick(sub)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 font-outfit",
                              subCategory === sub
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border/50 bg-muted/20 hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
                            )}
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground/60 italic">Type a custom sub-category above to proceed.</p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: Skill Level */}
              {step === 4 && (
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
                          "relative text-left p-3 sm:p-4 rounded-xl border transition-all duration-200 group",
                          "flex flex-row sm:flex-col items-center sm:items-start gap-3 sm:gap-3",
                          isActive
                            ? "border-primary bg-primary/5"
                            : "border-border/50 bg-background/20 hover:border-border hover:bg-muted/20"
                        )}
                      >
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
                        <div
                          className={cn(
                            "h-3.5 w-3.5 rounded-full border-2 transition-all duration-200 shrink-0",
                            "sm:absolute sm:right-4 sm:top-4",
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

              {/* STEP 5: Content Format */}
              {step === 5 && (
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

              {/* STEP 6: Confirm Details */}
              {step === 6 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Review your selections before generating your niche report:
                  </p>
                  <div className="rounded-xl border border-border/50 bg-background/30 divide-y divide-border/40 overflow-hidden font-outfit">
                    <div className="px-4 py-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Target Country</span>
                      <span className="text-sm font-semibold text-foreground">{country}</span>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Category</span>
                      <span className="text-sm font-semibold text-foreground">"{category}"</span>
                    </div>
                    {subCategory && (
                      <div className="px-4 py-3 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Sub-Category</span>
                        <span className="text-sm font-semibold text-foreground">"{subCategory}"</span>
                      </div>
                    )}
                    <div className="px-4 py-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Skill Level</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        {skillLevel}
                      </span>
                    </div>
                    <div className="px-4 py-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Format</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted/50 text-foreground border border-border/50">
                        {contentType}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between px-4 sm:px-6 pb-4 sm:pb-6 pt-2 border-t border-border/30 mt-2">
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
            {step < 6 ? (
              <Button
                size="sm"
                onClick={handleNext}
                disabled={
                  (step === 2 && !category.trim()) ||
                  (step === 3 && !subCategory.trim())
                }
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
                    Discovering Niches...
                  </>
                ) : (
                  <>
                    <IconWand className="w-4 h-4" />
                    Discover Niches
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
