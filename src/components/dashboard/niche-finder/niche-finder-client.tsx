"use client";

import { useState } from "react";
import { NicheFinderHeader } from "./niche-finder-header";
import { NicheFinderForm } from "./niche-finder-form";
import { GenerationDetails } from "./generation-details";
import { NicheGeneration } from "./types";

export function NicheFinderClient() {
  const [generation, setGeneration] = useState<NicheGeneration | null>(null);

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-4rem)] px-2">
      <div className="w-full max-w-5xl mx-auto py-8 space-y-8">
        {/* Hide page header on mobile when results shown, always show on desktop */}
        <div className={generation ? "hidden sm:block" : ""}>
          <NicheFinderHeader />
        </div>

        {/* Input Form */}
        <NicheFinderForm onGenerated={(result) => setGeneration(result)} />

        {/* Dynamic Content */}
        {generation && (
          <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <GenerationDetails 
              generation={generation} 
              onBack={() => setGeneration(null)} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
