'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getValidAccessToken } from '@/lib/youtube/token-manager';
import { queryAnalytics } from '@/lib/youtube/analytics';

function getDateRange(period: string): { startDate: string; endDate: string; prevStartDate: string; prevEndDate: string } {
  const end = new Date();
  end.setDate(end.getDate() - 2); // Analytics has 2-day lag
  const days = period === '7d' ? 7 : period === '28d' ? 28 : period === '90d' ? 90 : 365;
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  const prevEnd = new Date(start);
  prevEnd.setDate(prevEnd.getDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - days);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { startDate: fmt(start), endDate: fmt(end), prevStartDate: fmt(prevStart), prevEndDate: fmt(prevEnd) };
}

async function requireYouTubeAuth() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error('Unauthorized');
  const accessToken = await getValidAccessToken(session.user.id);
  if (!accessToken) throw new Error('YouTube not connected or token expired');
  const conn = await prisma.youtubeConnection.findUnique({ where: { userId: session.user.id } });
  if (!conn) throw new Error('YouTube not connected');
  return { accessToken, channelId: conn.channelId, userId: session.user.id };
}

// Get connected channel info
export async function getConnectedChannel() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { success: false as const, error: 'Unauthorized' };
    const conn = await prisma.youtubeConnection.findUnique({
      where: { userId: session.user.id },
    });
    if (!conn) return { success: false as const, error: 'Not connected' };
    return { success: true as const, data: {
      channelId: conn.channelId,
      channelTitle: conn.channelTitle,
      channelHandle: conn.channelHandle,
      thumbnailUrl: conn.thumbnailUrl,
      subscriberCount: conn.subscriberCount.toString(),
      connectedAt: conn.connectedAt,
    }};
  } catch {
    return { success: false as const, error: 'Failed to get channel' };
  }
}

// KPI overview metrics
export async function getKPIMetrics(period = '28d') {
  try {
    const { accessToken, channelId } = await requireYouTubeAuth();
    const { startDate, endDate, prevStartDate, prevEndDate } = getDateRange(period);
    const metrics = 'views,estimatedMinutesWatched,subscribersGained,subscribersLost,impressions,impressionClickThroughRate,averageViewDuration';
    const [current, previous] = await Promise.all([
      queryAnalytics(accessToken, { channelId, startDate, endDate, metrics }),
      queryAnalytics(accessToken, { channelId, startDate: prevStartDate, endDate: prevEndDate, metrics }),
    ]);
    return { success: true as const, data: { current: current.rows?.[0] ?? [], previous: previous.rows?.[0] ?? [], columnHeaders: current.columnHeaders } };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed';
    return { success: false as const, error: msg };
  }
}

// Daily views & watch time chart
export async function getViewsChartData(period = '28d') {
  try {
    const { accessToken, channelId } = await requireYouTubeAuth();
    const { startDate, endDate } = getDateRange(period);
    const data = await queryAnalytics(accessToken, {
      channelId, startDate, endDate,
      metrics: 'views,estimatedMinutesWatched',
      dimensions: 'day',
      sort: 'day',
    });
    return { success: true as const, data: data.rows ?? [] };
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : 'Failed' };
  }
}

// Daily subscriber gain/loss
export async function getSubscriberChartData(period = '28d') {
  try {
    const { accessToken, channelId } = await requireYouTubeAuth();
    const { startDate, endDate } = getDateRange(period);
    const data = await queryAnalytics(accessToken, {
      channelId, startDate, endDate,
      metrics: 'subscribersGained,subscribersLost',
      dimensions: 'day',
      sort: 'day',
    });
    return { success: true as const, data: data.rows ?? [] };
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : 'Failed' };
  }
}

// Traffic sources
export async function getTrafficSources(period = '28d') {
  try {
    const { accessToken, channelId } = await requireYouTubeAuth();
    const { startDate, endDate } = getDateRange(period);
    const data = await queryAnalytics(accessToken, {
      channelId, startDate, endDate,
      metrics: 'views,estimatedMinutesWatched',
      dimensions: 'trafficSourceType',
      sort: '-views',
    });
    return { success: true as const, data: data.rows ?? [] };
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : 'Failed' };
  }
}

// Demographics
export async function getDemographics(period = '28d') {
  try {
    const { accessToken, channelId } = await requireYouTubeAuth();
    const { startDate, endDate } = getDateRange(period);
    const data = await queryAnalytics(accessToken, {
      channelId, startDate, endDate,
      metrics: 'viewerPercentage',
      dimensions: 'ageGroup,gender',
    });
    return { success: true as const, data: data.rows ?? [] };
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : 'Failed' };
  }
}

// Top countries
export async function getTopCountries(period = '28d') {
  try {
    const { accessToken, channelId } = await requireYouTubeAuth();
    const { startDate, endDate } = getDateRange(period);
    const data = await queryAnalytics(accessToken, {
      channelId, startDate, endDate,
      metrics: 'views,estimatedMinutesWatched',
      dimensions: 'country',
      sort: '-views',
      maxResults: 10,
    });
    return { success: true as const, data: data.rows ?? [] };
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : 'Failed' };
  }
}

// Device types
export async function getDeviceBreakdown(period = '28d') {
  try {
    const { accessToken, channelId } = await requireYouTubeAuth();
    const { startDate, endDate } = getDateRange(period);
    const data = await queryAnalytics(accessToken, {
      channelId, startDate, endDate,
      metrics: 'views',
      dimensions: 'deviceType',
      sort: '-views',
    });
    return { success: true as const, data: data.rows ?? [] };
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : 'Failed' };
  }
}

// Top videos
export async function getTopVideos(period = '28d') {
  try {
    const { accessToken, channelId } = await requireYouTubeAuth();
    const { startDate, endDate } = getDateRange(period);
    const data = await queryAnalytics(accessToken, {
      channelId, startDate, endDate,
      metrics: 'views,estimatedMinutesWatched,likes,comments,averageViewDuration,impressionClickThroughRate',
      dimensions: 'video',
      sort: '-views',
      maxResults: 20,
    });
    return { success: true as const, data: data.rows ?? [], columnHeaders: data.columnHeaders };
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : 'Failed' };
  }
}

// Impressions & CTR over time
export async function getImpressionsCTR(period = '28d') {
  try {
    const { accessToken, channelId } = await requireYouTubeAuth();
    const { startDate, endDate } = getDateRange(period);
    const data = await queryAnalytics(accessToken, {
      channelId, startDate, endDate,
      metrics: 'impressions,impressionClickThroughRate',
      dimensions: 'day',
      sort: 'day',
    });
    return { success: true as const, data: data.rows ?? [] };
  } catch (err) {
    return { success: false as const, error: err instanceof Error ? err.message : 'Failed' };
  }
}
