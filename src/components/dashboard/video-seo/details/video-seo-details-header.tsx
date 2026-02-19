"use client";

import { ArrowLeft, Eye, Heart, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoSeoDetailsHeaderProps {
  title: string;
  className?: string;
}

export function VideoSeoDetailsHeader({ title, className }: VideoSeoDetailsHeaderProps) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex items-center justify-between w-full",
        className
      )}
    >
      {/* Left: Back + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.back()}
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-sm sm:text-base font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs md:max-w-md">
          {title}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* <Button
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex text-muted-foreground hover:text-foreground gap-1.5 text-xs"
        >
          <Eye className="size-3.5" />
          Preview
        </Button> */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex text-muted-foreground hover:text-foreground gap-1.5 text-xs"
        >
          <Heart className="size-3.5" />
          Favorite
        </Button>

        {/* Mobile icon-only buttons */}
        {/* <Button
          variant="ghost"
          size="icon-sm"
          className="sm:hidden text-muted-foreground hover:text-foreground"
        >
          <Eye className="size-4" />
        </Button> */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="sm:hidden text-muted-foreground hover:text-foreground"
        >
          <Heart className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </div>
  );
}
