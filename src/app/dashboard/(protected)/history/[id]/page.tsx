import Link from "next/link";
import { notFound } from "next/navigation";
import { getGenerationById } from "@/actions/get-generation";
import { Feature } from "../../../../../../prisma/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  IconArrowLeft,
  IconSparkles,
  IconScript,
  IconSearch,
  IconPhoto,
  IconScissors,
  IconShieldCheck,
  IconBulb,
  IconUsers,
  IconCalendarStats,
  IconTarget,
  IconChartBar,
  IconCheck,
  IconX,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { formatFeatureName, safeJsonParse } from "@/components/dashboard/history/history-utils";
import { format } from "date-fns";

interface PageProps {
  params: Promise<{ id: string }>;
}

function getFeatureIcon(feature: Feature) {
  switch (feature) {
    case Feature.SCRIPT_WRITER: return IconScript;
    case Feature.VIDEO_SEO: return IconSearch;
    case Feature.THUMBNAIL_CONCEPT: return IconPhoto;
    case Feature.HOOK_DETECTOR: return IconSparkles;
    case Feature.SCRIPT_SHORTENER: return IconScissors;
    case Feature.CONTENT_SAFETY: return IconShieldCheck;
    case Feature.TOPIC_GENERATOR: return IconBulb;
    case Feature.COMPETITORS: return IconUsers;
    case Feature.CONSISTENCY_CHECKER: return IconCalendarStats;
    case Feature.NICHE_FINDER: return IconTarget;
    case Feature.GROWTH_DASHBOARD: return IconChartBar;
    default: return IconSparkles;
  }
}

function RatingBadge({ rating }: { rating: string }) {
  if (rating === "strong") return <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/20">✅ Strong</Badge>;
  if (rating === "average") return <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/20">⚠️ Average</Badge>;
  return <Badge className="bg-red-500/15 text-red-500 border-red-500/20">❌ Weak</Badge>;
}

function ScoreBar({ label, score, max = 10 }: { label: string; score: number; max?: number }) {
  const pct = Math.round((score / max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{score}/{max}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function renderOutput(feature: Feature, output: any) {
  const data = safeJsonParse(output);

  switch (feature) {
    // ─── SCRIPT WRITER ────────────────────────────────────────────────────────
    case Feature.SCRIPT_WRITER:
      return (
        <div className="space-y-4">
          {data.title && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Title</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-lg font-semibold">{data.title}</p>
              </CardContent>
            </Card>
          )}
          {data.content && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Script</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 prose prose-sm dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: data.content }} />
              </CardContent>
            </Card>
          )}
          {data.refinementSuggestions && data.refinementSuggestions.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Refinement Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {data.refinementSuggestions.map((s: string, i: number) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <IconSparkles className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                    <p className="text-muted-foreground">{s}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      );

    // ─── VIDEO SEO ────────────────────────────────────────────────────────────
    case Feature.VIDEO_SEO:
      return (
        <div className="space-y-4">
          {data.titles && data.titles.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Optimized Titles</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {data.titles.map((title: string, i: number) => (
                  <div key={i} className="flex gap-2 items-start p-2.5 rounded-lg bg-muted/30 border border-border/30">
                    <span className="text-xs font-bold text-primary/60 mt-0.5 shrink-0">#{i + 1}</span>
                    <p className="text-sm font-medium">{title}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {data.description && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Description</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{data.description}</p>
              </CardContent>
            </Card>
          )}
          {data.tags && data.tags.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Tags</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 flex flex-wrap gap-2">
                {data.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      );

    // ─── THUMBNAIL CONCEPT ────────────────────────────────────────────────────
    case Feature.THUMBNAIL_CONCEPT:
      return (
        <div className="space-y-4">
          {(data.concepts || []).map((concept: any, i: number) => (
            <Card key={i} className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Concept {i + 1}</Badge>
                  <CardTitle className="text-base">{concept.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {concept.visualDescription && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Visual Description</p>
                    <p className="text-sm text-muted-foreground">{concept.visualDescription}</p>
                  </div>
                )}
                {concept.textOverlay && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Text Overlay</p>
                    <p className="text-sm font-semibold">{concept.textOverlay}</p>
                  </div>
                )}
                {concept.colorPsychology && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Color & Psychology</p>
                    <p className="text-sm text-muted-foreground">{concept.colorPsychology}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      );

    // ─── HOOK DETECTOR ────────────────────────────────────────────────────────
    case Feature.HOOK_DETECTOR: {
      const status = (data.status || data.rating || "WEAK").toLowerCase();
      const rating = status === "weak" ? "weak" : status === "average" ? "average" : "strong";
      const analysis = data.explanation || data.analysis || "";
      const improvedHooks = data.improvedHooks || (data.suggestions && Array.isArray(data.suggestions)
        ? data.suggestions.map((s: any) => typeof s === 'string' ? s : s?.rewrite)
        : []);
      return (
        <div className="space-y-4">
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Rating</CardTitle>
                <RatingBadge rating={rating} />
              </div>
            </CardHeader>
            {analysis && (
              <CardContent className="px-4 pb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{analysis}</p>
              </CardContent>
            )}
          </Card>
          {improvedHooks && improvedHooks.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Improved Hook Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {improvedHooks.map((hook: string, i: number) => (
                  <div key={i} className="flex gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
                    <span className="text-xs font-bold text-primary shrink-0 mt-0.5">#{i + 1}</span>
                    <p className="text-sm">{hook}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    case Feature.SCRIPT_SHORTENER:
      if (data.shortenedScript) {
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {data.originalWordCount !== undefined && (
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm text-center p-3">
                  <p className="text-xs text-muted-foreground">Original Words</p>
                  <p className="text-2xl font-bold text-foreground">{data.originalWordCount}</p>
                </Card>
              )}
              {data.newWordCount !== undefined && (
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm text-center p-3">
                  <p className="text-xs text-muted-foreground">New Words</p>
                  <p className="text-2xl font-bold text-primary">{data.newWordCount}</p>
                </Card>
              )}
              {data.retentionScore !== undefined && (
                <Card className="border-border/50 bg-card/40 backdrop-blur-sm text-center p-3">
                  <p className="text-xs text-muted-foreground">Retention</p>
                  <p className="text-2xl font-bold text-emerald-500">{data.retentionScore}%</p>
                </Card>
              )}
            </div>
            {data.shortenedScript && (
              <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Shortened Script</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{data.shortenedScript}</p>
                </CardContent>
              </Card>
            )}
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {(data.shorts || []).map((short: any, idx: number) => (
            <Card key={idx} className="border-border/50 bg-card/40 backdrop-blur-sm p-4 sm:p-6 space-y-4 hover:border-primary/30 transition-colors">
              <div className="space-y-1">
                <span className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Short {idx + 1}
                </span>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {short.title}
                </CardTitle>
              </div>

              <div className="space-y-4">
                {/* Hook */}
                {short.hook && (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">Hook (0-3s)</p>
                    <p className="text-sm font-medium leading-relaxed text-foreground">"{short.hook}"</p>
                  </div>
                )}

                {/* Body */}
                {short.body && (
                  <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-1">Body</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{short.body}</p>
                  </div>
                )}

                {/* CTA and Visuals */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {short.cta && (
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">Call to Action</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">"{short.cta}"</p>
                    </div>
                  )}

                  {short.visuals && (
                    <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-4">
                      <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-1">Visuals</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">{short.visuals}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      );

    // ─── CONTENT SAFETY ───────────────────────────────────────────────────────
    case Feature.CONTENT_SAFETY: {
      const score = data.score !== undefined ? data.score : (data.confidenceScore !== undefined ? Math.round(data.confidenceScore) : (data.isSafe ? 100 : 40));
      const summary = data.summary || data.reasoning || "Content safety check complete.";
      const isSafe = data.isSafe !== undefined ? data.isSafe : (score >= 80);
      const flaggedCategories = data.flaggedCategories || (data.highlights && Array.isArray(data.highlights)
        ? Array.from(new Set(data.highlights.map((h: any) => h.type || "issue")))
        : []);
      const highlights = data.highlights || [];
      
      return (
        <div className="space-y-4">
          <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Safety Status</CardTitle>
                <Badge className={isSafe ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20 gap-1" : "bg-red-500/15 text-red-500 border-red-500/20 gap-1"}>
                  {isSafe ? <IconCheck className="h-3 w-3" /> : <IconX className="h-3 w-3" />}
                  {isSafe ? "Safe" : "Risky"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              <ScoreBar label="Safety Score" score={score} max={100} />
              {summary && (
                <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
              )}
            </CardContent>
          </Card>
          
          {flaggedCategories.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <IconAlertTriangle className="h-4 w-4 text-amber-500" />
                  Flagged Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 flex flex-wrap gap-2">
                {flaggedCategories.map((cat: string, i: number) => (
                  <Badge key={i} className="bg-amber-500/10 text-amber-605 border-amber-500/20 capitalize">{cat}</Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {highlights.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Flagged Issues</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {highlights.map((h: any, i: number) => (
                  <div key={i} className="text-sm space-y-1 p-3 rounded-lg bg-muted/20 border border-border/20">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-rose-500 capitalize">[{h.type}]</span>
                      <span className="font-medium text-foreground">"{h.text}"</span>
                    </div>
                    <p className="text-muted-foreground text-xs">{h.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    case Feature.TOPIC_GENERATOR:
      if (data.topics && Array.isArray(data.topics)) {
        return (
          <div className="space-y-3">
            {data.topics.map((topic: any, i: number) => (
              <Card key={i} className="border-border/50 bg-card/40 backdrop-blur-sm">
                <CardHeader className="pb-1 pt-4 px-4">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="text-xs shrink-0">#{i + 1}</Badge>
                    <CardTitle className="text-base leading-snug">{topic.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2">
                  {topic.angle && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Angle</p>
                      <p className="text-sm text-muted-foreground">{topic.angle}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 pt-1">
                    {topic.targetAudience && (
                      <span className="text-xs text-muted-foreground"><span className="font-medium text-foreground/80">Audience:</span> {topic.targetAudience}</span>
                    )}
                    {topic.viralPotential && (
                      <span className="text-xs text-muted-foreground"><span className="font-medium text-foreground/80">Viral:</span> {topic.viralPotential}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-6">
          {/* Viral Ideas */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <IconBulb className="h-4.5 w-4.5 text-amber-500" />
              Viral Content Ideas
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(data.viralIdeas || []).map((idea: any, idx: number) => (
                <Card key={idx} className="border-border/50 bg-card/40 backdrop-blur-sm hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-2 pt-4 px-4 space-y-1.5">
                    <Badge variant="outline" className="w-fit text-[10px] font-medium border-primary/20 text-primary bg-primary/5">
                      Idea {idx + 1}: {idea.topic}
                    </Badge>
                    <CardTitle className="text-base leading-tight font-semibold">
                      {idea.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4 pt-1">
                    <div className="bg-muted/30 p-2.5 rounded-lg border border-border/20">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground/80 block mb-0.5">Why it works:</span>
                        {idea.reason}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Analysis & Improvements */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Top Content Analysis</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {data.topContentAnalysis || "No analysis available."}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/30 bg-primary/5">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-primary font-medium uppercase tracking-wider">Suggested Improvements</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ul className="text-sm text-muted-foreground leading-relaxed list-disc list-inside space-y-1.5">
                  {(data.improvements || []).map((imp: string, idx: number) => (
                    <li key={idx} className="pl-1 text-foreground/80">
                      {imp}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      );

    // ─── COMPETITORS ──────────────────────────────────────────────────────────
    case Feature.COMPETITORS:
      return (
        <div className="space-y-4">
          {data.strengths && data.strengths.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <IconTrendingUp className="h-4 w-4 text-emerald-500" /> Strengths
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {data.strengths.map((s: string, i: number) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <IconCheck className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    <p className="text-muted-foreground">{s}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {data.weaknesses && data.weaknesses.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <IconTrendingDown className="h-4 w-4 text-red-500" /> Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {data.weaknesses.map((w: string, i: number) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <IconX className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                    <p className="text-muted-foreground">{w}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {data.contentGaps && data.contentGaps.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <IconBulb className="h-4 w-4 text-amber-500" /> Content Gaps
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 flex flex-wrap gap-2">
                {data.contentGaps.map((gap: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">{gap}</Badge>
                ))}
              </CardContent>
            </Card>
          )}
          {data.recommendedStrategy && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Recommended Strategy</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{data.recommendedStrategy}</p>
              </CardContent>
            </Card>
          )}
        </div>
      );

    // ─── CONSISTENCY CHECKER ──────────────────────────────────────────────────
    case Feature.CONSISTENCY_CHECKER: {
      const growthDir = data.growthDirection;
      const GrowthIcon = growthDir === "Up" ? IconTrendingUp : growthDir === "Down" ? IconTrendingDown : IconMinus;
      const growthColor = growthDir === "Up" ? "text-emerald-500" : growthDir === "Down" ? "text-red-500" : "text-amber-500";
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {data.score !== undefined && (
              <Card className="border-border/50 bg-card/40 backdrop-blur-sm text-center p-3">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-3xl font-bold text-primary">{data.score}</p>
              </Card>
            )}
            {growthDir && (
              <Card className="border-border/50 bg-card/40 backdrop-blur-sm text-center p-3 flex flex-col items-center justify-center gap-1">
                <p className="text-xs text-muted-foreground">Growth</p>
                <GrowthIcon className={`h-6 w-6 ${growthColor}`} />
                <p className={`text-sm font-semibold ${growthColor}`}>{growthDir}</p>
              </Card>
            )}
          </div>
          {data.postingFrequency && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardContent className="px-4 py-3">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Posting Frequency</p>
                <p className="text-sm font-medium">{data.postingFrequency}</p>
              </CardContent>
            </Card>
          )}
          {data.deviations && data.deviations.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Deviations</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {data.deviations.map((d: string, i: number) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <IconAlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
                    <p className="text-muted-foreground">{d}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {data.continueDoing && data.continueDoing.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <IconCheck className="h-4 w-4 text-emerald-500" /> Continue Doing
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {data.continueDoing.map((item: string, i: number) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <IconCheck className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {data.stopDoing && data.stopDoing.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
                  <IconX className="h-4 w-4 text-red-500" /> Stop Doing
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {data.stopDoing.map((item: string, i: number) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <IconX className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {data.improvementPlan && data.improvementPlan.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Improvement Plan</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {data.improvementPlan.map((step: string, i: number) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <span className="shrink-0 font-bold text-primary/60 text-xs mt-0.5">{i + 1}.</span>
                    <p className="text-muted-foreground">{step}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    // ─── NICHE FINDER ─────────────────────────────────────────────────────────
    case Feature.NICHE_FINDER:
      return (
        <div className="space-y-4">
          {(data.niches || []).map((niche: any, i: number) => (
            <Card key={i} className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">#{i + 1}</Badge>
                  <CardTitle className="text-base">{niche.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {niche.viralScore !== undefined && (
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">Viral</p>
                      <p className="text-lg font-bold text-primary">{niche.viralScore}</p>
                    </div>
                  )}
                  {niche.revenueScore !== undefined && (
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-lg font-bold text-emerald-500">{niche.revenueScore}</p>
                    </div>
                  )}
                  {niche.competitionScore !== undefined && (
                    <div className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground">Competition</p>
                      <p className="text-lg font-bold text-amber-500">{niche.competitionScore}</p>
                    </div>
                  )}
                </div>
                {niche.competitionLevel && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Competition Level</p>
                    <Badge variant="secondary">{niche.competitionLevel}</Badge>
                  </div>
                )}
                {niche.monetizationPotential && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Monetization</p>
                    <p className="text-sm text-muted-foreground">{niche.monetizationPotential}</p>
                  </div>
                )}
                {niche.contentStrategy && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Content Strategy</p>
                    <p className="text-sm text-muted-foreground">{niche.contentStrategy}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      );

    // ─── GROWTH DASHBOARD ─────────────────────────────────────────────────────
    case Feature.GROWTH_DASHBOARD:
      return (
        <div className="space-y-4">
          {data.summary && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
              </CardContent>
            </Card>
          )}
          {data.actionItems && data.actionItems.length > 0 && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Action Items</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-2">
                {data.actionItems.map((item: string, i: number) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <span className="shrink-0 font-bold text-primary/60 text-xs mt-0.5">{i + 1}.</span>
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {data.projectedGrowth && (
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Projected Growth</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{data.projectedGrowth}</p>
              </CardContent>
            </Card>
          )}
        </div>
      );

    // ─── FALLBACK ─────────────────────────────────────────────────────────────
    default:
      return (
        <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
          <CardContent className="px-4 py-4">
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      );
  }
}

export default async function GenerationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const result = await getGenerationById(id);

  if (!result.success || !result.data) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-4">
          <IconSearch className="h-10 w-10 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Generation not found</h2>
        <p className="text-muted-foreground max-w-sm mb-6">
          This generation doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard/history">
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to History
          </Link>
        </Button>
      </div>
    );
  }

  const generation = result.data;
  const featureName = formatFeatureName(generation.feature as Feature);
  const FeatureIcon = getFeatureIcon(generation.feature as Feature);
  const formattedDate = format(new Date(generation.createdAt), "MMM d, yyyy 'at' h:mm a");

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 overflow-x-hidden space-y-6 animate-in fade-in duration-300">
      {/* Back + header */}
      <div className="space-y-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/dashboard/history">
            <IconArrowLeft className="h-4 w-4 mr-1.5" />
            History
          </Link>
        </Button>

        <div className="flex items-start gap-3">
          <div className="shrink-0 h-9 w-9 flex items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
            <FeatureIcon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">{featureName}</Badge>
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
            </div>
            <h1 className="text-lg font-semibold text-foreground leading-tight">
              {featureName} Result
            </h1>
          </div>
        </div>
      </div>

      <Separator className="opacity-50" />

      {/* Feature-specific output */}
      {renderOutput(generation.feature as Feature, generation.output)}
    </div>
  );
}
