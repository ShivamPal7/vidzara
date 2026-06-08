"use client";

import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { IconTrash, IconStar, IconStarFilled, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TopicGeneration, TopicGeneratorInput } from "./types";
import { useRouter } from "next/navigation";

interface TopicListProps {
  generations: TopicGeneration[];
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TopicList({ generations, onToggleFavorite, onDelete }: TopicListProps) {
  const router = useRouter();

  if (generations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-background/50 border-dashed">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <IconStar className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No topics generated yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Select a competitor and click analyze to discover their top performing content and get viral ideas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="popLayout">
        {generations.map((gen) => {
          const input = gen.input as TopicGeneratorInput;

          // Prefer competitor channel names, fall back to prompt snippet, then generic label
          let displayName =
            input?.channelNames ||
            input?.channelName ||
            (input?.prompt
              ? input.prompt.length > 60
                ? input.prompt.slice(0, 60).trimEnd() + "…"
                : input.prompt
              : "Unknown Generation");
          if ((input?.channelNames || input?.channelName) && displayName.length > 50) {
            displayName = "Multiple Channels Analysis";
          }

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
                className="overflow-hidden border-border/50 bg-background/50 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group py-2"
                onClick={() => router.push(`/dashboard/analyze/topic-generator/${gen.id}`)}
              >
                <CardHeader className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div className="space-y-1 w-full sm:w-auto overflow-hidden">
                    <CardTitle className="text-lg flex items-center gap-2 group-hover:text-primary transition-colors truncate">
                      {displayName}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground flex flex-wrap gap-1">
                      <span>Generated {formatDistanceToNow(new Date(gen.createdAt), { addSuffix: true })}</span>
                      {input?.recentVideos && input.recentVideos.length > 0 && (
                        <span>• {input.recentVideos.length} videos analyzed</span>
                      )}
                      {input?.outliers && input.outliers.length > 0 && (
                        <span>• {input.outliers.length} outliers</span>
                      )}
                      {input?.prompt && !(input?.channelNames || input?.channelName) && (
                        <span>• Prompt-based</span>
                      )}
                      {input?.prompt && (input?.channelNames || input?.channelName) && (
                        <span>• Combined mode</span>
                      )}
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
