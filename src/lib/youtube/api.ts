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
    const res = await fetch(`${BASE_URL}/channels?part=snippet&id=${searchQuery}&key=${API_KEY}`);
    const data = await res.json();
    
    if (!data.items || data.items.length === 0) return null;
    const item = data.items[0];
    return {
      channelId: item.id,
      title: item.snippet.title,
      handle: item.snippet.customUrl,
      thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    };
  } else if (isHandle) {
    const res = await fetch(`${BASE_URL}/channels?part=snippet&forHandle=${encodeURIComponent(searchQuery)}&key=${API_KEY}`);
    const data = await res.json();
    
    if (data.items && data.items.length > 0) {
      const item = data.items[0];
      return {
        channelId: item.id,
        title: item.snippet.title,
        handle: item.snippet.customUrl,
        thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
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
  
  const channelRes = await fetch(`${BASE_URL}/channels?part=snippet&id=${channelId}&key=${API_KEY}`);
  const channelData = await channelRes.json();
  const detailedItem = channelData.items?.[0];

  return {
    channelId,
    title: detailedItem?.snippet.title || item.snippet.title,
    handle: detailedItem?.snippet.customUrl,
    thumbnailUrl: detailedItem?.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
  };
}

export async function getRecentVideos(channelId: string, maxResults = 20): Promise<YouTubeVideo[]> {
  if (!API_KEY) throw new Error("YOUTUBE_API_KEY is not configured.");

  // 1. Get recent videos from search endpoint (ordered by date)
  const searchRes = await fetch(
    `${BASE_URL}/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=${maxResults}&key=${API_KEY}`
  );
  const searchData = await searchRes.json();
  
  if (!searchData.items || searchData.items.length === 0) {
    return [];
  }

  const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",");

  // 2. Get statistics for those videos
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

  // 3. Combine snippet and statistics
  const videos: YouTubeVideo[] = searchData.items.map((item: any) => {
    const stats = statsMap.get(item.id.videoId) || {};
    return {
      videoId: item.id.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      viewCount: parseInt(stats.viewCount || "0", 10),
      likeCount: parseInt(stats.likeCount || "0", 10),
      commentCount: parseInt(stats.commentCount || "0", 10),
    };
  });

  return videos;
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
