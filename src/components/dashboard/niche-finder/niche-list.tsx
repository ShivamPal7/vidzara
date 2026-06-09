"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { IconTrash, IconStar, IconStarFilled, IconChevronRight, IconCompass } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { NicheGeneration, NicheFinderInput } from "./types";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface NicheListProps {
  generations: NicheGeneration[];
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NicheList({ generations, onToggleFavorite, onDelete }: NicheListProps) {
  const router = useRouter();

  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-2xl bg-card/40 border-dashed border-border/60">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <IconCompass className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground">No niches analyzed yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Enter your interests, select your skill and preferred format above to discover your ideal micro-niches.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {generations.map((gen) => {
          const input = gen.input as any;
          const interestText = (() => {
            if (!input) return "Niche Report";
            if (input.interest) return input.interest;
            if (input.category === "Other") {
              return input.customInterest || "Custom Interest";
            }
            let text = input.category || "Niche Report";
            if (input.subCategory) text += ` - ${input.subCategory}`;
            if (input.subSubCategory) text += ` - ${input.subSubCategory}`;
            return text;
          })();

          return (
            <motion.div
              key={gen.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className="overflow-hidden border-border/50 bg-card/40 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group py-2"
                onClick={() => router.push(`/dashboard/analyze/niche-finder/${gen.id}`)}
              >
                <CardHeader className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div className="space-y-2 w-full sm:w-auto overflow-hidden">
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2 group-hover:text-primary transition-colors truncate max-w-md sm:max-w-xl">
                        {interestText}
                      </CardTitle>
                      {input?.skillLevel && (
                        <Badge variant="outline" className="text-[10px] font-semibold border-primary/20 text-primary bg-primary/5">
                          {input.skillLevel}
                        </Badge>
                      )}
                      {input?.contentType && (
                        <Badge variant="outline" className="text-[10px] font-semibold border-border/60 bg-muted/30">
                          {input.contentType}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Discovered {formatDistanceToNow(new Date(gen.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                    {onToggleFavorite && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(gen.id);
                        }}
                      >
                        {gen.isFavorite ? (
                          <IconStarFilled className="h-4 w-4 text-amber-500" />
                        ) : (
                          <IconStar className="h-4 w-4 text-muted-foreground hover:text-amber-500 transition-colors" />
                        )}
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(gen.id);
                        }}
                      >
                        <IconTrash className="h-4 w-4" />
                      </Button>
                    )}
                    <IconChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
