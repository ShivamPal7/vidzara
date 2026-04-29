"use client";

import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/actions/thumbnail";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface ThumbnailDetailsHeaderProps {
  title: string;
  generationId: string;
  isFavorite: boolean;
}

export function ThumbnailDetailsHeader({ title, generationId, isFavorite }: ThumbnailDetailsHeaderProps) {
  const [favorite, setFavorite] = useState(isFavorite);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggle = () => {
    setFavorite(!favorite);
    startTransition(async () => {
      const res = await toggleFavorite(generationId);
      if (!res.success) {
        setFavorite(favorite); // Revert on error
      }
    });
  };

  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="size-8 sm:size-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 shrink-0"
        >
          <ChevronLeft className="size-4 sm:size-5" />
        </Button>
        <h1 className="text-xl sm:text-3xl font-semibold tracking-tight text-foreground truncate">
          {title}
        </h1>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          "rounded-full gap-2 transition-all duration-200",
          favorite 
            ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Heart className={cn("size-4", favorite && "fill-primary")} />
        <span className="hidden sm:inline">
          {favorite ? "Saved" : "Save to Favorites"}
        </span>
      </Button>
    </div>
  );
}
