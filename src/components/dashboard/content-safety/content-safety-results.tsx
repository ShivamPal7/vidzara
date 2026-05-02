"use client";

import { motion } from "framer-motion";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  EyeOff,
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentSafetyResult } from "./types";
import { cn } from "@/lib/utils";

interface ContentSafetyResultsProps {
  result?: ContentSafetyResult;
  isLoading?: boolean;
}

export function ContentSafetyResults({ result, isLoading }: ContentSafetyResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 50) return "text-amber-500";
    return "text-rose-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <ShieldCheck className="w-8 h-8 text-emerald-500" />;
    if (score >= 50) return <AlertTriangle className="w-8 h-8 text-amber-500" />;
    return <ShieldAlert className="w-8 h-8 text-rose-500" />;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "clickbait": return <EyeOff className="w-3.5 h-3.5 mr-1" />;
      case "algorithm": return <Activity className="w-3.5 h-3.5 mr-1" />;
      case "policy": return <ShieldAlert className="w-3.5 h-3.5 mr-1" />;
      default: return null;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "clickbait": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "algorithm": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "policy": return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default: return "";
    }
  };

  const highlights = result?.highlights || [];
  const suggestions = result?.suggestions || [];

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl mx-auto space-y-6 mt-8"
      >
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="flex-1 w-full space-y-4">
                <Skeleton className="h-8 w-48 mx-auto sm:mx-0" />
                <Skeleton className="h-4 w-full max-w-sm mx-auto sm:mx-0" />
                <div className="pt-2">
                  <Skeleton className="h-2 w-full mt-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="w-full space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </motion.div>
    );
  }

  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6 mt-8"
    >
      {/* Score Header Card */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0 relative flex items-center justify-center w-24 h-24 rounded-full border-4 border-muted">
              {/* Circular progress visual illusion */}
              <div 
                className={cn("absolute inset-0 rounded-full border-4 opacity-20", getScoreColor(result.score))} 
                style={{ clipPath: `polygon(0 0, 100% 0, 100% ${result.score}%, 0 ${result.score}%)` }}
              />
              <div className="flex flex-col items-center justify-center">
                <span className={cn("text-3xl font-bold tracking-tighter", getScoreColor(result.score))}>
                  {result.score}
                </span>
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {getScoreIcon(result.score)}
                <h3 className="text-2xl font-semibold tracking-tight">Safety Score</h3>
              </div>
              <p className="text-muted-foreground">{result.summary}</p>
              
              <div className="pt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>High Risk</span>
                  <span>Safe</span>
                </div>
                <Progress value={result.score} className={cn("h-2 [&>div]:bg-gradient-to-r [&>div]:from-rose-500 [&>div]:via-amber-500 [&>div]:to-emerald-500")} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="issues" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
          <TabsTrigger value="issues" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Issues Detected ({highlights.length})
          </TabsTrigger>
          <TabsTrigger value="rewrites" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Suggested Rewrites ({suggestions.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="issues" className="space-y-4 mt-4">
          {highlights.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
                <h3 className="text-lg font-medium">No issues detected!</h3>
                <p className="text-muted-foreground mt-1">Your content looks completely safe and compliant.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {highlights.map((highlight, index) => (
                <Card key={index} className="overflow-hidden border-l-4" style={{ borderLeftColor: highlight.type === 'policy' ? '#f43f5e' : highlight.type === 'clickbait' ? '#f59e0b' : '#3b82f6' }}>
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <Badge variant="outline" className={cn("capitalize font-medium border", getTypeBadgeColor(highlight.type))}>
                          {getTypeIcon(highlight.type)}
                          {highlight.type} Issue
                        </Badge>
                        <p className="font-medium text-foreground mt-2 leading-relaxed">
                          "{highlight.text}"
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {highlight.reason}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="rewrites" className="space-y-4 mt-4">
          {suggestions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <ShieldCheck className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No rewrites needed</h3>
                <p className="text-muted-foreground mt-1">Your content is already optimized for safety.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="bg-card/60 backdrop-blur-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-primary" />
                      <CardTitle className="text-base">Suggested Rewrite</CardTitle>
                    </div>
                    <CardDescription>{suggestion.reason}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-rose-500/5 rounded-lg p-3 border border-rose-500/10 relative">
                        <div className="absolute top-0 right-0 bg-rose-500/10 text-rose-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-bl-lg rounded-tr-lg">Original</div>
                        <p className="text-sm text-rose-600 dark:text-rose-400 mt-2 line-through opacity-80">{suggestion.original}</p>
                      </div>
                      
                      <div className="hidden sm:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background rounded-full border border-border shadow-sm">
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>

                      <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/10 relative">
                        <div className="absolute top-0 left-0 bg-emerald-500/10 text-emerald-500 text-[10px] uppercase font-bold px-2 py-0.5 rounded-br-lg rounded-tl-lg">Optimized</div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-400 mt-2 font-medium">{suggestion.rewrite}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
