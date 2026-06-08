"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AIEngine } from "@/lib/ai/engine";
import { Feature } from "../../prisma/generated/prisma/enums";
import { deductCreditsAction } from "./credits";
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

const generateSchema = z
  .object({
    competitorIds: z.array(z.string()).optional(),
    prompt: z.string().trim().optional(),
  })
  .refine(
    (data) =>
      (data.competitorIds && data.competitorIds.length > 0) ||
      (data.prompt && data.prompt.length > 0),
    {
      message:
        "Provide at least one competitor channel or a topic prompt.",
    }
  );

export async function generateTopicIdeas(
  input: z.infer<typeof generateSchema>
) {
  try {
    const validated = generateSchema.parse(input);
    const userId = await getAuthenticatedUserId();

    const hasCompetitors =
      validated.competitorIds && validated.competitorIds.length > 0;

    let aiInput: Record<string, unknown> = {
      prompt: validated.prompt || "",
    };

    if (hasCompetitors) {
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
        const recentWithChannel = recent.videos.map((v) => ({
          ...v,
          channelName: competitor.channelName,
        }));
        allRecentVideos = [...allRecentVideos, ...recentWithChannel];
      }

      if (allRecentVideos.length === 0) {
        return {
          success: false,
          error: "No recent videos found for selected channels.",
        };
      }

      // 3. Find Outliers
      const { outliers } = findOutliers(allRecentVideos, 1.3);

      // 4. Build AI input with competitor context
      aiInput = {
        ...aiInput,
        channelNames: competitors.map((c) => c.channelName).join(", "),
        recentVideos: allRecentVideos,
        outliers,
      };
    }

    // 5. Generate AI Analysis
    const result = await AIEngine.generate({
      feature: Feature.TOPIC_GENERATOR,
      input: aiInput,
      userId,
    });

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    // 6. Deduct credits
    const channelsCount = hasCompetitors
      ? (validated.competitorIds?.length ?? 1)
      : 1;
    const creditRes = await deductCreditsAction(Feature.TOPIC_GENERATOR, {
      channelsCount,
    });

    if (!creditRes.success) {
      return { success: false as const, error: creditRes.error };
    }

    revalidatePath("/dashboard/analyze/topic-generator");
    return {
      success: true as const,
      data: { id: result.generationId, ...result.data },
    };
  } catch (error) {
    console.error("Generate Topic Ideas Action Error:", error);
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
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
