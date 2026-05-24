"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";

export function PeriodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPeriod = searchParams.get("period") || "28d";

  const handleValueChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <Tabs value={currentPeriod} onValueChange={handleValueChange}>
      <TabsList className="bg-card/50 border border-border/50">
        <TabsTrigger value="7d" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">7 Days</TabsTrigger>
        <TabsTrigger value="28d" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">28 Days</TabsTrigger>
        <TabsTrigger value="90d" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">90 Days</TabsTrigger>
        <TabsTrigger value="365d" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">365 Days</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
