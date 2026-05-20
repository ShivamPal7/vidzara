"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { searchChannels, getRecentVideos, getChannelInfo } from "@/lib/youtube/api";
import type {
  ChannelSearchResult,
  ConsistencyData,
  UploadDataPoint,
  WeeklyBucket,
  DayOfWeekBucket,
} from "@/components/dashboard/consistency-checker/types";

// ── Auth helper ──────────────────────────────────────────────────────────────

async function requireSession(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");
}

// ── Channel suggestion search (reuses searchChannels / getChannelInfo from lib/youtube/api) ───

export async function searchConsistencyChannels(query: string): Promise<{
  success: boolean;
  data?: ChannelSearchResult[];
  error?: string;
}> {
  try {
    await requireSession();
    const trimmed = query.trim();
    if (!trimmed) return { success: true, data: [] };

    // Check if query looks like a channel URL, a handle, or a 24-character ID
    const isUrl = trimmed.includes("youtube.com") || trimmed.includes("youtu.be");
    const isHandle = trimmed.startsWith("@");
    const isChannelId = trimmed.startsWith("UC") && trimmed.length === 24;

    if (isUrl || isHandle || isChannelId) {
      const result = await getChannelInfo(trimmed);
      if (result) {
        return {
          success: true,
          data: [
            {
              channelId: result.channelId,
              title: result.title,
              handle: result.handle,
              thumbnailUrl: result.thumbnailUrl,
              subscriberCount: result.subscriberCount ?? 0,
            },
          ],
        };
      } else {
        return { success: true, data: [] };
      }
    }

    const results = await searchChannels(trimmed);
    return {
      success: true,
      data: results.map((r) => ({
        channelId: r.channelId,
        title: r.title,
        handle: r.handle,
        thumbnailUrl: r.thumbnailUrl,
        subscriberCount: r.subscriberCount ?? 0,
      })),
    };
  } catch (error) {
    console.error("[searchConsistencyChannels]", error);
    return { success: false, error: "Failed to search channels." };
  }
}

// ── Core analysis (pure math from YouTube upload timestamps) ─────────────────

export async function analyzeChannelConsistency(
  channel: ChannelSearchResult
): Promise<{ success: boolean; data?: ConsistencyData; error?: string }> {
  try {
    await requireSession();

    // Paginate the uploads playlist until we have at least 90 days of history
    // (or 300 videos max = 6 pages of 50, to protect API quota).
    // We stop early once the oldest video we have is already > 90 days ago.
    const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
    const cutoffDate = new Date(Date.now() - NINETY_DAYS_MS);
    const MAX_VIDEOS = 300;

    let rawVideos: Awaited<ReturnType<typeof getRecentVideos>>["videos"] = [];
    let nextPageToken: string | undefined;

    do {
      const page = await getRecentVideos(channel.channelId, 50, nextPageToken);
      rawVideos = rawVideos.concat(page.videos);
      nextPageToken = page.nextPageToken;

      // Stop if oldest video in current set is already before our cutoff
      const oldest = rawVideos.reduce(
        (min, v) => (new Date(v.publishedAt) < min ? new Date(v.publishedAt) : min),
        new Date()
      );
      if (oldest <= cutoffDate) break;
    } while (nextPageToken && rawVideos.length < MAX_VIDEOS);

    if (rawVideos.length === 0) {
      return {
        success: false,
        error: "No public videos found for this channel.",
      };
    }

    // Sort oldest → newest for interval calculations
    const sorted = [...rawVideos].sort(
      (a, b) =>
        new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    );

    // ── 1. Build upload data points with intervals ───────────────────────────
    const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const uploads: UploadDataPoint[] = sorted.map((v, i) => {
      const date = new Date(v.publishedAt);
      let intervalDays: number | null = null;
      if (i > 0) {
        const prev = new Date(sorted[i - 1].publishedAt);
        const diffDays = (date.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        intervalDays = parseFloat(diffDays.toFixed(1));
      }
      return {
        videoId: v.videoId,
        title: v.title,
        publishedAt: v.publishedAt,
        viewCount: v.viewCount,
        intervalDays,
        weekLabel: `V${i + 1}`,
        dayOfWeek: date.getDay(),
      };
    });

    // ── 2. Compute interval statistics ───────────────────────────────────────
    const intervals = uploads
      .map((u) => u.intervalDays)
      .filter((d): d is number => d !== null);

    const totalVideosAnalyzed = rawVideos.length;

    let averageIntervalDays = 0;
    let medianIntervalDays = 0;
    let minIntervalDays = 0;
    let maxIntervalDays = 0;
    let stdDevDays = 0;

    if (intervals.length > 0) {
      const sum = intervals.reduce((a, b) => a + b, 0);
      averageIntervalDays = parseFloat((sum / intervals.length).toFixed(1));

      const sorted2 = [...intervals].sort((a, b) => a - b);
      const mid = Math.floor(sorted2.length / 2);
      medianIntervalDays =
        sorted2.length % 2 === 0
          ? parseFloat(((sorted2[mid - 1] + sorted2[mid]) / 2).toFixed(1))
          : sorted2[mid];

      minIntervalDays = sorted2[0];
      maxIntervalDays = sorted2[sorted2.length - 1];

      const sqDiffs = intervals.map((x) =>
        Math.pow(x - averageIntervalDays, 2)
      );
      stdDevDays = parseFloat(
        Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / intervals.length).toFixed(1)
      );
    }

    // ── 3. Regularity label ──────────────────────────────────────────────────
    let regularityLabel: ConsistencyData["regularityLabel"] = "Highly Consistent";
    if (stdDevDays > 6) regularityLabel = "Irregular";
    else if (stdDevDays > 2.5) regularityLabel = "Moderate";

    // ── 4. Cadence label ────────────────────────────────────────────────────
    let cadenceLabel: string;
    if (averageIntervalDays === 0) {
      cadenceLabel = "Multiple per day";
    } else if (averageIntervalDays < 2) {
      cadenceLabel = "~Daily";
    } else if (averageIntervalDays <= 4) {
      cadenceLabel = `~Every ${Math.round(averageIntervalDays)} days`;
    } else if (averageIntervalDays <= 9) {
      cadenceLabel = "~Weekly";
    } else if (averageIntervalDays <= 20) {
      cadenceLabel = "~Bi-weekly";
    } else {
      cadenceLabel = "~Monthly or less";
    }

    // ── 5. Day-of-week distribution ─────────────────────────────────────────
    const dayCount = [0, 0, 0, 0, 0, 0, 0]; // index 0=Sun..6=Sat
    uploads.forEach((u) => dayCount[u.dayOfWeek]++);
    const dayOfWeekBuckets: DayOfWeekBucket[] = DAY_LABELS.map((day, i) => ({
      day,
      uploads: dayCount[i],
    }));
    const bestDayIndex = dayCount.indexOf(Math.max(...dayCount));
    const bestUploadDay = DAY_LABELS[bestDayIndex];

    // ── 6. Weekly buckets (last 12 weeks) ───────────────────────────────────
    const now = new Date();
    const weeklyBuckets: WeeklyBucket[] = [];
    for (let w = 11; w >= 0; w--) {
      const weekEnd = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000);
      const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
      const count = uploads.filter((u) => {
        const d = new Date(u.publishedAt);
        return d >= weekStart && d < weekEnd;
      }).length;
      weeklyBuckets.push({
        label: weekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        uploads: count,
      });
    }

    // ── 7. Velocity trend (last 4 weeks vs prior 4 weeks) ───────────────────
    const last4 = weeklyBuckets.slice(-4).reduce((a, b) => a + b.uploads, 0);
    const prior4 = weeklyBuckets.slice(-8, -4).reduce((a, b) => a + b.uploads, 0);
    let velocityTrend: ConsistencyData["velocityTrend"] = "flat";
    if (last4 > prior4 + 1) velocityTrend = "up";
    else if (last4 < prior4 - 1) velocityTrend = "down";

    // ── 8. Longest streak (consecutive weeks ≥ 1 upload) ────────────────────
    let longestStreakWeeks = 0;
    let currentStreak = 0;
    for (const b of weeklyBuckets) {
      if (b.uploads > 0) {
        currentStreak++;
        longestStreakWeeks = Math.max(longestStreakWeeks, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    // ── 9. Longest gap ───────────────────────────────────────────────────────
    const longestGapDays = maxIntervalDays;

    return {
      success: true,
      data: {
        channel,
        uploads: [...uploads].reverse(), // newest first for display
        averageIntervalDays,
        medianIntervalDays,
        minIntervalDays,
        maxIntervalDays,
        stdDevDays,
        totalVideosAnalyzed,
        longestStreakWeeks,
        longestGapDays,
        velocityTrend,
        regularityLabel,
        cadenceLabel,
        bestUploadDay,
        weeklyBuckets,
        dayOfWeekBuckets,
      },
    };
  } catch (error) {
    console.error("[analyzeChannelConsistency]", error);
    const msg =
      error instanceof Error ? error.message : "Failed to analyse channel.";
    return { success: false, error: msg };
  }
}
