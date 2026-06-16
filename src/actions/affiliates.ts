"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { WithdrawalMethod } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

// Conversion rates
// INR:  1 affiliate credit = ₹0.05  →  min 20 000 credits = ₹1 000
// USD:  1 affiliate credit = $0.001  →  min 20 000 credits = $20
const INR_RATE = 0.05;
const USD_RATE = 0.001;
const MIN_CREDITS_INR = 20_000;
const MIN_CREDITS_USD = 20_000;

// Usage-credit conversion: 20 affiliate credits = 1 usage credit
const AFFILIATE_TO_USAGE_RATE = 20;


// ---------------------------------------------------------------------------
// Update referral handle (self-service by affiliate)
// ---------------------------------------------------------------------------

export async function updateReferralHandle(
  newHandle: string
): Promise<{ success: boolean; error?: string; handle?: string }> {
  try {
    const userId = await getAuthenticatedUserId();

    // --- Validate format: 3–40 chars, letters/numbers/hyphens/underscores only ---
    const trimmed = newHandle.trim().toLowerCase();
    if (!trimmed) return { success: false, error: "Handle cannot be empty." };
    if (trimmed.length < 3)
      return { success: false, error: "Handle must be at least 3 characters." };
    if (trimmed.length > 40)
      return { success: false, error: "Handle must be 40 characters or fewer." };
    if (!/^[a-z0-9][a-z0-9_-]*[a-z0-9]$/.test(trimmed))
      return {
        success: false,
        error:
          "Handle can only contain lowercase letters, numbers, hyphens, and underscores. It must start and end with a letter or number.",
      };

    const affiliate = await prisma.affiliate.findUnique({ where: { userId } });
    if (!affiliate) return { success: false, error: "Affiliate account not found." };
    if (!affiliate.enabled)
      return { success: false, error: "Your affiliate account is currently disabled." };

    // --- No change needed ---
    if (affiliate.referralCode === trimmed) return { success: true, handle: trimmed };

    // --- Rate limit: 1 change per 10 days ---
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    if (affiliate.updatedAt > tenDaysAgo) {
      const nextAllowed = new Date(affiliate.updatedAt.getTime() + 10 * 24 * 60 * 60 * 1000);
      const daysLeft = Math.ceil(
        (nextAllowed.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return {
        success: false,
        error: `You can only change your handle once every 10 days. Try again in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}.`,
      };
    }

    // --- Uniqueness check ---
    const existing = await prisma.affiliate.findUnique({
      where: { referralCode: trimmed },
    });
    if (existing) return { success: false, error: "This handle is already taken. Please choose another." };

    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: { referralCode: trimmed },
    });

    revalidatePath("/dashboard/affiliate");
    return { success: true, handle: trimmed };
  } catch (error) {
    console.error("[updateReferralHandle] Error:", error);
    return { success: false, error: "Failed to update handle. Please try again." };
  }
}

// ---------------------------------------------------------------------------
// Apply for affiliate program
// ---------------------------------------------------------------------------

export async function applyForAffiliate(data: {
  channelLink?: string;
  niche: string;
  socialLinks?: { instagram?: string; twitter?: string; youtube?: string; tiktok?: string };
  motivation?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getAuthenticatedUserId();

    // Prevent duplicate applications
    const existing = await prisma.affiliateApplication.findUnique({
      where: { userId },
    });
    if (existing) {
      if (existing.status === "APPROVED") {
        return { success: false, error: "You are already an approved affiliate." };
      }
      if (existing.status === "PENDING") {
        return { success: false, error: "Your application is already pending review." };
      }
      // REJECTED — allow re-application by updating
      await prisma.affiliateApplication.update({
        where: { userId },
        data: {
          status: "PENDING",
          channelLink: data.channelLink ?? null,
          niche: data.niche,
          socialLinks: data.socialLinks ?? {},
          motivation: data.motivation ?? null,
          adminNotes: null,
        },
      });
      revalidatePath("/dashboard/affiliate");
      return { success: true };
    }

    await prisma.affiliateApplication.create({
      data: {
        userId,
        channelLink: data.channelLink ?? null,
        niche: data.niche,
        socialLinks: data.socialLinks ?? {},
        motivation: data.motivation ?? null,
      },
    });

    revalidatePath("/dashboard/affiliate");
    return { success: true };
  } catch (error) {
    console.error("[applyForAffiliate] Error:", error);
    return { success: false, error: "Failed to submit application. Please try again." };
  }
}

// ---------------------------------------------------------------------------
// Get current affiliate status for the logged-in user
// ---------------------------------------------------------------------------

export async function getAffiliateStatus(): Promise<{
  success: boolean;
  status: "none" | "pending" | "approved" | "rejected";
  application?: Awaited<ReturnType<typeof prisma.affiliateApplication.findUnique>>;
  affiliate?: any;
  error?: string;
}> {
  try {
    const userId = await getAuthenticatedUserId();

    const application = await prisma.affiliateApplication.findUnique({
      where: { userId },
    });

    if (!application) {
      return { success: true, status: "none" };
    }

    if (application.status === "PENDING") {
      return { success: true, status: "pending", application };
    }

    if (application.status === "REJECTED") {
      return { success: true, status: "rejected", application };
    }

    // APPROVED — fetch affiliate record too
    const affiliate = await prisma.affiliate.findUnique({
      where: { userId },
      include: {
        referrals: {
          orderBy: { createdAt: "desc" },
          include: {
            referredUser: {
              select: { id: true, name: true, email: true, createdAt: true },
            },
          },
        },
        withdrawalRequests: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!affiliate) {
      return { success: true, status: "none" };
    }

    const subscriptionSales = affiliate.referrals.filter((r) => r.status === "PAID").length;
    const paidEarnings = affiliate.withdrawalRequests
      .filter((w) => w.status === "APPROVED")
      .reduce((sum, w) => sum + Number(w.monetaryAmount), 0);

    const stats = {
      totalClicks: affiliate.clicks,
      totalSignups: affiliate.referrals.length,
      subscriptionSales,
      totalEarnings: Number(affiliate.totalEarningsDecimal),
      paidEarnings,
      affiliateCredits: affiliate.affiliateCredits,
      totalWithdrawn: affiliate.withdrawnCredits,
    };

    const plainAffiliate = {
      ...affiliate,
      commissionRate: Number(affiliate.commissionRate),
      totalEarningsDecimal: Number(affiliate.totalEarningsDecimal),
      referrals: affiliate.referrals.map(r => ({
        ...r,
        commissionAmount: r.commissionAmount ? Number(r.commissionAmount) : null,
      })),
      withdrawalRequests: affiliate.withdrawalRequests.map(w => ({
        ...w,
        monetaryAmount: Number(w.monetaryAmount),
      })),
      stats,
    };

    return { success: true, status: "approved", application, affiliate: plainAffiliate };
  } catch (error) {
    console.error("[getAffiliateStatus] Error:", error);
    return { success: false, status: "none", error: "Failed to fetch affiliate status." };
  }
}

// ---------------------------------------------------------------------------
// Get full dashboard stats for an approved affiliate
// ---------------------------------------------------------------------------

export async function getAffiliateDashboardStats(): Promise<{
  success: boolean;
  affiliate?: any;
  referrals?: any[];
  withdrawalRequests?: any[];
  stats?: {
    totalClicks: number;
    totalSignups: number;
    subscriptionSales: number;
    totalEarnings: number;
    paidEarnings: number;
    affiliateCredits: number;
    pendingReferrals: number;
    creditedReferrals: number;
    totalWithdrawn: number;
  };
  error?: string;
}> {
  try {
    const userId = await getAuthenticatedUserId();

    const affiliate = await prisma.affiliate.findUnique({
      where: { userId },
    });

    if (!affiliate) {
      return { success: false, error: "You are not an approved affiliate." };
    }

    const referrals = await prisma.referral.findMany({
      where: { affiliateId: affiliate.id },
      include: {
        referredUser: {
          select: { id: true, name: true, email: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const withdrawalRequests = await prisma.withdrawalRequest.findMany({
      where: { affiliateId: affiliate.id },
      orderBy: { createdAt: "desc" },
    });

    const pendingReferrals = referrals.filter((r) => r.status === "PENDING").length;
    const creditedReferrals = referrals.filter(
      (r) => r.status === "CREDITED" || r.status === "PAID"
    ).length;
    const subscriptionSales = referrals.filter((r) => r.status === "PAID").length;
    const paidEarnings = withdrawalRequests
      .filter((w) => w.status === "APPROVED")
      .reduce((sum, w) => sum + Number(w.monetaryAmount), 0);

    const stats = {
      totalClicks: affiliate.clicks,
      totalSignups: referrals.length,
      subscriptionSales,
      totalEarnings: Number(affiliate.totalEarningsDecimal),
      paidEarnings,
      affiliateCredits: affiliate.affiliateCredits,
      pendingReferrals,
      creditedReferrals,
      totalWithdrawn: affiliate.withdrawnCredits,
    };

    const plainAffiliate = affiliate ? {
      ...affiliate,
      commissionRate: Number(affiliate.commissionRate),
      totalEarningsDecimal: Number(affiliate.totalEarningsDecimal),
    } : undefined;

    const plainReferrals = referrals.map(r => ({
      ...r,
      commissionAmount: r.commissionAmount ? Number(r.commissionAmount) : null,
    }));

    const plainWithdrawalRequests = withdrawalRequests.map(w => ({
      ...w,
      monetaryAmount: Number(w.monetaryAmount),
    }));

    return { 
      success: true, 
      affiliate: plainAffiliate, 
      referrals: plainReferrals, 
      withdrawalRequests: plainWithdrawalRequests, 
      stats 
    };
  } catch (error) {
    console.error("[getAffiliateDashboardStats] Error:", error);
    return { success: false, error: "Failed to fetch dashboard stats." };
  }
}

// ---------------------------------------------------------------------------
// Convert affiliate credits → platform usage credits
// 20 affiliate credits = 1 usage credit
// ---------------------------------------------------------------------------

export async function convertAffiliateCredits(
  affiliateCredits: number
): Promise<{ success: boolean; usageCreditsGained?: number; error?: string }> {
  try {
    const userId = await getAuthenticatedUserId();

    if (!Number.isInteger(affiliateCredits) || affiliateCredits <= 0) {
      return { success: false, error: "Invalid credit amount." };
    }

    if (affiliateCredits < AFFILIATE_TO_USAGE_RATE) {
      return {
        success: false,
        error: `Minimum ${AFFILIATE_TO_USAGE_RATE} affiliate credits required for conversion.`,
      };
    }

    const usageCredits = Math.floor(affiliateCredits / AFFILIATE_TO_USAGE_RATE);
    const exactAffiliateCost = usageCredits * AFFILIATE_TO_USAGE_RATE;

    await prisma.$transaction(async (tx) => {
      const affiliate = await tx.affiliate.findUnique({ where: { userId } });

      if (!affiliate) {
        throw new Error("Affiliate record not found.");
      }
      if (affiliate.affiliateCredits < exactAffiliateCost) {
        throw new Error("Insufficient affiliate credits.");
      }

      await tx.affiliate.update({
        where: { userId },
        data: { affiliateCredits: { decrement: exactAffiliateCost } },
      });

      await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: usageCredits } },
      });
    });

    revalidatePath("/dashboard/affiliate");
    revalidatePath("/dashboard");
    return { success: true, usageCreditsGained: usageCredits };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Conversion failed.";
    console.error("[convertAffiliateCredits] Error:", error);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Submit a withdrawal request
// ---------------------------------------------------------------------------

export async function requestWithdrawal(data: {
  creditsAmount: number;
  currency: "INR" | "USD";
  method: "UPI" | "BANK" | "PAYPAL";
  paymentDetails: {
    upiId?: string;
    accountNumber?: string;
    ifsc?: string;
    bankName?: string;
    paypalEmail?: string;
  };
}): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getAuthenticatedUserId();

    const { creditsAmount, currency, method, paymentDetails } = data;

    // Validate minimum withdrawal
    const minCredits = currency === "INR" ? MIN_CREDITS_INR : MIN_CREDITS_USD;
    if (creditsAmount < minCredits) {
      return {
        success: false,
        error: `Minimum withdrawal is ${minCredits.toLocaleString()} affiliate credits (${
          currency === "INR" ? "₹1,000" : "$20"
        }).`,
      };
    }

    // Validate payment details per method
    if (method === "UPI" && !paymentDetails.upiId) {
      return { success: false, error: "UPI ID is required." };
    }
    if (method === "BANK" && (!paymentDetails.accountNumber || !paymentDetails.ifsc)) {
      return { success: false, error: "Account number and IFSC code are required for bank transfer." };
    }
    if (method === "PAYPAL" && !paymentDetails.paypalEmail) {
      return { success: false, error: "PayPal email is required." };
    }

    await prisma.$transaction(async (tx) => {
      const affiliate = await tx.affiliate.findUnique({ where: { userId } });

      if (!affiliate) throw new Error("Affiliate record not found.");
      if (!affiliate.enabled) throw new Error("Your affiliate account is disabled.");
      if (affiliate.affiliateCredits < creditsAmount) {
        throw new Error("Insufficient affiliate credits.");
      }

      // Only 1 pending withdrawal at a time
      const pendingWithdrawal = await tx.withdrawalRequest.findFirst({
        where: { affiliateId: affiliate.id, status: "PENDING" },
      });
      if (pendingWithdrawal) {
        throw new Error("You already have a pending withdrawal request. Please wait for it to be processed.");
      }

      // Weekly rate limit: max 1 withdrawal per 7 days
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentWithdrawal = await tx.withdrawalRequest.findFirst({
        where: {
          affiliateId: affiliate.id,
          createdAt: { gte: oneWeekAgo },
          status: { in: ["APPROVED"] },
        },
        orderBy: { createdAt: "desc" },
      });
      if (recentWithdrawal) {
        throw new Error("You can only submit one withdrawal per 7 days.");
      }

      // Calculate monetary amount
      const rate = currency === "INR" ? INR_RATE : USD_RATE;
      const monetaryAmount = parseFloat((creditsAmount * rate).toFixed(2));

      const withdrawalMethod: WithdrawalMethod =
        method === "UPI"
          ? WithdrawalMethod.UPI
          : method === "BANK"
          ? WithdrawalMethod.BANK
          : WithdrawalMethod.PAYPAL;

      await tx.withdrawalRequest.create({
        data: {
          affiliateId: affiliate.id,
          creditsAmount,
          monetaryAmount,
          currency,
          method: withdrawalMethod,
          paymentDetails,
          status: "PENDING",
        },
      });

      // Reserve credits (deduct from balance immediately, restore if rejected)
      await tx.affiliate.update({
        where: { id: affiliate.id },
        data: { affiliateCredits: { decrement: creditsAmount } },
      });
    });

    revalidatePath("/dashboard/affiliate");
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to submit withdrawal request.";
    console.error("[requestWithdrawal] Error:", error);
    return { success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Track affiliate link click (used by ReferralTracker query param detection)
// ---------------------------------------------------------------------------

export async function trackAffiliateClick(
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const sanitised = code.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
    if (!sanitised) {
      return { success: false, error: "Invalid referral code" };
    }

    const affiliate = await prisma.affiliate.findUnique({
      where: { referralCode: sanitised },
    });

    if (!affiliate) {
      return { success: false, error: "Affiliate not found" };
    }

    if (!affiliate.enabled) {
      return { success: false, error: "Affiliate is disabled" };
    }

    // Increment click count
    await prisma.affiliate.update({
      where: { id: affiliate.id },
      data: { clicks: { increment: 1 } },
    });

    return { success: true };
  } catch (error) {
    console.error("[trackAffiliateClick] Error:", error);
    return { success: false, error: "Failed to track affiliate click" };
  }
}

