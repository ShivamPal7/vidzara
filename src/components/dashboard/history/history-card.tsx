"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { IconChevronRight, IconClock } from "@tabler/icons-react";
import { getGenerationDisplayData, formatFeatureName, getFeatureIcon } from "./history-utils";
import type { GenerationHistoryItem } from "@/actions/history";

interface HistoryCardProps {
  generation: GenerationHistoryItem;
}

export function HistoryCard({ generation }: HistoryCardProps) {
  const { heading, description, href } = getGenerationDisplayData(
    generation.feature,
    generation.output
  );

  const FEATURES_WITH_ID_PAGES = new Set([
    "SCRIPT_WRITER",
    "VIDEO_SEO",
    "THUMBNAIL_CONCEPT",
    "TOPIC_GENERATOR",
    "NICHE_FINDER"
  ]);

  const featureName = formatFeatureName(generation.feature);
  const timeAgo = formatDistanceToNow(new Date(generation.createdAt), { addSuffix: true });
  const hasIdPage = FEATURES_WITH_ID_PAGES.has(generation.feature);
  const targetUrl = hasIdPage ? `${href}/${generation.id}` : `${href}?generationId=${generation.id}`;
  const Icon = getFeatureIcon(generation.feature);

  return (
    <Link
      href={targetUrl}
      className="group flex items-center gap-3 p-3.5 rounded-xl border border-border/50 bg-card/20 backdrop-blur-sm transition-all duration-300 hover:bg-muted/30 hover:border-border overflow-hidden"
    >
      {/* Icon — fixed size, never shrinks, never grows */}
      <div className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors duration-300">
        <Icon className="h-4 w-4" />
      </div>

      {/* Text column — min-w-0 is critical, allows flex children to shrink below content size */}
      <div className="min-w-0 flex-1 flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 overflow-hidden">
          <Badge
            variant="secondary"
            className="shrink-0 px-1.5 py-0 text-[10px] font-medium bg-secondary/50 border-transparent leading-5"
          >
            {featureName}
          </Badge>
          <span className="text-[11px] text-muted-foreground/60 whitespace-nowrap overflow-hidden text-ellipsis">
            <IconClock className="inline w-3 h-3 mr-0.5 -mt-px" />
            {timeAgo}
          </span>
        </div>

        {/* Heading: truncate = overflow:hidden + whitespace:nowrap + text-overflow:ellipsis */}
        <p className="text-[14px] sm:text-[15px] font-semibold text-foreground/90 group-hover:text-foreground transition-colors truncate">
          {heading}
        </p>

        {description && (
          <p className="text-[12px] sm:text-[13px] text-muted-foreground/65 truncate">
            {description}
          </p>
        )}
      </div>

      {/* Chevron — fixed, never grows */}
      <div className="shrink-0 text-muted-foreground/40 transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5">
        <IconChevronRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
