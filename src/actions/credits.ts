"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Feature } from "../../prisma/generated/prisma/enums";
import { getCreditCost, CreditCostContext } from "@/lib/credits";
import { revalidatePath } from "next/cache";

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
      select: { credits: true, subscription: { select: { plan: true, billingCycle: true } } },
    });
    
    if (!user) {
      return { success: false as const, error: "User not found" };
    }
    
    return { 
      success: true as const, 
      credits: user.credits, 
      plan: user.subscription?.plan || "FREE",
      billingCycle: user.subscription?.billingCycle || "MONTHLY"
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    
    if (!user) {
      return { success: false as const, error: "User not found", allowed: false, cost: 0, currentCredits: 0 };
    }
    
    const cost = getCreditCost(feature, context);
    const allowed = user.credits >= cost;
    
    return { success: true as const, allowed, cost, currentCredits: user.credits };
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });
    
    if (!user) {
      return { success: false as const, error: "User not found" };
    }
    
    const cost = getCreditCost(feature, context);
    
    // Growth Dashboard is free
    if (cost === 0) {
      return { success: true as const, remainingCredits: user.credits, cost };
    }
    
    if (user.credits < cost) {
      return { success: false as const, error: "Insufficient credits. Please upgrade or purchase more credits." };
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: cost } },
    });
    
    return { success: true as const, remainingCredits: updatedUser.credits, cost };
  } catch (error) {
    console.error("Deduct Credits Error:", error);
    return { success: false as const, error: "Failed to deduct credits" };
  }
}
