"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompetitorSelector } from "@/components/dashboard/competitors/competitor-selector";
import { generateTopicIdeas } from "@/actions/topic-generator";
import { toast } from "sonner";
import { IconWand, IconLoader2 } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

import { useCredits } from "@/components/dashboard/credits-provider";
import { getCreditCost } from "@/lib/credits";
import { Feature } from "../../../../prisma/generated/prisma/enums";

interface TopicGeneratorSearchBarProps {
  onGenerated: () => void;
}

export function TopicGeneratorSearchBar({ onGenerated }: TopicGeneratorSearchBarProps) {
  const { credits, openCreditGate, deductCreditsLocal } = useCredits();
  const [selectedCompetitorIds, setSelectedCompetitorIds] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const router = useRouter();

  const hasCompetitors = selectedCompetitorIds.length > 0;
  const hasPrompt = prompt.trim().length > 0;
  const canGenerate = hasCompetitors || hasPrompt;

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("Please select a competitor or enter a topic prompt.");
      return;
    }

    const channelsCount = hasCompetitors ? selectedCompetitorIds.length : 1;
    const cost = getCreditCost(Feature.TOPIC_GENERATOR, { channelsCount });

    if (credits !== null && credits < cost) {
      openCreditGate("Topic Generator", cost);
      return;
    }

    setGenerating(true);
    deductCreditsLocal(cost);

    const result = await generateTopicIdeas({
      competitorIds: hasCompetitors ? selectedCompetitorIds : undefined,
      prompt: hasPrompt ? prompt.trim() : undefined,
    });

    if (result.success && result.data?.id) {
      toast.success("Topics generated successfully!");
      onGenerated();
      router.push(`/dashboard/analyze/topic-generator/${result.data.id}`);
    } else {
      deductCreditsLocal(-cost);
      toast.error(result.error || "Failed to generate topics.");
      setGenerating(false);
    }
  };

  return (
    <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col gap-5">

          {/* Competitor Selector */}
          <CompetitorSelector
            selectedIds={selectedCompetitorIds}
            onChange={setSelectedCompetitorIds}
          />

          {/* Bottom row: prompt input + generate button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3 border-t border-border/50">
            <input
              placeholder="Describe your video idea..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={generating}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGenerate();
              }}
              className="flex-1 min-w-0 rounded-full border border-input bg-transparent px-4 text-base sm:text-sm text-foreground placeholder:text-muted-foreground transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ height: "44px", minHeight: "44px", boxSizing: "border-box" }}
            />
            <Button
              size="lg"
              className="w-full sm:w-auto sm:shrink-0 font-medium"
              style={{ height: "44px" }}
              onClick={handleGenerate}
              disabled={generating || !canGenerate}
            >
              {generating ? (
                <>
                  <IconLoader2 className="w-4 h-4 animate-spin" />
                  <span className="ml-2">Generating...</span>
                </>
              ) : (
                <>
                  <IconWand className="w-4 h-4" />
                  <span className="ml-2">
                    {hasCompetitors && hasPrompt
                      ? "Analyze Topics"
                      : hasCompetitors
                      ? "Analyze Topics"
                      : "Generate Topics"}
                  </span>
                </>
              )}
            </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
