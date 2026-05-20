"use client";

import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NicheList } from "./niche-list";
import { NicheGeneration } from "./types";

interface NicheFinderTabsProps {
  generations: NicheGeneration[];
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NicheFinderTabs({ generations, onToggleFavorite, onDelete }: NicheFinderTabsProps) {
  const favorites = generations.filter((g) => g.isFavorite);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      className="w-full"
    >
      <Tabs defaultValue="all" className="w-full">
        <TabsList variant="line" className="mb-6">
          <TabsTrigger value="all" className="text-sm font-medium px-1 pb-2">
            All Niches
          </TabsTrigger>
          <TabsTrigger value="favorites" className="text-sm font-medium px-1 pb-2">
            Favorites ({favorites.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <NicheList
            generations={generations}
            onToggleFavorite={onToggleFavorite}
            onDelete={onDelete}
          />
        </TabsContent>

        <TabsContent value="favorites" className="mt-0">
          <NicheList
            generations={favorites}
            onToggleFavorite={onToggleFavorite}
            onDelete={onDelete}
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
