import { prisma } from '@/lib/prisma';
import { AFFILIATE_CREDITS_PER_SIGNUP } from '@/lib/affiliate-fraud';

/**
 * Resolves pending referrals older than 24 hours by crediting affiliate credits.
 * Call this from a cron job or scheduled task.
 */
export async function resolvePendingReferrals(): Promise<{ resolved: number }> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const pendingReferrals = await prisma.referral.findMany({
    where: {
      status: 'PENDING',
      isGoogleSignup: true,
      createdAt: { lte: oneDayAgo },
    },
    include: { affiliate: true },
  });

  let resolved = 0;
  for (const referral of pendingReferrals) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.referral.update({
          where: { id: referral.id },
          data: { status: 'CREDITED', creditedAt: new Date() },
        });
        await tx.affiliate.update({
          where: { id: referral.affiliateId },
          data: { affiliateCredits: { increment: AFFILIATE_CREDITS_PER_SIGNUP } },
        });
      });
      resolved++;
    } catch (err) {
      console.error('[CreditResolver] Failed to resolve referral:', referral.id, err);
    }
  }

  return { resolved };
}
