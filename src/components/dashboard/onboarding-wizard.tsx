"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { completeOnboarding, type OnboardingData } from "@/actions/onboarding";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, ArrowRight, Check, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";

const NICHES = [
  "Gaming",
  "Technology & AI",
  "Lifestyle & Vlogs",
  "Education & Tutorials",
  "Finance & Business",
  "Health & Fitness",
  "Entertainment & Comedy",
  "Other",
];

export function OnboardingWizard({ initialName = "" }: { initialName?: string }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    displayName: initialName,
    niche: "",
    youtubeChannelId: "",
  });

  // Since useSession might be client-side only for better-auth, we might need to rely on hydration or initial props.
  // Assuming session is handled or we rely on user input for name if session not ready (though middleware protects this route).
  // For now, let's assume we collect Display Name.
  
  const handleNext = async () => {
    if (step === 3) {
      await handleSubmit();
    } else {
      setStep((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Validate minimal requirements
      if (!formData.displayName) {
        toast.error("Please enter a display name");
        setLoading(false);
        return;
      }
      if (!formData.niche) {
        toast.error("Please select a niche");
        setLoading(false);
        return;
      }

      await completeOnboarding(formData as OnboardingData);
      toast.success("Welcome to Vidzara!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const updateField = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress Bar */}
      <div className="mb-8 flex justify-between items-center px-2 relative">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center relative z-10">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                step >= i
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background border-border text-muted-foreground"
              )}
            >
              {step > i ? <Check className="w-5 h-5" /> : i}
            </div>
            <span
              className={cn(
                "text-xs mt-2 font-medium transition-colors duration-300",
                step >= i ? "text-primary" : "text-muted-foreground"
              )}
            >
              {i === 1 ? "Profile" : i === 2 ? "Niche" : "Connect"}
            </span>
          </div>
        ))}
        {/* Track */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-border z-0" />
        {/* Simple line for now, positioning is tricky with flex-between without exact container width */}
      </div>

      <div className="glass-1 p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="space-y-6 relative z-10"
          >
            {step === 1 && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Tell us about you</h2>
                  <p className="text-muted-foreground">
                    Let&apos;s set up your creator profile.
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      placeholder="e.g. Creator John"
                      value={formData.displayName || ""}
                      onChange={(e) => updateField("displayName", e.target.value)}
                      className="bg-background/50 h-12"
                      autoFocus
                    />
                  </div>
                  
                  {/* Avatar upload could go here, skipping for MVP simplicity */}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">What&apos;s your niche?</h2>
                  <p className="text-muted-foreground">
                    We&apos;ll tailor AI suggestions to your content.
                  </p>
                </div>

                <div className="pt-4">
                  <Label className="mb-2 block">Content Category</Label>
                  <Select
                    value={formData.niche}
                    onValueChange={(val) => updateField("niche", val)}
                  >
                    <SelectTrigger className="h-12 bg-background/50 w-full">
                      <SelectValue placeholder="Select a niche" />
                    </SelectTrigger>
                    <SelectContent>
                      {NICHES.map((niche) => (
                        <SelectItem key={niche} value={niche}>
                          {niche}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Connect YouTube</h2>
                  <p className="text-muted-foreground">
                    Optional. Helps us analyze your channel growth.
                  </p>
                </div>

                <div className="pt-4 space-y-4">
                   <div className="p-4 border border-dashed border-border rounded-lg bg-background/30 flex flex-col items-center justify-center text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                        <Youtube className="w-6 h-6" />
                      </div>
                      <p className="text-sm text-muted-foreground">Paste your channel URL below</p>
                   </div>

                  <div className="space-y-2">
                    <Label htmlFor="youtube">Channel URL (Optional)</Label>
                    <Input
                      id="youtube"
                      placeholder="https://youtube.com/@yourchannel"
                      value={formData.youtubeChannelId || ""}
                      onChange={(e) => updateField("youtubeChannelId", e.target.value)}
                      className="bg-background/50 h-12"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
           {step > 1 ? (
             <Button
               variant="ghost"
               onClick={() => setStep((prev) => prev - 1)}
               disabled={loading}
             >
               Back
             </Button>
           ) : (
             <div /> // Spacer
           )}

           <Button
             onClick={handleNext}
             disabled={loading || (step === 1 && !formData.displayName) || (step === 2 && !formData.niche)}
             className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[120px]"
           >
             {loading ? (
               <Loader2 className="w-4 h-4 animate-spin mr-2" />
             ) : step === 3 ? (
               "Finish Setup"
             ) : (
               <>
                 Next <ArrowRight className="w-4 h-4 ml-2" />
               </>
             )}
           </Button>
        </div>
      </div>
    </div>
  );
}
