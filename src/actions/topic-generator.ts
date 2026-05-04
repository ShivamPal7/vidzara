"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AIEngine } from "@/lib/ai/engine";
import { Feature } from "../../prisma/generated/prisma/enums";
import { getRecentVideos, findOutliers } from "@/lib/youtube/api";
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

const generateSchema = z.object({
  competitorIds: z.array(z.string()).min(1, "At least one competitor is required"),
});

export async function generateTopicIdeas(input: z.infer<typeof generateSchema>) {
  try {
    const validated = generateSchema.parse(input);
    const userId = await getAuthenticatedUserId();

    // 1. Fetch the Competitors details
    const competitors = await prisma.competitor.findMany({
      where: {
        id: { in: validated.competitorIds },
        userId, // ensure ownership
      },
    });

    if (competitors.length === 0) {
      return { success: false, error: "Competitors not found." };
    }

    // 2. Fetch recent videos from YouTube Data API for all
    let allRecentVideos: any[] = [];
    for (const competitor of competitors) {
      const recent = await getRecentVideos(competitor.channelId, 25);
      // Append channelName to video for context
      const recentWithChannel = recent.videos.map((v) => ({ ...v, channelName: competitor.channelName }));
      allRecentVideos = [...allRecentVideos, ...recentWithChannel];
    }
    
    if (allRecentVideos.length === 0) {
      return { success: false, error: "No recent videos found for selected channels." };
    }

    // 3. Find Outliers across all combined videos
    const { outliers } = findOutliers(allRecentVideos, 1.3);

    // 4. Generate AI Analysis
    const aiInput = {
      channelNames: competitors.map((c) => c.channelName).join(", "),
      recentVideos: allRecentVideos,
      outliers,
    };

    const result = await AIEngine.generate({
      feature: Feature.TOPIC_GENERATOR,
      input: aiInput,
      userId,
    });

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    revalidatePath("/dashboard/analyze/topic-generator");
    return {
      success: true as const,
      data: { id: result.generationId, ...result.data },
    };
  } catch (error) {
    console.error("Generate Topic Ideas Action Error:", error);
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return { success: false as const, error: message };
  }
}

export async function getTopicGenerations() {
  try {
    const userId = await getAuthenticatedUserId();
    const generations = await prisma.generation.findMany({
      where: {
        userId,
        feature: Feature.TOPIC_GENERATOR,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true as const,
      data: generations,
    };
  } catch (error) {
    console.error("Get Topic Generations Error:", error);
    return { success: false as const, error: "Failed to fetch generations." };
  }
}

export async function getTopicGenerationById(id: string) {
  try {
    const userId = await getAuthenticatedUserId();
    const generation = await prisma.generation.findUnique({
      where: {
        id,
        userId,
        feature: Feature.TOPIC_GENERATOR,
      },
    });

    if (!generation) {
      return { success: false as const, error: "Generation not found." };
    }

    return {
      success: true as const,
      data: generation,
    };
  } catch (error) {
    console.error("Get Topic Generation By Id Error:", error);
    return { success: false as const, error: "Failed to fetch generation details." };
  }
}

export async function toggleFavorite(id: string) {
  try {
    const userId = await getAuthenticatedUserId();
    const generation = await prisma.generation.findUnique({
      where: { id, userId },
    });

    if (!generation) return { success: false, error: "Not found" };

    await prisma.generation.update({
      where: { id },
      data: { isFavorite: !generation.isFavorite },
    });

    revalidatePath("/dashboard/analyze/topic-generator");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to toggle favorite." };
  }
}

export async function deleteGeneration(id: string) {
  try {
    const userId = await getAuthenticatedUserId();
    await prisma.generation.delete({
      where: { id, userId },
    });

    revalidatePath("/dashboard/analyze/topic-generator");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete generation." };
  }
}
