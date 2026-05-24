import { prisma } from '@/lib/prisma';
import { refreshAccessToken } from './oauth';

/**
 * Returns a valid (non-expired) access token for a user.
 * Auto-refreshes if the token has expired or is expiring within 5 min.
 */
export async function getValidAccessToken(userId: string): Promise<string | null> {
  const conn = await prisma.youtubeConnection.findUnique({
    where: { userId },
    select: { accessToken: true, refreshToken: true, tokenExpiresAt: true },
  });

  if (!conn) return null;

  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

  if (conn.tokenExpiresAt > fiveMinutesFromNow) {
    return conn.accessToken;
  }

  // Token is expired or about to expire — refresh it
  try {
    const refreshed = await refreshAccessToken(conn.refreshToken);
    const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000);

    await prisma.youtubeConnection.update({
      where: { userId },
      data: {
        accessToken: refreshed.access_token,
        tokenExpiresAt: newExpiry,
      },
    });

    return refreshed.access_token;
  } catch {
    // Refresh failed — user needs to reconnect
    return null;
  }
}
