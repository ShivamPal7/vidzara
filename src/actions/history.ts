"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Feature } from "../../prisma/generated/prisma/enums";

export type GenerationHistoryItem = {
  id: string;
  feature: Feature;
  input: any;
  output: any;
  createdAt: Date;
};

function getDateRangeStart(dateRange?: string): Date | undefined {
  const now = new Date();
  switch (dateRange) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "7d": {
      const start = new Date(now);
      start.setDate(start.getDate() - 7);
      return start;
    }
    case "30d": {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return start;
    }
    case "90d": {
      const start = new Date(now);
      start.setDate(start.getDate() - 90);
      return start;
    }
    default:
      return undefined;
  }
}

export async function getGenerationHistory(options?: {
  page?: number;
  limit?: number;
  feature?: Feature;
  dateRange?: string;
}): Promise<{
  success: boolean;
  data?: {
    items: GenerationHistoryItem[];
    total: number;
    page: number;
    totalPages: number;
  };
  error?: string;
}> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const page = Math.max(1, options?.page || 1);
    const limit = Math.max(1, Math.min(100, options?.limit || 20));
    const skip = (page - 1) * limit;

    const whereClause: any = { userId: session.user.id };
    if (options?.feature) {
      whereClause.feature = options.feature;
    }
    const dateStart = getDateRangeStart(options?.dateRange);
    if (dateStart) {
      whereClause.createdAt = { gte: dateStart };
    }

    const [total, items] = await Promise.all([
      prisma.generation.count({
        where: whereClause,
      }),
      prisma.generation.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          feature: true,
          input: true,
          output: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[getGenerationHistory]", error);
    return { success: false, error: "Failed to fetch generation history." };
  }
}
