"use server";

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { headers } from "next/headers";
import { prisma, Plan } from "@/lib/prisma";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

async function checkAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }
}

/**
 * Retrieves the plan configs from the database.
 * If the configs don't exist, it seeds the database with the default values.
 */
export async function getPlanConfigs() {
  try {
    await checkAdmin();
  } catch (e) {
    throw e;
  }

  return await getPlanConfigsInternal();
}

/**
 * Internal helper to fetch plan configs without admin check,
 * useful for public/user endpoints.
 */
export async function getPlanConfigsInternal() {
  let configs = await prisma.planConfig.findMany();

  if (configs.length === 0) {
    // Seed defaults
    const defaults = [
      {
        plan: Plan.LIMITED_PRO,
        monthlyPriceINR: 999,
        yearlyPriceINR: 7999,
        monthlyPriceUSD: 19,
        yearlyPriceUSD: 190,
        monthlyCredits: 1200,
        yearlyCredits: 14400,
        razorpayPlanMonthlyINR: process.env.RAZORPAY_PLAN_CREATOR_MONTHLY_INR || null,
        razorpayPlanYearlyINR: process.env.RAZORPAY_PLAN_CREATOR_YEARLY_INR || null,
        razorpayPlanMonthlyUSD: null,
        razorpayPlanYearlyUSD: null,
      },
      {
        plan: Plan.UNLIMITED_PRO,
        monthlyPriceINR: 3499,
        yearlyPriceINR: 27999,
        monthlyPriceUSD: 59,
        yearlyPriceUSD: 590,
        monthlyCredits: 6000,
        yearlyCredits: 72000,
        razorpayPlanMonthlyINR: process.env.RAZORPAY_PLAN_STUDIO_MONTHLY_INR || null,
        razorpayPlanYearlyINR: process.env.RAZORPAY_PLAN_STUDIO_YEARLY_INR || null,
        razorpayPlanMonthlyUSD: null,
        razorpayPlanYearlyUSD: null,
      },
    ];

    await prisma.planConfig.createMany({
      data: defaults,
    });

    configs = await prisma.planConfig.findMany();
  }

  return configs;
}

interface UpdatePlanConfigInput {
  monthlyPriceINR: number;
  yearlyPriceINR: number;
  monthlyPriceUSD: number;
  yearlyPriceUSD: number;
  monthlyCredits: number;
  yearlyCredits: number;
}

/**
 * Updates a plan's prices and credits.
 * If prices have changed, creates new Razorpay plans dynamically.
 */
export async function updatePlanConfig(plan: Plan, data: UpdatePlanConfigInput) {
  await checkAdmin();

  const existing = await prisma.planConfig.findUnique({
    where: { plan },
  });

  if (!existing) {
    throw new Error("Plan configuration not found.");
  }

  const updates: Partial<typeof existing> = {
    monthlyPriceINR: data.monthlyPriceINR,
    yearlyPriceINR: data.yearlyPriceINR,
    monthlyPriceUSD: data.monthlyPriceUSD,
    yearlyPriceUSD: data.yearlyPriceUSD,
    monthlyCredits: data.monthlyCredits,
    yearlyCredits: data.yearlyCredits,
  };

  const planNamePrefix = plan === Plan.LIMITED_PRO ? "Creator Pro" : "Studio Unlimited";

  // Check if Razorpay is configured
  const hasRazorpay = !!(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

  if (hasRazorpay) {
    // Helper to create Razorpay Plan on price change
    const createRazorpayPlanIfNeeded = async (
      oldPrice: number,
      newPrice: number,
      period: "monthly" | "yearly",
      currency: "INR" | "USD",
      currentPlanId: string | null
    ) => {
      if (oldPrice !== newPrice || !currentPlanId) {
        try {
          const rpPlan = await razorpay.plans.create({
            period: period,
            interval: 1,
            item: {
              name: `${planNamePrefix} - ${period === "yearly" ? "Yearly" : "Monthly"} (${currency})`,
              amount: newPrice * 100, // paise / cents
              currency: currency,
              description: `${planNamePrefix} plan billed ${period}ly`,
            },
          });
          return rpPlan.id;
        } catch (error) {
          console.error(`Error creating Razorpay plan (${currency} ${period} ${newPrice}):`, error);
          return null; // Keep null if creation fails (e.g. account restrictions)
        }
      }
      return currentPlanId;
    };

    // Update Razorpay Plan IDs
    const monthlyINRId = await createRazorpayPlanIfNeeded(
      existing.monthlyPriceINR,
      data.monthlyPriceINR,
      "monthly",
      "INR",
      existing.razorpayPlanMonthlyINR
    );
    if (monthlyINRId) updates.razorpayPlanMonthlyINR = monthlyINRId;

    const yearlyINRId = await createRazorpayPlanIfNeeded(
      existing.yearlyPriceINR,
      data.yearlyPriceINR,
      "yearly",
      "INR",
      existing.razorpayPlanYearlyINR
    );
    if (yearlyINRId) updates.razorpayPlanYearlyINR = yearlyINRId;

    const monthlyUSDId = await createRazorpayPlanIfNeeded(
      existing.monthlyPriceUSD,
      data.monthlyPriceUSD,
      "monthly",
      "USD",
      existing.razorpayPlanMonthlyUSD
    );
    if (monthlyUSDId) updates.razorpayPlanMonthlyUSD = monthlyUSDId;

    const yearlyUSDId = await createRazorpayPlanIfNeeded(
      existing.yearlyPriceUSD,
      data.yearlyPriceUSD,
      "yearly",
      "USD",
      existing.razorpayPlanYearlyUSD
    );
    if (yearlyUSDId) updates.razorpayPlanYearlyUSD = yearlyUSDId;
  }

  const updated = await prisma.planConfig.update({
    where: { plan },
    data: updates,
  });

  return { success: true, config: updated };
}
