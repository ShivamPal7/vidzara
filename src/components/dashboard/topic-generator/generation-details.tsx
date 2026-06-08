"use client";

import {
  TopicGeneration,
  TopicGeneratorInput,
  TopicGeneratorOutput,
} from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconArrowLeft, IconBulb, IconMessageCircle, IconUsers, IconSparkles } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface GenerationDetailsProps {
  generation: TopicGeneration;
}

export function GenerationDetails({ generation }: GenerationDetailsProps) {
  const router = useRouter();
  const input = generation.input as TopicGeneratorInput;
  const output = generation.output as TopicGeneratorOutput;

  const hasCompetitors = !!(input?.channelNames || input?.channelName);
  const hasPrompt = !!(input?.prompt && input.prompt.trim().length > 0);

  let displayName = hasCompetitors
    ? input?.channelNames || input?.channelName || "Unknown Competitor"
    : hasPrompt
    ? input.prompt!.length > 70
      ? input.prompt!.slice(0, 70).trimEnd() + "…"
      : input.prompt!
    : "Topic Generation";

  return (
    <div className="w-full max-w-5xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-2 overflow-hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="shrink-0"
          >
            <IconArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex flex-col gap-1 overflow-hidden ml-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
              {displayName}
            </h1>
            <div className="flex items-center gap-1.5">
              {hasCompetitors && hasPrompt && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 gap-1">
                  <IconSparkles className="h-3 w-3" />
                  Combined
                </Badge>
              )}
              {hasCompetitors && !hasPrompt && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 gap-1">
                  <IconUsers className="h-3 w-3" />
                  Competitor Analysis
                </Badge>
              )}
              {hasPrompt && !hasCompetitors && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0.5 gap-1">
                  <IconMessageCircle className="h-3 w-3" />
                  Prompt-based
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Input Context Card */}
      {(hasPrompt || hasCompetitors) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {hasCompetitors && (
            <Card className="flex-1 bg-muted/20 border-border/40 py-0">
              <CardContent className="p-4 flex items-start gap-3">
                <IconUsers className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Competitors Analyzed</p>
                  <p className="text-sm text-foreground font-medium truncate">
                    {input?.channelNames || input?.channelName}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          {hasPrompt && (
            <Card className="flex-1 bg-muted/20 border-border/40 py-0">
              <CardContent className="p-4 flex items-start gap-3">
                <IconMessageCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="space-y-0.5 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">Niche / Prompt</p>
                  <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                    {input.prompt}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="space-y-8">
        {/* Viral Ideas */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <IconBulb className="h-5 w-5 text-amber-500" />
            Viral Content Ideas
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {output?.viralIdeas?.map((idea, idx) => (
              <Card
                key={idx}
                className="bg-background shadow-sm border-border hover:border-primary/50 transition-colors"
              >
                <CardHeader className="space-y-2">
                  <Badge
                    variant="outline"
                    className="w-fit text-xs font-medium border-primary/30 text-primary bg-primary/5"
                  >
                    Idea {idx + 1}: {idea.topic}
                  </Badge>
                  <CardTitle className="text-lg leading-tight">
                    {idea.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="bg-muted/50 p-3 rounded-lg border border-border/50">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground/80 block mb-1">
                        Why it works:
                      </span>
                      {idea.reason}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Analysis & Improvements */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-muted/30 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Top Content Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {output?.topContentAnalysis || "No analysis available."}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="">
              <CardTitle className="text-lg text-primary">
                Suggested Improvements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground leading-relaxed list-disc list-inside space-y-2">
                {output?.improvements?.map((imp, idx) => (
                  <li key={idx} className="pl-1 text-foreground/80">
                    {imp}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Outliers Section */}
        {input?.outliers && input.outliers.length > 0 && (
          <Card className="bg-background/50 border-border/50">
            <CardHeader className="">
              <CardTitle className="text-lg">Identified Outliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {input.outliers.map((video, idx) => (
                  <Link 
                    key={idx} 
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Badge
                      variant="secondary"
                      className="font-normal px-3 py-1.5 text-sm bg-muted/80 whitespace-normal text-left break-words hover:bg-muted transition-colors cursor-pointer"
                    >
                      <span className="line-clamp-2">"{video.title}"</span>
                      <span className="font-semibold text-primary ml-1 whitespace-nowrap shrink-0 block sm:inline mt-1 sm:mt-0">
                        {new Intl.NumberFormat("en-US", {
                          notation: "compact",
                        }).format(video.viewCount)}{" "}
                        views
                      </span>
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
