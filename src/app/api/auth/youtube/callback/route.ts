import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/youtube/oauth';
import { getChannelInfo } from '@/lib/youtube/analytics';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error || !code || !state) {
    return NextResponse.redirect(new URL('/dashboard/growth?error=oauth_denied', request.url));
  }

  try {
    // Decode state to get userId
    const { userId } = JSON.parse(Buffer.from(state, 'base64url').toString());
    if (!userId) throw new Error('Invalid state');

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);
    const tokenExpiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Fetch channel info
    const channelData = await getChannelInfo(tokens.access_token);
    const channel = channelData.items?.[0];
    if (!channel) throw new Error('No channel found');

    const channelId = channel.id;
    const channelTitle = channel.snippet?.title ?? 'Unknown';
    const channelHandle = channel.snippet?.customUrl ?? null;
    const thumbnailUrl = channel.snippet?.thumbnails?.default?.url ?? null;
    const subscriberCount = BigInt(channel.statistics?.subscriberCount ?? 0);

    // Upsert connection
    await prisma.youtubeConnection.upsert({
      where: { userId },
      create: {
        userId,
        channelId,
        channelTitle,
        channelHandle,
        thumbnailUrl,
        subscriberCount,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt,
      },
      update: {
        channelId,
        channelTitle,
        channelHandle,
        thumbnailUrl,
        subscriberCount,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt,
        updatedAt: new Date(),
      },
    });

    return NextResponse.redirect(new URL('/dashboard/growth?connected=true', request.url));
  } catch (err) {
    console.error('[YouTube OAuth Callback]', err);
    return NextResponse.redirect(new URL('/dashboard/growth?error=oauth_failed', request.url));
  }
}
