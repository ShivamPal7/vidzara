"use server";

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAffiliates() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }
  
  const affiliates = await prisma.affiliate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      referrals: true,
    }
  });
  
  const plainAffiliates = affiliates.map((a) => ({
    ...a,
    commissionRate: Number(a.commissionRate),
    totalEarningsDecimal: Number(a.totalEarningsDecimal),
    referrals: a.referrals.map((r) => ({
      ...r,
      commissionAmount: r.commissionAmount ? Number(r.commissionAmount) : null,
    })),
  }));
  
  return plainAffiliates;
}

export async function updateAffiliateStatus(id: string, enabled: boolean) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }

  await prisma.affiliate.update({
    where: { id },
    data: { enabled },
  });

  revalidatePath("/admin/affiliates");
  return { success: true };
}

export async function editAffiliateDetails(
  id: string,
  data: {
    commissionRate: number;
    enabled: boolean;
    adminNotes?: string | null;
  }
) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }

  // Convert percentage to decimal (e.g. 15 -> 0.15)
  const rateDecimal = data.commissionRate / 100;

  await prisma.affiliate.update({
    where: { id },
    data: {
      commissionRate: rateDecimal,
      enabled: data.enabled,
      adminNotes: data.adminNotes ?? null,
    },
  });

  revalidatePath("/admin/affiliates");
  return { success: true };
}

// ─── Affiliate Applications ───────────────────────────────────────────────────

export async function getAffiliateApplications() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }

  const applications = await prisma.affiliateApplication.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
  });

  return applications;
}

export async function approveAffiliateApplication(
  applicationId: string,
  commissionRate: number = 10
) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }

  const application = await prisma.affiliateApplication.findUnique({
    where: { id: applicationId },
    include: {
      user: {
        include: {
          userProfile: true,
        },
      },
    },
  });

  if (!application) {
    throw new Error("Application not found");
  }

  // Convert percentage to decimal (10 → 0.10)
  const rateDecimal = commissionRate / 100;

  await prisma.$transaction(async (tx) => {
    // Update application status
    await tx.affiliateApplication.update({
      where: { id: applicationId },
      data: { status: "APPROVED" },
    });

    // Generate unique slugified handle if the affiliate doesn't exist yet
    const existingAffiliate = await tx.affiliate.findUnique({
      where: { userId: application.userId },
    });

    let referralCode = existingAffiliate?.referralCode;

    if (!referralCode) {
      const slugify = (text: string) => {
        return text
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-+|-+$/g, "");
      };

      const baseName =
        application.user?.userProfile?.displayName ||
        application.user?.name ||
        application.user?.email?.split("@")[0] ||
        "affiliate";

      const baseCode = slugify(baseName) || "affiliate";

      let finalCode = baseCode;
      let counter = 1;
      while (true) {
        const existing = await tx.affiliate.findUnique({
          where: { referralCode: finalCode },
        });
        if (!existing) {
          referralCode = finalCode;
          break;
        }
        finalCode = `${baseCode}-${counter}`;
        counter++;
      }
    }

    // Create or update the affiliate record
    await tx.affiliate.upsert({
      where: { userId: application.userId },
      create: {
        userId: application.userId,
        referralCode: referralCode!,
        commissionRate: rateDecimal,
        enabled: true,
      },
      update: {
        commissionRate: rateDecimal,
        enabled: true,
      },
    });
  });

  revalidatePath("/admin/affiliates");
  return { success: true };
}

export async function rejectAffiliateApplication(
  applicationId: string,
  adminNotes: string
) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }

  await prisma.affiliateApplication.update({
    where: { id: applicationId },
    data: {
      status: "REJECTED",
      adminNotes,
    },
  });

  revalidatePath("/admin/affiliates");
  return { success: true };
}

// ─── Withdrawal Requests ──────────────────────────────────────────────────────

export async function getWithdrawalRequests(status?: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }

  const requests = await prisma.withdrawalRequest.findMany({
    where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      affiliate: {
        select: {
          id: true,
          referralCode: true,
          user: {
            select: { name: true, email: true, image: true },
          },
        },
      },
    },
  });

  const plainRequests = requests.map((r) => ({
    ...r,
    monetaryAmount: Number(r.monetaryAmount),
  }));

  return plainRequests;
}

export async function processWithdrawalRequest(
  requestId: string,
  approved: boolean,
  adminNotes?: string
) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }

  const request = await prisma.withdrawalRequest.findUnique({
    where: { id: requestId },
    include: { affiliate: true }
  });

  if (!request) {
    throw new Error("Request not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.withdrawalRequest.update({
      where: { id: requestId },
      data: {
        status: approved ? "APPROVED" : "REJECTED",
        adminNotes: adminNotes ?? null,
        processedAt: new Date(),
      },
    });

    if (approved) {
      await tx.affiliate.update({
        where: { id: request.affiliateId },
        data: {
          withdrawnCredits: { increment: request.creditsAmount },
          totalEarningsDecimal: { increment: request.monetaryAmount }, // Optional: record total earnings
        }
      });
    } else {
      // Refund credits since they were deducted during request
      await tx.affiliate.update({
        where: { id: request.affiliateId },
        data: {
          affiliateCredits: { increment: request.creditsAmount }
        }
      });
    }
  });

  revalidatePath("/admin/payouts");
  return { success: true };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function generateUniqueReferralCode(
  tx: Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">
): Promise<string> {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = Array.from({ length: 8 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
    const existing = await tx.affiliate.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  throw new Error("Failed to generate a unique referral code after 10 attempts.");
}
