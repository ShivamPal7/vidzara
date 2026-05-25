"use server";

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function getAnalyticsOverview() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }

  const [totalUsers, activeSubscriptions, totalGenerations] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({
      where: {
        status: "ACTIVE",
      },
    }),
    prisma.generation.count(),
  ]);

  return {
    totalUsers,
    totalActiveSubs: activeSubscriptions,
    totalGenerations,
  };
}

export async function getToolUsage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }

  const usageRecords = await prisma.usageRecord.groupBy({
    by: ["feature"],
    _sum: {
      count: true,
    },
  });

  return usageRecords.map((record) => ({
    name: record.feature,
    usage: record._sum.count || 0,
  }));
}
