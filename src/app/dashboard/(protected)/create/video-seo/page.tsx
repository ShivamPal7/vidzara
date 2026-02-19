"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { 
  Loader2, 
  Sparkles, 
  Copy, 
  Check, 
  Youtube, 
  Search, 
  FileText, 
  List
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { generateVideoSEO } from "@/actions/video-seo";

// Types matching the AI response
interface VideoSEOResult {
  titles: string[];
  description: string;
  tags: string[];
  hashtags: string[];
  keywords: string[];
}

export default function VideoSeoPage() {
  const [mode, setMode] = useState<"topic" | "keypoints" | "script">("topic");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VideoSEOResult | null>(null);

  const handleGenerate = async () => {
    if (!content || content.length < 3) {
      toast.error("Please enter some content to generate SEO.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await generateVideoSEO({ mode, content });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to generate SEO");
      }

      setResult((response.data as any).output as VideoSEOResult);
      toast.success("SEO Metadata Generated!");
    } catch (error: any) {
        console.error(error);
      toast.error(error.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  const copyTags = (tags: string[]) => {
    navigator.clipboard.writeText(tags.join(", "));
    toast.success("Copied tags to clipboard");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent inline-flex items-center gap-2">
          <Youtube className="w-8 h-8 text-red-500" />
          Video SEO Generator
        </h1>
        <p className="text-muted-foreground text-lg">
          Generate high-CTR titles, optimized descriptions, and tags in seconds.
        </p>
      </div>

      {/* Input Section */}
      <Card className="glass-1 border-primary/20 shadow-lg">
        <CardContent className="pt-6">
          <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="topic" className="gap-2">
                <Search className="w-4 h-4" /> Topic
              </TabsTrigger>
              <TabsTrigger value="keypoints" className="gap-2">
                <List className="w-4 h-4" /> Key Points
              </TabsTrigger>
              <TabsTrigger value="script" className="gap-2">
                <FileText className="w-4 h-4" /> Full Script
              </TabsTrigger>
            </TabsList>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">
                  {mode === "topic" && "What is your video about?"}
                  {mode === "keypoints" && "List the main points of your video"}
                  {mode === "script" && "Paste your full video script"}
                </Label>
                <Textarea
                  id="content"
                  placeholder={
                    mode === "topic" ? "e.g. How to bake sourdough bread for beginners..." :
                    mode === "keypoints" ? "e.g. 1. Ingredients needed\n2. Mixing the dough\n3. Proofing process..." :
                    "Paste your script here..."
                  }
                  className="min-h-[150px] text-lg p-4 resize-y bg-background/50 focus:bg-background transition-colors"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  maxLength={5000}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{content.length}/5000 characters</span>
                    <span>Using Gemini 2.5 Flash</span>
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={loading || !content.trim()}
                size="lg"
                className="w-full text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5 fill-current" />
                    Generate SEO Metadata
                  </>
                )}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results Section */}
      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Titles */}
            <ResultCard 
              title="Optimized Titles" 
              icon={<Search className="w-5 h-5 text-blue-400" />}
              onCopy={() => copyToClipboard(result.titles.join("\n"), "Titles")}
            >
              <ul className="space-y-3">
                {result.titles.map((title, i) => (
                  <li key={i} className="flex gap-3 group items-start p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                    <span className="text-muted-foreground font-mono text-sm pt-1">0{i+1}</span>
                    <span className="font-medium text-foreground text-lg leading-snug">{title}</span>
                    <Button variant="ghost" size="icon" className="ml-auto opacity-0 group-hover:opacity-100 h-8 w-8" onClick={() => copyToClipboard(title, "Title")}>
                        <Copy className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </ResultCard>

            {/* Description */}
            <ResultCard 
              title="Video Description" 
              icon={<FileText className="w-5 h-5 text-purple-400" />}
              onCopy={() => copyToClipboard(result.description, "Description")}
            >
              <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed p-2 font-mono text-sm bg-secondary/30 rounded-md border border-border/50">
                {result.description}
              </div>
            </ResultCard>

            {/* Tags & Hashtags */}
            <div className="grid md:grid-cols-2 gap-6">
                 {/* Tags */}
                <ResultCard 
                title="Tags" 
                icon={<List className="w-5 h-5 text-green-400" />}
                onCopy={() => copyTags(result.tags)}
                >
                <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-secondary-foreground hover:bg-primary/20 transition-colors cursor-default">
                        {tag}
                    </Badge>
                    ))}
                </div>
                </ResultCard>

                 {/* Hashtags */}
                 <ResultCard 
                title="Hashtags" 
                icon={<span className="text-pink-400 font-bold text-lg">#</span>}
                onCopy={() => copyTags(result.hashtags.map(h => `#${h}`))}
                >
                <div className="flex flex-wrap gap-2">
                    {result.hashtags.map((tag, i) => (
                    <span key={i} className="text-blue-400 hover:underline cursor-pointer">
                        #{tag}
                    </span>
                    ))}
                </div>
                </ResultCard>
            </div>

             {/* Keywords */}
            <ResultCard 
                title="Target Keywords" 
                icon={<Sparkles className="w-5 h-5 text-yellow-400" />}
                onCopy={() => copyToClipboard(result.keywords.join(", "), "Keywords")}
            >
                <div className="grid grid-cols-2 gap-2">
                  {result.keywords.map((kw, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                        {kw}
                    </div>
                  ))}
                </div>
            </ResultCard>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ResultCard({ title, icon, children, onCopy }: { title: string, icon: React.ReactNode, children: React.ReactNode, onCopy: () => void }) {
    return (
        <Card className="glass-2 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-secondary/20 border-b border-border/40">
                <div className="flex items-center gap-2">
                    {icon}
                    <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="h-8 gap-2 text-muted-foreground hover:text-foreground" onClick={onCopy}>
                    <Copy className="w-4 h-4" />
                    Copy
                </Button>
            </CardHeader>
            <CardContent className="pt-6">
                {children}
            </CardContent>
        </Card>
    )
}
