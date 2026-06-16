"use server";

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

async function checkAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }
}

/**
 * Gets all coupons ordered by creation date.
 */
export async function getCoupons() {
  await checkAdmin();

  return await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      usages: true
    }
  });
}

interface CreateCouponInput {
  code: string;
  discountPercent: number;
  expiresAt?: Date | string | null;
  maxUses?: number | null;
  perUserLimit?: number | null;
  country?: string | null;
}

/**
 * Creates a new coupon.
 */
export async function createCoupon(data: CreateCouponInput) {
  await checkAdmin();

  const code = data.code.trim().toUpperCase();

  if (!code) {
    throw new Error("Coupon code is required");
  }

  if (data.discountPercent < 1 || data.discountPercent > 100) {
    throw new Error("Discount percent must be between 1 and 100");
  }

  // Check if coupon code already exists
  const existing = await prisma.coupon.findUnique({
    where: { code },
  });

  if (existing) {
    throw new Error("A coupon with this code already exists");
  }

  const parsedExpiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

  const coupon = await prisma.coupon.create({
    data: {
      code,
      discountPercent: data.discountPercent,
      expiresAt: parsedExpiresAt,
      maxUses: data.maxUses ?? null,
      perUserLimit: data.perUserLimit ?? 1,
      country: data.country ? data.country.trim().toUpperCase() : null,
      active: true,
    },
  });

  return { success: true, coupon };
}

/**
 * Toggles a coupon's active status.
 */
export async function toggleCouponActive(couponId: string, active: boolean) {
  await checkAdmin();

  const coupon = await prisma.coupon.update({
    where: { id: couponId },
    data: { active },
  });

  return { success: true, coupon };
}

/**
 * Deletes a coupon.
 */
export async function deleteCoupon(couponId: string) {
  await checkAdmin();

  await prisma.coupon.delete({
    where: { id: couponId },
  });

  return { success: true };
}
