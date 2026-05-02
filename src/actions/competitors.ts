"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getChannelInfo, searchChannels } from "@/lib/youtube/api";
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

export async function searchYouTubeChannels(query: string) {
  try {
    await getAuthenticatedUserId(); // ensure auth
    const channels = await searchChannels(query);
    return { success: true, data: channels };
  } catch (error) {
    console.error("Search Channels Error:", error);
    return { success: false, error: "Failed to search channels." };
  }
}

export async function addCompetitorDirectly(channelInfo: {
  channelId: string;
  title: string;
  handle?: string;
  thumbnailUrl: string;
}) {
  try {
    const userId = await getAuthenticatedUserId();
    
    const competitor = await prisma.competitor.upsert({
      where: {
        userId_channelId: {
          userId,
          channelId: channelInfo.channelId,
        },
      },
      update: {
        channelName: channelInfo.title,
        channelHandle: channelInfo.handle,
        thumbnailUrl: channelInfo.thumbnailUrl,
      },
      create: {
        userId,
        channelId: channelInfo.channelId,
        channelName: channelInfo.title,
        channelHandle: channelInfo.handle,
        thumbnailUrl: channelInfo.thumbnailUrl,
      },
    });

    revalidatePath("/dashboard/analyze/topic-generator");
    return { success: true, data: competitor };
  } catch (error) {
    console.error("Add Competitor Directly Error:", error);
    return { success: false, error: "Failed to add competitor." };
  }
}

export async function addCompetitor(query: string) {
  try {
    const userId = await getAuthenticatedUserId();
    
    // 1. Fetch channel info from YouTube API
    const channelInfo = await getChannelInfo(query);
    if (!channelInfo) {
      return { success: false, error: "Channel not found. Please provide a valid YouTube URL or channel handle." };
    }

    // 2. Save to database
    const competitor = await prisma.competitor.upsert({
      where: {
        userId_channelId: {
          userId,
          channelId: channelInfo.channelId,
        },
      },
      update: {
        channelName: channelInfo.title,
        channelHandle: channelInfo.handle,
        thumbnailUrl: channelInfo.thumbnailUrl,
      },
      create: {
        userId,
        channelId: channelInfo.channelId,
        channelName: channelInfo.title,
        channelHandle: channelInfo.handle,
        thumbnailUrl: channelInfo.thumbnailUrl,
      },
    });

    revalidatePath("/dashboard/analyze/topic-generator");
    return { success: true, data: competitor };
  } catch (error) {
    console.error("Add Competitor Error:", error);
    const message = error instanceof Error ? error.message : "Failed to add competitor.";
    return { success: false, error: message };
  }
}

export async function getCompetitors() {
  try {
    const userId = await getAuthenticatedUserId();
    const competitors = await prisma.competitor.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: competitors };
  } catch (error) {
    console.error("Get Competitors Error:", error);
    return { success: false, error: "Failed to fetch competitors." };
  }
}

export async function deleteCompetitor(id: string) {
  try {
    const userId = await getAuthenticatedUserId();
    await prisma.competitor.delete({
      where: {
        id,
        userId, // ensure ownership
      },
    });
    revalidatePath("/dashboard/analyze/topic-generator");
    return { success: true };
  } catch (error) {
    console.error("Delete Competitor Error:", error);
    return { success: false, error: "Failed to delete competitor." };
  }
}
