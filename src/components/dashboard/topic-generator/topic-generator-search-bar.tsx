"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompetitorSelector } from "@/components/dashboard/competitors/competitor-selector";
import { generateTopicIdeas } from "@/actions/topic-generator";
import { toast } from "sonner";
import { IconWand, IconLoader2 } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

interface TopicGeneratorSearchBarProps {
  onGenerated: () => void;
}

export function TopicGeneratorSearchBar({ onGenerated }: TopicGeneratorSearchBarProps) {
  const [selectedCompetitorIds, setSelectedCompetitorIds] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);

  const router = useRouter();

  const handleGenerate = async () => {
    if (selectedCompetitorIds.length === 0) {
      toast.error("Please select at least one competitor.");
      return;
    }

    setGenerating(true);

    const result = await generateTopicIdeas({ competitorIds: selectedCompetitorIds });

    if (result.success && result.data?.id) {
      toast.success("Topics generated successfully!");
      onGenerated();
      router.push(`/dashboard/analyze/topic-generator/${result.data.id}`);
    } else {
      toast.error(result.error || "Failed to generate topics.");
      setGenerating(false);
    }
  };

  return (
    <Card className="border-border/50 bg-background/50 backdrop-blur-sm shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <CompetitorSelector 
            selectedIds={selectedCompetitorIds} 
            onChange={setSelectedCompetitorIds} 
          />
          
          <div className="flex justify-end pt-4 border-t border-border/50 mt-2">
            <Button 
              size="lg" 
              className="w-full sm:w-auto font-medium transition-all"
              onClick={handleGenerate}
              disabled={generating || selectedCompetitorIds.length === 0}
            >
              {generating ? (
                <>
                  <IconLoader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing & Generating...
                </>
              ) : (
                <>
                  <IconWand className="w-4 h-4 mr-2" />
                  Analyze Topics
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
