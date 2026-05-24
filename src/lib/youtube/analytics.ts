// YouTube Analytics API v2 wrapper

const ANALYTICS_BASE = 'https://youtubeanalytics.googleapis.com/v2/reports';
const DATA_BASE = 'https://www.googleapis.com/youtube/v3';

export interface AnalyticsQueryParams {
  channelId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  metrics: string;
  dimensions?: string;
  sort?: string;
  maxResults?: number;
  filters?: string;
}

export async function queryAnalytics(
  accessToken: string,
  params: AnalyticsQueryParams
) {
  const query = new URLSearchParams({
    ids: `channel==${params.channelId}`,
    startDate: params.startDate,
    endDate: params.endDate,
    metrics: params.metrics,
    ...(params.dimensions && { dimensions: params.dimensions }),
    ...(params.sort && { sort: params.sort }),
    ...(params.maxResults && { maxResults: String(params.maxResults) }),
    ...(params.filters && { filters: params.filters }),
  });

  const res = await fetch(`${ANALYTICS_BASE}?${query.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 3600 }, // Cache for 1 hour
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Analytics API error: ${err}`);
  }

  return res.json();
}

export async function getChannelInfo(accessToken: string) {
  const query = new URLSearchParams({
    part: 'snippet,statistics,brandingSettings',
    mine: 'true',
  });
  const res = await fetch(`${DATA_BASE}/channels?${query.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error('Failed to fetch channel info');
  return res.json();
}

export async function getChannelVideos(
  accessToken: string,
  channelId: string,
  maxResults = 50
) {
  // First get uploads playlist ID
  const chRes = await fetch(
    `${DATA_BASE}/channels?part=contentDetails&id=${channelId}&key=${process.env.YOUTUBE_API_KEY}`,
    { next: { revalidate: 3600 } }
  );
  const chData = await chRes.json();
  const uploadsId = chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsId) return [];

  const query = new URLSearchParams({
    part: 'snippet,contentDetails',
    playlistId: uploadsId,
    maxResults: String(maxResults),
  });
  const res = await fetch(`${DATA_BASE}/playlistItems?${query.toString()}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.items ?? [];
}
