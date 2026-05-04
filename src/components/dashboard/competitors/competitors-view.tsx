"use client";

import { useState } from "react";
import { TopVideosTable } from "./top-videos-table";
import { ChannelStatsTable } from "./channel-stats-table";
import { CompetitorManagerModal } from "./competitor-manager-modal";
import { motion } from "framer-motion";

import { useEffect } from "react";
import { getCompetitors } from "@/actions/competitors";

import { Competitor } from "./topic-generator/types"; // Assuming types are here

export function CompetitorsView() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]); 
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const fetchInitial = async () => {
      const res = await getCompetitors();
      if (res.success && res.data) {
        setCompetitors(res.data);
        setSelectedIds(res.data.map((c: any) => c.id));
      }
      setIsInitialLoading(false);
    };
    fetchInitial();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Competitors</h2>
        <CompetitorManagerModal 
          selectedIds={selectedIds} 
          onChange={setSelectedIds} 
          competitors={competitors}
          setCompetitors={setCompetitors}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 space-y-6 min-w-0"
      >
        <TopVideosTable 
          selectedIds={selectedIds} 
          isInitialLoading={isInitialLoading}
          onSelectionChange={setSelectedIds}
          competitors={competitors}
          setCompetitors={setCompetitors}
          onRemoveCompetitor={(id) => setSelectedIds(prev => prev.filter(cId => cId !== id))}
        />
        <ChannelStatsTable 
          selectedIds={selectedIds}
          isInitialLoading={isInitialLoading}
          onSelectionChange={setSelectedIds}
          competitors={competitors}
          setCompetitors={setCompetitors}
          onRemoveCompetitor={(id) => setSelectedIds(prev => prev.filter(cId => cId !== id))}
        />
      </motion.div>
    </div>
  );
}
