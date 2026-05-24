import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { buildAuthUrl } from '@/lib/youtube/oauth';
import { randomBytes } from 'crypto';

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // State encodes userId to prevent CSRF
  const state = Buffer.from(JSON.stringify({ userId: session.user.id, nonce: randomBytes(8).toString('hex') })).toString('base64url');
  const url = buildAuthUrl(state);
  return NextResponse.redirect(url);
}
