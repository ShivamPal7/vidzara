"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Feature } from "../../prisma/generated/prisma/enums";
import { getCreditCost, CreditCostContext } from "@/lib/credits";
import { revalidatePath } from "next/cache";

// Server-side in-memory cache for user credits to avoid DB reads on every request
// Key: userId, Value: { credits: number, lastChecked: number }
const serverCreditsCache = new Map<string, { credits: number; lastChecked: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

/**
 * Gets the current credit balance for the authenticated user.
 */
export async function getUserCreditsAction() {
  try {
    const userId = await getAuthenticatedUserId();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        credits: true, 
        createdAt: true,
        userProfile: { select: { country: true } },
        subscription: { select: { plan: true, billingCycle: true, status: true, gatewaySubscriptionId: true } } 
      },
    });
    
    if (!user) {
      return { success: false as const, error: "User not found" };
    }

    // Populate or refresh cache
    serverCreditsCache.set(userId, { credits: user.credits, lastChecked: Date.now() });
    
    const hasBoughtSubscription = !!(user.subscription?.gatewaySubscriptionId || (user.subscription && user.subscription.plan !== "FREE"));
    
    return { 
      success: true as const, 
      credits: user.credits, 
      plan: user.subscription?.plan || "FREE",
      billingCycle: user.subscription?.billingCycle || "MONTHLY",
      createdAt: user.createdAt,
      country: user.userProfile?.country || "US",
      subscriptionStatus: user.subscription?.status || null,
      hasBoughtSubscription
    };
  } catch (error) {
    console.error("Get User Credits Error:", error);
    return { success: false as const, error: "Failed to fetch credits" };
  }
}

/**
 * Checks if the user has enough credits to perform an action.
 */
export async function checkCreditsAction(feature: Feature, context?: CreditCostContext) {
  try {
    const userId = await getAuthenticatedUserId();
    const now = Date.now();
    let cached = serverCreditsCache.get(userId);

    if (!cached || now - cached.lastChecked > CACHE_TTL_MS) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });
      
      if (!user) {
        return { success: false as const, error: "User not found", allowed: false, cost: 0, currentCredits: 0 };
      }

      cached = { credits: user.credits, lastChecked: now };
      serverCreditsCache.set(userId, cached);
    }
    
    const cost = getCreditCost(feature, context);
    const allowed = cached.credits >= cost;
    
    return { success: true as const, allowed, cost, currentCredits: cached.credits };
  } catch (error) {
    console.error("Check Credits Error:", error);
    return { success: false as const, error: "Failed to check credits", allowed: false, cost: 0, currentCredits: 0 };
  }
}

/**
 * Deducts credits for a specific action.
 * Returns success: true if credits were successfully deducted.
 */
export async function deductCreditsAction(feature: Feature, context?: CreditCostContext) {
  try {
    const userId = await getAuthenticatedUserId();
    const now = Date.now();
    let cached = serverCreditsCache.get(userId);

    // Fetch credits from database on cache miss or expiration
    if (!cached || now - cached.lastChecked > CACHE_TTL_MS) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { credits: true },
      });
      
      if (!user) {
        return { success: false as const, error: "User not found" };
      }

      cached = { credits: user.credits, lastChecked: now };
      serverCreditsCache.set(userId, cached);
    }
    
    const cost = getCreditCost(feature, context);
    
    // Growth Dashboard is free
    if (cost === 0) {
      return { success: true as const, remainingCredits: cached.credits, cost };
    }
    
    if (cached.credits < cost) {
      return { success: false as const, error: "Insufficient credits. Please upgrade or purchase more credits." };
    }
    
    const nextCredits = cached.credits - cost;

    // 1. Immediately update global credit state in cache (secure prevention of double spend/exploits)
    serverCreditsCache.set(userId, { credits: nextCredits, lastChecked: now });
    
    // 2. Decrement in the database asynchronously in the background (fire-and-forget)
    prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: cost } },
    }).catch((err) => {
      console.error("[Async] Failed to deduct credits in background:", err);
    });
    
    return { success: true as const, remainingCredits: nextCredits, cost };
  } catch (error) {
    console.error("Deduct Credits Error:", error);
    return { success: false as const, error: "Failed to deduct credits" };
  }
}
