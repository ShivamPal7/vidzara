"use client";

import { useState, useTransition } from "react";
import { ArrowLeft, Heart, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleFavorite, deleteGeneration } from "@/actions/video-seo";

interface VideoSeoDetailsHeaderProps {
  title: string;
  generationId: string;
  isFavorite: boolean;
  className?: string;
}

export function VideoSeoDetailsHeader({
  title,
  generationId,
  isFavorite: initialFavorite,
  className,
}: VideoSeoDetailsHeaderProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [isFaving, startFavTransition] = useTransition();

  const handleToggleFavorite = () => {
    setIsFavorite((prev) => !prev);
    startFavTransition(async () => {
      const result = await toggleFavorite(generationId);
      if (!result.success) {
        setIsFavorite((prev) => !prev); // revert
      }
    });
  };

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteGeneration(generationId);
      if (result.success) {
        router.push("/dashboard/create/video-seo");
      }
    });
  };

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
          onClick={() => router.push("/dashboard/create/video-seo")}
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
        <Button
          variant="ghost"
          size="sm"
          disabled={isFaving}
          onClick={handleToggleFavorite}
          className="hidden sm:inline-flex text-muted-foreground hover:text-foreground gap-1.5 text-xs"
        >
          <Heart
            className={cn(
              "size-3.5",
              isFavorite && "fill-primary text-primary"
            )}
          />
          {isFavorite ? "Favorited" : "Favorite"}
        </Button>

        {/* Mobile icon-only favorite button */}
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isFaving}
          onClick={handleToggleFavorite}
          className="sm:hidden text-muted-foreground hover:text-foreground"
        >
          <Heart
            className={cn(
              "size-4",
              isFavorite && "fill-primary text-primary"
            )}
          />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          disabled={isDeleting}
          onClick={handleDelete}
          className="text-muted-foreground hover:text-destructive"
        >
          {isDeleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
