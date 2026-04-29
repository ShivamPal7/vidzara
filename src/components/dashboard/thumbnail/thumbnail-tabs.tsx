"use client";

import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThumbnailList } from "./thumbnail-list";
import type { Thumbnail } from "./types";

interface ThumbnailTabsProps {
  thumbnails: Thumbnail[];
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function ThumbnailTabs({ thumbnails, onToggleFavorite, onDelete, className }: ThumbnailTabsProps) {
  const favorites = thumbnails.filter((v) => v.isFavorite);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      className={className}
    >
      <Tabs defaultValue="all" className="w-full">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="all" className="text-sm font-medium px-1 pb-2">
            All Concepts
          </TabsTrigger>
          <TabsTrigger value="favorites" className="text-sm font-medium px-1 pb-2">
            Favorites
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ThumbnailList
            thumbnails={thumbnails}
            onToggleFavorite={onToggleFavorite}
            onDelete={onDelete}
          />
        </TabsContent>

        <TabsContent value="favorites">
          <ThumbnailList
            thumbnails={favorites}
            onToggleFavorite={onToggleFavorite}
            onDelete={onDelete}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
