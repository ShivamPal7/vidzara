"use client";

import { useState } from "react";
import { ContentSafetyHeader } from "@/components/dashboard/content-safety/content-safety-header";
import { ContentSafetyInput } from "@/components/dashboard/content-safety/content-safety-input";
import { ContentSafetyResults } from "@/components/dashboard/content-safety/content-safety-results";
import { ContentSafetyResult } from "@/components/dashboard/content-safety/types";
import { ShieldCheck } from "lucide-react";
import { generateContentSafety } from "@/actions/content-safety";
import { toast } from "sonner";

export default function ContentSafetyPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ContentSafetyResult | null>(null);

  const handleAnalyze = async (content: string) => {
    setIsAnalyzing(true);
    setResult(null); // Clear previous result to show skeleton
    
    try {
      const response = await generateContentSafety({ content });
      
      if (response.success && response.data) {
        setResult(response.data as ContentSafetyResult);
      } else {
        toast.error(response.error || "Failed to analyze content");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-5xl mx-auto py-8 px-2 sm:px-6 lg:px-8 space-y-8">
        
        <ContentSafetyHeader />
        
        <ContentSafetyInput 
          onAnalyze={handleAnalyze} 
          isAnalyzing={isAnalyzing} 
        />
        
        {(result || isAnalyzing) ? (
          <ContentSafetyResults result={result || undefined} isLoading={isAnalyzing} />
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
             <div className="p-4 bg-muted rounded-full">
               <ShieldCheck className="w-12 h-12 text-muted-foreground" />
             </div>
             <div>
               <h3 className="text-lg font-medium text-muted-foreground">Ready to analyze</h3>
               <p className="text-sm text-muted-foreground max-w-sm mx-auto">Paste your script, title, or tags above to check for policy violations and algorithm risks.</p>
             </div>
          </div>
        )}
        
      </div>
    </div>
  );
}
