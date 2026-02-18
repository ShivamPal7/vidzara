"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getGeoInfo } from "@/lib/geo";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"; // Removed Unused import: z
import { z } from "zod";

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

      // 2. Create Subscription (Free Trial) if not exists
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

    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Onboarding failed:", error);
    throw new Error("Failed to complete onboarding");
  }

  redirect("/dashboard");
}
