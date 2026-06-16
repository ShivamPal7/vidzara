"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma, Plan, BillingCycle } from "@/lib/prisma";
import { getPlanConfigsInternal } from "@/actions/admin/plan-config";

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

interface ValidateCouponInput {
  code: string;
  plan: Plan;
  billingCycle: BillingCycle;
  isIndia: boolean;
}

/**
 * Fetch active plan pricing configs from the database.
 */
export async function fetchPlanPricingAction() {
  try {
    const configs = await getPlanConfigsInternal();
    return { success: true as const, configs };
  } catch (error: any) {
    return { success: false as const, error: error.message || "Failed to fetch pricing" };
  }
}

/**
 * Validates a coupon and returns the discount details.
 */
export async function validateCouponAction({ code, plan, billingCycle, isIndia }: ValidateCouponInput) {
  try {
    const userId = await getAuthenticatedUserId();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode) {
      return { success: false as const, error: "Please enter a coupon code." };
    }

    // 1. Fetch coupon details
    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon) {
      return { success: false as const, error: "Invalid coupon code." };
    }

    // 2. Validate active status
    if (!coupon.active) {
      return { success: false as const, error: "This coupon is no longer active." };
    }

    // 3. Validate expiration date
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return { success: false as const, error: "This coupon has expired." };
    }

    // 4. Validate max uses limit
    if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
      return { success: false as const, error: "This coupon has reached its maximum usage limit." };
    }

    // 5. Validate country restriction
    if (coupon.country) {
      const couponCountry = coupon.country.toUpperCase();
      if (couponCountry === "IN" && !isIndia) {
        return { success: false as const, error: "This coupon is only valid for purchases in India." };
      }
      if (couponCountry !== "IN" && isIndia) {
        return { success: false as const, error: "This coupon is not valid for purchases in India." };
      }
    }

    // 6. Validate per-user limit
    const userUsageCount = await prisma.couponUsage.count({
      where: {
        couponId: coupon.id,
        userId: userId,
      },
    });

    if (coupon.perUserLimit !== null && userUsageCount >= coupon.perUserLimit) {
      return { success: false as const, error: "You have already used this coupon code." };
    }

    // 7. Fetch base pricing from configuration
    const config = await prisma.planConfig.findUnique({
      where: { plan },
    });

    let originalPrice = 0;
    if (isIndia) {
      if (plan === Plan.LIMITED_PRO) {
        originalPrice = billingCycle === BillingCycle.YEARLY 
          ? (config?.yearlyPriceINR ?? 7999) 
          : (config?.monthlyPriceINR ?? 999);
      } else if (plan === Plan.UNLIMITED_PRO) {
        originalPrice = billingCycle === BillingCycle.YEARLY 
          ? (config?.yearlyPriceINR ?? 27999) 
          : (config?.monthlyPriceINR ?? 3499);
      }
    } else {
      if (plan === Plan.LIMITED_PRO) {
        originalPrice = billingCycle === BillingCycle.YEARLY 
          ? (config?.yearlyPriceUSD ?? 190) 
          : (config?.monthlyPriceUSD ?? 19);
      } else if (plan === Plan.UNLIMITED_PRO) {
        originalPrice = billingCycle === BillingCycle.YEARLY 
          ? (config?.yearlyPriceUSD ?? 590) 
          : (config?.monthlyPriceUSD ?? 59);
      }
    }

    // 8. Calculate discount
    const discountAmount = Math.round((originalPrice * coupon.discountPercent) / 100);
    const discountedPrice = originalPrice - discountAmount;

    return {
      success: true as const,
      code: coupon.code,
      discountPercent: coupon.discountPercent,
      originalPrice,
      discountedPrice,
      discountAmount,
      currency: isIndia ? "INR" : "USD",
    };
  } catch (error: any) {
    console.error("Coupon validation error:", error);
    return { success: false as const, error: error.message || "Failed to validate coupon." };
  }
}
