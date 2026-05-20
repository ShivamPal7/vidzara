// Channel search result from YouTube API suggestion search
export interface ChannelSearchResult {
  channelId: string;
  title: string;
  handle?: string;
  thumbnailUrl: string;
  subscriberCount: number;
}

// A single upload data point
export interface UploadDataPoint {
  videoId: string;
  title: string;
  publishedAt: string; // ISO string
  viewCount: number;
  // Computed
  intervalDays: number | null; // days since previous upload (null for first video)
  weekLabel: string; // e.g. "Week 1"
  dayOfWeek: number; // 0=Sun … 6=Sat
}

// Aggregated per-week upload count (last 12 weeks)
export interface WeeklyBucket {
  label: string; // e.g. "Apr 28"
  uploads: number;
}

// Distribution of uploads by day of week
export interface DayOfWeekBucket {
  day: string; // "Mon" … "Sun"
  uploads: number;
}

// Complete computed consistency analysis (no AI)
export interface ConsistencyData {
  channel: ChannelSearchResult;
  // Raw upload points (newest first, as returned from YouTube)
  uploads: UploadDataPoint[];
  // Core stats
  averageIntervalDays: number;
  medianIntervalDays: number;
  minIntervalDays: number;
  maxIntervalDays: number;
  stdDevDays: number; // regularity: lower = more consistent
  totalVideosAnalyzed: number;
  // Derived summaries
  longestStreakWeeks: number; // consecutive weeks with ≥ 1 upload
  longestGapDays: number;
  velocityTrend: "up" | "flat" | "down"; // last 4 weeks vs prior 4 weeks
  regularityLabel: "Highly Consistent" | "Moderate" | "Irregular";
  cadenceLabel: string; // e.g. "~3 videos/week" or "~1 video every 5 days"
  bestUploadDay: string; // e.g. "Tuesday"
  // Chart data
  weeklyBuckets: WeeklyBucket[]; // last 12 weeks
  dayOfWeekBuckets: DayOfWeekBucket[];
}
