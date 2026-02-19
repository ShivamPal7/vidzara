"use client";

import { SectionHeader } from "./section-header";
import { TagPill } from "./tag-pill";
import { cn } from "@/lib/utils";
import type { VideoSeoTag } from "../types";

interface TagsBlockProps {
  tags: VideoSeoTag[];
  className?: string;
}

export function TagsBlock({ tags, className }: TagsBlockProps) {
  const handleCopy = () => {
    const text = tags.map((t) => t.keyword).join(", ");
    navigator.clipboard.writeText(text);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <SectionHeader title="Tags" onCopy={handleCopy} />
      <div className="rounded-xl bg-secondary/60 border border-border/40 px-4 py-4">
        <div className="flex flex-wrap gap-2 items-center">
          {tags.map((tag) => (
            <TagPill
              key={tag.keyword}
              keyword={tag.keyword}
              score={tag.score}
              onRemove={() => {}}
            />
          ))}
          <input
            type="text"
            placeholder="Add tags"
            className="bg-transparent text-sm text-muted-foreground placeholder:text-muted-foreground/60 outline-none border-none min-w-[80px] py-1.5 px-1"
          />
        </div>
      </div>
    </div>
  );
}
