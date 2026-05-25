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

    const dateStart = getDateRangeStart(options?.dateRange);

    // Scenario A: Specifically filtered to CHAT
    if ((options?.feature as string) === "CHAT") {
      const chatWhereClause: any = { userId: session.user.id };
      if (dateStart) {
        chatWhereClause.createdAt = { gte: dateStart };
      }

      const [total, chatSessions] = await Promise.all([
        prisma.chatSession.count({ where: chatWhereClause }),
        prisma.chatSession.findMany({
          where: chatWhereClause,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
              take: 1,
            },
          },
        }),
      ]);

      const items: GenerationHistoryItem[] = chatSessions.map((s) => ({
        id: s.id,
        feature: "CHAT" as Feature,
        input: {},
        output: {
          title: s.title,
          summary: s.summary || (s.messages[0]?.content || "No messages yet"),
        },
        createdAt: s.createdAt,
      }));

      return {
        success: true,
        data: {
          items,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    // Scenario B: Specifically filtered to a regular feature (not CHAT)
    if (options?.feature) {
      const whereClause: any = { userId: session.user.id, feature: options.feature };
      if (dateStart) {
        whereClause.createdAt = { gte: dateStart };
      }

      const [total, items] = await Promise.all([
        prisma.generation.count({ where: whereClause }),
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
    }

    // Scenario C: Unified History (All generations and chat sessions merged)
    const genWhereClause: any = { userId: session.user.id };
    const chatWhereClause: any = { userId: session.user.id };
    if (dateStart) {
      genWhereClause.createdAt = { gte: dateStart };
      chatWhereClause.createdAt = { gte: dateStart };
    }

    const [totalGenerations, totalChats, generations, chatSessions] = await Promise.all([
      prisma.generation.count({ where: genWhereClause }),
      prisma.chatSession.count({ where: chatWhereClause }),
      prisma.generation.findMany({
        where: genWhereClause,
        orderBy: { createdAt: "desc" },
        // Fetch up to skip + limit from each so we can accurately slice combined sorted array in memory
        take: skip + limit,
        select: {
          id: true,
          feature: true,
          input: true,
          output: true,
          createdAt: true,
        },
      }),
      prisma.chatSession.findMany({
        where: chatWhereClause,
        orderBy: { createdAt: "desc" },
        take: skip + limit,
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      }),
    ]);

    const mappedChats: GenerationHistoryItem[] = chatSessions.map((s) => ({
      id: s.id,
      feature: "CHAT" as Feature,
      input: {},
      output: {
        title: s.title,
        summary: s.summary || (s.messages[0]?.content || "No messages yet"),
      },
      createdAt: s.createdAt,
    }));

    // Merge and sort in-memory
    const combined = [...generations, ...mappedChats]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(skip, skip + limit);

    const total = totalGenerations + totalChats;

    return {
      success: true,
      data: {
        items: combined,
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
