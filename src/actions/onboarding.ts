"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGeoInfo } from "@/lib/geo";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { cookies } from "next/headers";
import { isGoogleProvider, isTempEmail, AFFILIATE_CREDITS_PER_SIGNUP } from "@/lib/affiliate-fraud";

const onboardingSchema = z.object({
  displayName: z.string().min(2).max(50),
  avatar: z.string().optional(),
  niche: z.string().min(1, "Please select an area of interest"),
  youtubeChannelId: z.string().optional(),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

export async function completeOnboarding(data: OnboardingData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const user = session.user;
  const validData = onboardingSchema.parse(data);
  const geo = await getGeoInfo();

  // Determine trial end date based on location
  // India: 1 month, Global: 48 hours
  const now = new Date();
  const trialEndsAt = new Date(now);
  
  if (geo.country === "IN") {
    trialEndsAt.setMonth(now.getMonth() + 1);
  } else {
    trialEndsAt.setHours(now.getHours() + 48);
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Upsert User Profile
      await tx.userProfile.upsert({
        where: { userId: user.id },
        update: {
          displayName: validData.displayName,
          avatar: validData.avatar,
          niche: validData.niche,
          youtubeChannelId: validData.youtubeChannelId,
          country: geo.country,
          onboardingComplete: true,
        },
        create: {
          userId: user.id,
          displayName: validData.displayName,
          avatar: validData.avatar,
          niche: validData.niche,
          youtubeChannelId: validData.youtubeChannelId,
          country: geo.country,
          onboardingComplete: true,
        },
      });

      // 2. Sync display name to User name
      await tx.user.update({
        where: { id: user.id },
        data: { name: validData.displayName },
      });

      // 3. Create Subscription (Free Trial) if not exists
      const existingSub = await tx.subscription.findUnique({
        where: { userId: user.id },
      });

      if (!existingSub) {
        await tx.subscription.create({
          data: {
            userId: user.id,
            plan: "FREE",
            status: "TRIALING",
            trialEndsAt: trialEndsAt,
            billingCycle: "MONTHLY",
          },
        });
      }
    });

    // Process referral cookie (separate try/catch - must NOT fail onboarding if this errors)
    try {
      const cookieStore = await cookies();
      const refCode = cookieStore.get('vidzara_ref')?.value;
      
      if (refCode) {
        const affiliate = await prisma.affiliate.findUnique({
          where: { referralCode: decodeURIComponent(refCode) },
        });
        
        if (affiliate) {
          // Anti-fraud: no self-referral
          const isSelf = affiliate.userId === user.id;
          // Anti-fraud: no existing referral for this user
          const existingReferral = await prisma.referral.findUnique({
            where: { referredUserId: user.id },
          });
          // Anti-fraud: no temp email
          const hasTemp = isTempEmail(user.email);
          
          if (!isSelf && !existingReferral && !hasTemp) {
            // Check if new user signed up via Google
            const userAccounts = await prisma.account.findMany({
              where: { userId: user.id },
              select: { providerId: true },
            });
            const isGoogleSignup = isGoogleProvider(userAccounts);
            
            // Create referral record
            await prisma.referral.create({
              data: {
                affiliateId: affiliate.id,
                referredUserId: user.id,
                status: isGoogleSignup ? 'CREDITED' : 'PENDING',
                isGoogleSignup,
                creditedAt: isGoogleSignup ? new Date() : null,
              },
            });
            
            // Only credit immediately for Google signups (prevents temp mail abuse)
            if (isGoogleSignup) {
              await prisma.affiliate.update({
                where: { id: affiliate.id },
                data: {
                  affiliateCredits: { increment: AFFILIATE_CREDITS_PER_SIGNUP },
                },
              });
            }
          }
        }
      }
    } catch (referralError) {
      console.error('[Referral] Failed to process referral cookie:', referralError);
    }

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Onboarding failed:", error);
    throw new Error("Failed to complete onboarding");
  }

  redirect("/dashboard");
}
