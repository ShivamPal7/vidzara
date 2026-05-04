"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getRecentVideos, formatNumber, findOutliers, getTimeAgo, searchChannels } from "@/lib/youtube/api";

// ── Helpers ─────────────────────────────────────────────────────────────

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

// ── Actions ─────────────────────────────────────────────────────────────

export async function getTopCompetitorVideos(
  competitorIds: string[],
  pageTokens: Record<string, string> = {}
) {
  try {
    const userId = await getAuthenticatedUserId();
    
    if (!competitorIds || competitorIds.length === 0) {
      return { success: true, data: [], nextPageTokens: {} };
    }

    const competitors = await prisma.competitor.findMany({
      where: {
        userId,
        id: { in: competitorIds }
      }
    });

    if (competitors.length === 0) return { success: true, data: [], nextPageTokens: {} };

    // Batch fetch subscriber counts in 1 API call
    const channelIdsStr = competitors.map(c => c.channelId).join(",");
    const statsRes = await fetch(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIdsStr}&key=${process.env.YOUTUBE_API_KEY}`);
    const statsData = await statsRes.json();
    
    const statsMap = new Map();
    if (statsData.items) {
      for (const item of statsData.items) {
        statsMap.set(item.id, item.statistics);
      }
    }

    const allVideos: any[] = [];
    const nextPageTokens: Record<string, string> = {};

    // Fetch 50 videos per channel concurrently for better outlier detection and top-video discovery
    // playlistItems.list returns up to 50 items in one request (1 quota unit)
    await Promise.all(competitors.map(async (comp) => {
      const stats = statsMap.get(comp.channelId);
      const subs = stats?.subscriberCount ? parseInt(stats.subscriberCount, 10) : 0;
      const pageToken = pageTokens[comp.id];

      const { videos: recentVideos, nextPageToken } = await getRecentVideos(comp.channelId, 50, pageToken);
      if (nextPageToken) nextPageTokens[comp.id] = nextPageToken;

      const { averageViews } = findOutliers(recentVideos);

      for (const video of recentVideos) {
        // Calculate Outlier Score
        let outlierScore = null;
        if (averageViews > 0 && video.viewCount > 0) {
           outlierScore = parseFloat((video.viewCount / averageViews).toFixed(1));
        }

        // Calculate VPH
        const now = new Date();
        const publishedAt = new Date(video.publishedAt);
        const hoursDiff = Math.max(1, (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60));
        const viewsPerHour = Math.round(video.viewCount / hoursDiff);

        allVideos.push({
          id: video.videoId,
          title: video.title,
          channel: comp.channelName,
          channelId: comp.id, 
          youtubeChannelId: comp.channelId,
          channelHandle: comp.channelHandle ?? null,
          subs: formatNumber(subs),
          timeAgo: getTimeAgo(video.publishedAt),
          publishedAt: video.publishedAt,
          thumbnail: `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`,
          views: video.viewCount,
          outlierScore: outlierScore,
          viewsPerHour: viewsPerHour,
        });
      }
    }));

    allVideos.sort((a, b) => b.views - a.views);
    return { success: true, data: allVideos, nextPageTokens };
  } catch (error: any) {
    console.error("Get Top Videos Error:", error);
    return { success: false, error: error.message || "Failed to fetch top videos.", nextPageTokens: {} };
  }
}

export async function getChannelStats(competitorIds: string[]) {
  try {
    const userId = await getAuthenticatedUserId();
    
    if (!competitorIds || competitorIds.length === 0) {
      return { success: true, data: [] };
    }

    const competitors = await prisma.competitor.findMany({
      where: { userId, id: { in: competitorIds } }
    });
    
    if (competitors.length === 0) return { success: true, data: [] };

    // Batch fetch statistics for all channels
    const channelIdsStr = competitors.map(c => c.channelId).join(",");
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIdsStr}&key=${process.env.YOUTUBE_API_KEY}`
    );
    const data = await res.json();
    
    const statsMap = new Map();
    if (data.items) {
      for (const item of data.items) {
        statsMap.set(item.id, item.statistics);
      }
    }
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const statsData = await Promise.all(competitors.map(async (comp) => {
      const stats = statsMap.get(comp.channelId) || {};
      
      // Fetch up to 50 recent videos to calculate period stats
      const { videos } = await getRecentVideos(comp.channelId, 50);
      
      let views7d = 0;
      let videos7d = 0;
      let views30d = 0;
      let videos30d = 0;

      videos.forEach(v => {
        const pubDate = new Date(v.publishedAt);
        if (pubDate >= sevenDaysAgo) {
          views7d += v.viewCount;
          videos7d++;
        }
        if (pubDate >= thirtyDaysAgo) {
          views30d += v.viewCount;
          videos30d++;
        }
      });

      return {
        channelId: comp.id,
        youtubeChannelId: comp.channelId,
        channel: comp.channelName,
        avatar: comp.thumbnailUrl,
        handle: comp.channelHandle,
        subscriberCount: formatNumber(parseInt(stats.subscriberCount || "0")),
        totalViews: formatNumber(parseInt(stats.viewCount || "0")),
        videoCount: parseInt(stats.videoCount || "0"),
        views7d: formatNumber(views7d),
        videos7d,
        views30d: formatNumber(views30d),
        videos30d,
      };
    }));
    
    return { success: true, data: statsData };
  } catch (error) {
    console.error("Get Channel Stats Error:", error);
    return { success: false, error: "Failed to fetch channel stats." };
  }
}

export async function deleteCompetitor(competitorId: string) {
  try {
    const userId = await getAuthenticatedUserId();
    await prisma.competitor.delete({
      where: { id: competitorId, userId }
    });
    return { success: true };
  } catch (error) {
    console.error("Delete Competitor Error:", error);
    return { success: false, error: "Failed to remove competitor." };
  }
}

export async function getCompetitors() {
  try {
    const userId = await getAuthenticatedUserId();
    const competitors = await prisma.competitor.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: competitors };
  } catch (error) {
    console.error("Get Competitors Error:", error);
    return { success: false, error: "Failed to fetch competitors." };
  }
}

export async function addCompetitorDirectly(channelInfo: any) {
  try {
    const userId = await getAuthenticatedUserId();
    
    // Check if already exists
    const existing = await prisma.competitor.findFirst({
      where: { userId, channelId: channelInfo.channelId }
    });
    
    if (existing) {
      return { success: false, error: "Competitor already added." };
    }

    const competitor = await prisma.competitor.create({
      data: {
        userId,
        channelId: channelInfo.channelId,
        channelName: channelInfo.title,
        channelHandle: channelInfo.handle,
        thumbnailUrl: channelInfo.thumbnailUrl,
      }
    });

    return { success: true, data: competitor };
  } catch (error) {
    console.error("Add Competitor Error:", error);
    return { success: false, error: "Failed to add competitor." };
  }
}

export async function searchYouTubeChannels(query: string) {
  try {
    const results = await searchChannels(query);
    return { success: true, data: results };
  } catch (error) {
    console.error("Search Channels Error:", error);
    return { success: false, error: "Failed to search channels." };
  }
}
