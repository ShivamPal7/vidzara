import { env } from "process";

const API_KEY = process.env.YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YouTubeChannel {
  channelId: string;
  title: string;
  handle?: string;
  thumbnailUrl: string;
  subscriberCount?: number;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

export async function searchChannels(query: string): Promise<YouTubeChannel[]> {
  if (!API_KEY) throw new Error("YOUTUBE_API_KEY is not configured.");
  
  const res = await fetch(`${BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=5&key=${API_KEY}`);
  const data = await res.json();
  
  if (!data.items || data.items.length === 0) return [];
  
  const channelIds = data.items.map((item: any) => item.id.channelId).join(",");
  const channelsRes = await fetch(`${BASE_URL}/channels?part=snippet,statistics&id=${channelIds}&key=${API_KEY}`);
  const channelsData = await channelsRes.json();

  if (!channelsData.items) return [];

  return channelsData.items.map((item: any) => ({
    channelId: item.id,
    title: item.snippet.title,
    handle: item.snippet.customUrl,
    thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    subscriberCount: parseInt(item.statistics?.subscriberCount || "0", 10),
  }));
}

export async function getChannelInfo(query: string): Promise<YouTubeChannel | null> {
  if (!API_KEY) {
    throw new Error("YOUTUBE_API_KEY is not configured.");
  }

  let searchQuery = query.trim();
  let isChannelId = false;
  let isHandle = false;

  // Extract from URL if necessary
  if (searchQuery.includes("youtube.com") || searchQuery.includes("youtu.be")) {
    try {
      const url = new URL(searchQuery);
      const pathname = url.pathname;
      
      if (pathname.startsWith("/@")) {
        searchQuery = pathname.split("/")[1];
        isHandle = true;
      } else if (pathname.startsWith("/channel/")) {
        searchQuery = pathname.split("/")[2];
        isChannelId = true;
      } else if (pathname.startsWith("/c/")) {
        searchQuery = pathname.split("/")[2];
      } else if (pathname.startsWith("/user/")) {
        searchQuery = pathname.split("/")[2];
      }
    } catch (e) {
      console.warn("[YouTube API] URL parsing failed, treating as generic search:", searchQuery);
    }
  } else if (searchQuery.startsWith("UC") && searchQuery.length === 24) {
    isChannelId = true;
  } else if (searchQuery.startsWith("@")) {
    isHandle = true;
  }

  if (isChannelId) {
    const res = await fetch(`${BASE_URL}/channels?part=snippet,statistics&id=${searchQuery}&key=${API_KEY}`);
    const data = await res.json();
    
    if (!data.items || data.items.length === 0) return null;
    const item = data.items[0];
    return {
      channelId: item.id,
      title: item.snippet.title,
      handle: item.snippet.customUrl,
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
      subscriberCount: parseInt(item.statistics?.subscriberCount || "0", 10),
    };
  } else if (isHandle) {
    const res = await fetch(`${BASE_URL}/channels?part=snippet,statistics&forHandle=${encodeURIComponent(searchQuery)}&key=${API_KEY}`);
    const data = await res.json();
    
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      return {
        channelId: item.id,
        title: item.snippet.title,
        handle: item.snippet.customUrl,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        subscriberCount: parseInt(item.statistics?.subscriberCount || "0", 10),
      };
    }
  }

  // Search for channel (Fallback or generic query)
  const res = await fetch(`${BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(searchQuery)}&maxResults=1&key=${API_KEY}`);
  const data = await res.json();
  
  if (data.error) {
    return null;
  }

  if (!data.items || data.items.length === 0) return null;
  const item = data.items[0];
  
  const channelId = item.id.channelId;
  
  const channelRes = await fetch(`${BASE_URL}/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`);
  const channelData = await channelRes.json();
  const detailedItem = channelData.items?.[0];

  return {
    channelId,
    title: detailedItem?.snippet.title || item.snippet.title,
    handle: detailedItem?.snippet.customUrl,
    thumbnailUrl: detailedItem?.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    subscriberCount: parseInt(detailedItem?.statistics?.subscriberCount || "0", 10),
  };
}

export async function getRecentVideos(
  channelId: string,
  maxResults = 10,
  pageToken?: string
): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
  if (!API_KEY) throw new Error("YOUTUBE_API_KEY is not configured.");

  // Step 1: Get the channel's "uploads" playlist ID (costs 1 unit)
  const channelRes = await fetch(
    `${BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`
  );
  const channelData = await channelRes.json();

  if (channelData.error) {
    console.error(`[getRecentVideos] Channel lookup failed for ${channelId}:`, channelData.error?.reason);
    return { videos: [] };
  }

  const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    console.warn(`[getRecentVideos] No uploads playlist found for channel: ${channelId}`);
    return { videos: [] };
  }

  // Step 2: Fetch recent videos from the uploads playlist (costs 1 unit)
  const pageTokenParam = pageToken ? `&pageToken=${pageToken}` : "";
  const playlistRes = await fetch(
    `${BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}${pageTokenParam}&key=${API_KEY}`
  );
  const playlistData = await playlistRes.json();

  if (!playlistData.items || playlistData.items.length === 0) {
    return { videos: [] };
  }

  const videoIds = playlistData.items
    .map((item: any) => item.snippet?.resourceId?.videoId)
    .filter(Boolean)
    .join(",");

  if (!videoIds) return { videos: [] };

  // Step 3: Get statistics for those videos (costs 1 unit)
  const statsRes = await fetch(
    `${BASE_URL}/videos?part=statistics&id=${videoIds}&key=${API_KEY}`
  );
  const statsData = await statsRes.json();
  const statsMap = new Map<string, any>();

  if (statsData.items) {
    for (const item of statsData.items) {
      statsMap.set(item.id, item.statistics);
    }
  }

  // Step 4: Combine snippet and statistics
  const videos: YouTubeVideo[] = playlistData.items
    .map((item: any) => {
      const videoId = item.snippet?.resourceId?.videoId;
      if (!videoId) return null;
      const stats = statsMap.get(videoId) || {};
      return {
        videoId,
        title: item.snippet.title,
        publishedAt: item.snippet.publishedAt,
        viewCount: parseInt(stats.viewCount || "0", 10),
        likeCount: parseInt(stats.likeCount || "0", 10),
        commentCount: parseInt(stats.commentCount || "0", 10),
      };
    })
    .filter(Boolean) as YouTubeVideo[];

  return { videos, nextPageToken: playlistData.nextPageToken };
}

export function findOutliers(videos: YouTubeVideo[], thresholdMultiplier = 1.5): { outliers: YouTubeVideo[], averageViews: number } {
  if (videos.length === 0) return { outliers: [], averageViews: 0 };
  
  const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
  const averageViews = totalViews / videos.length;
  
  // Find videos that perform significantly better than average
  const outliers = videos
    .filter(v => v.viewCount >= averageViews * thresholdMultiplier)
    .sort((a, b) => b.viewCount - a.viewCount);
    
  return { outliers, averageViews };
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

export function getTimeAgo(date: string | Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return years === 1 ? "1 year ago" : `${years} years ago`;
  if (months > 0) return months === 1 ? "1 month ago" : `${months} months ago`;
  if (days > 0) return days === 1 ? "1 day ago" : `${days} days ago`;
  if (hours > 0) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  if (minutes > 0) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  return "Just now";
}
