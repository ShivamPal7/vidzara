import { NextRequest, NextResponse } from 'next/server';
import { resolvePendingReferrals } from '@/lib/affiliate-credit-resolver';

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const result = await resolvePendingReferrals();
  return NextResponse.json({ success: true, ...result });
}
