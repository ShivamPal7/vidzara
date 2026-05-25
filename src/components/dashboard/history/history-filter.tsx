"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatFeatureName } from "./history-utils";

const AVAILABLE_FEATURES = [
  "VIDEO_SEO",
  "SCRIPT_WRITER",
  "SCRIPT_SHORTENER",
  "HOOK_DETECTOR",
  "CONTENT_SAFETY",
  "TOPIC_GENERATOR",
  "COMPETITORS",
  "CONSISTENCY_CHECKER",
  "NICHE_FINDER",
  "THUMBNAIL_CONCEPT",
  "GROWTH_DASHBOARD",
  "CHAT",
];

const DATE_RANGES = [
  { label: "All Time", value: "ALL_TIME" },
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
];

export function HistoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFeature = searchParams.get("feature") || "ALL";
  const currentDateRange = searchParams.get("dateRange") || "ALL_TIME";

  const buildUrl = (feature: string, dateRange: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");

    if (feature === "ALL") {
      params.delete("feature");
    } else {
      params.set("feature", feature);
    }

    if (dateRange === "ALL_TIME") {
      params.delete("dateRange");
    } else {
      params.set("dateRange", dateRange);
    }

    return `/dashboard/history?${params.toString()}`;
  };

  const handleFeatureChange = (value: string) => {
    router.push(buildUrl(value, currentDateRange));
  };

  const handleDateRangeChange = (value: string) => {
    router.push(buildUrl(currentFeature, value));
  };

  return (
    <div className="flex gap-2 w-full sm:w-auto">
      <Select value={currentFeature} onValueChange={handleFeatureChange}>
        <SelectTrigger className="w-full sm:w-[150px] bg-card/50 backdrop-blur-sm focus:ring-primary/30">
          <SelectValue placeholder="All Tools" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>All Tools</SelectLabel>
            <SelectItem value="ALL">All Generations</SelectItem>
          </SelectGroup>
          <SelectGroup>
            <SelectLabel>Specific Tool</SelectLabel>
            {AVAILABLE_FEATURES.map((feature) => (
              <SelectItem key={feature} value={feature}>
                {formatFeatureName(feature as any)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Select value={currentDateRange} onValueChange={handleDateRangeChange}>
        <SelectTrigger className="w-full sm:w-[140px] bg-card/50 backdrop-blur-sm focus:ring-primary/30">
          <SelectValue placeholder="All Time" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Date Range</SelectLabel>
            {DATE_RANGES.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
