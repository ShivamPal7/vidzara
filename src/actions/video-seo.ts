"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AIEngine } from "@/lib/ai/engine";
import { GeminiProvider } from "@/lib/ai/provider";
import { Feature } from "../../prisma/generated/prisma/enums";
import {
  mapGenerationToVideoSeoDetails,
  mapGenerationToVideoListItem,
} from "@/lib/ai/mappers/video-seo";
import { buildRefinePrompt } from "@/lib/ai/prompts/refine";
import { OpenRouterEngine } from "@/lib/ai/openrouter";
import { revalidatePath } from "next/cache";
import { deductCreditsAction } from "./credits";

// ── Helpers ─────────────────────────────────────────────────────────────

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

function errorResponse(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Something went wrong.";
  console.error("Video SEO Action Error:", error);
  return { success: false as const, error: message };
}

// ── Schemas ─────────────────────────────────────────────────────────────

const generateSchema = z.object({
  mode: z.enum(["topic", "keypoints", "script"]),
  content: z
    .string()
    .min(3, "Content must be at least 3 characters long")
    .max(5000, "Content cannot exceed 5000 chars"),
  options: z
    .object({
      title: z.boolean().default(true),
      description: z.boolean().default(true),
      tags: z.boolean().default(true),
      hashtags: z.boolean().default(true),
    })
    .optional(),
});

const refineSchema = z.object({
  generationId: z.string().min(1),
  section: z.enum(["title", "description"]),
  content: z.string().min(1),
  action: z.string().min(1),
  value: z.string().optional(),
});

const regenerateSchema = z.object({
  generationId: z.string().min(1),
  content: z.string().min(3).max(5000),
});

// ── 1. Generate Video SEO ───────────────────────────────────────────────

export async function generateVideoSEO(
  input: z.infer<typeof generateSchema>
) {
  try {
    const validated = generateSchema.parse(input);
    const userId = await getAuthenticatedUserId();

    const result = await AIEngine.generate({
      feature: Feature.VIDEO_SEO,
      input: {
        mode: validated.mode,
        content: validated.content,
        options: validated.options,
      },
      userId,
    });

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    // Deduct credits
    const creditRes = await deductCreditsAction(Feature.VIDEO_SEO, { 
      options: validated.options 
    });
    
    if (!creditRes.success) {
      return { success: false as const, error: creditRes.error };
    }

    // Find the generation that was just created (most recent for this user + feature)
    const generation = await prisma.generation.findFirst({
      where: { userId, feature: Feature.VIDEO_SEO },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    revalidatePath("/dashboard/create/video-seo");

    return {
      success: true as const,
      data: result.data,
      generationId: generation?.id,
    };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 2. List Video SEO Generations ───────────────────────────────────────

export async function getVideoSeoGenerations() {
  try {
    const userId = await getAuthenticatedUserId();

    const generations = await prisma.generation.findMany({
      where: {
        userId,
        feature: Feature.VIDEO_SEO,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        output: true,
        createdAt: true,
        isFavorite: true,
      },
    });

    const videos = generations.map((g) => mapGenerationToVideoListItem(g));

    return { success: true as const, data: videos };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 3. Get Video SEO Detail ─────────────────────────────────────────────

export async function getVideoSeoDetail(generationId: string) {
  try {
    const userId = await getAuthenticatedUserId();

    const generation = await prisma.generation.findFirst({
      where: {
        id: generationId,
        userId,
        feature: Feature.VIDEO_SEO,
      },
      select: {
        id: true,
        input: true,
        output: true,
        createdAt: true,
        isFavorite: true,
      },
    });

    if (!generation) {
      return { success: false as const, error: "Generation not found." };
    }

    const detail = mapGenerationToVideoSeoDetails(generation);

    return { success: true as const, data: detail };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 4. Toggle Favorite ──────────────────────────────────────────────────

export async function toggleFavorite(generationId: string) {
  try {
    const userId = await getAuthenticatedUserId();

    const generation = await prisma.generation.findFirst({
      where: { id: generationId, userId },
      select: { id: true, isFavorite: true },
    });

    if (!generation) {
      return { success: false as const, error: "Generation not found." };
    }

    await prisma.generation.update({
      where: { id: generationId },
      data: { isFavorite: !generation.isFavorite },
    });

    revalidatePath("/dashboard/create/video-seo");

    return {
      success: true as const,
      isFavorite: !generation.isFavorite,
    };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 5. Regenerate Video SEO ─────────────────────────────────────────────

export async function regenerateVideoSeo(
  input: z.infer<typeof regenerateSchema>
) {
  try {
    const validated = regenerateSchema.parse(input);
    const userId = await getAuthenticatedUserId();

    // Verify ownership
    const existing = await prisma.generation.findFirst({
      where: { id: validated.generationId, userId, feature: Feature.VIDEO_SEO },
      select: { id: true, input: true },
    });

    if (!existing) {
      return { success: false as const, error: "Generation not found." };
    }

    const existingInput = existing.input as { mode?: string } | null;

    // Generate new content with updated prompt
    const result = await AIEngine.generate({
      feature: Feature.VIDEO_SEO,
      input: {
        mode: existingInput?.mode || "topic",
        content: validated.content,
      },
      userId,
    });

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    // Deduct credits (Regenerating defaults to full SEO package)
    const creditRes = await deductCreditsAction(Feature.VIDEO_SEO, { 
      options: { title: true, description: true, tags: true, hashtags: true } 
    });
    
    if (!creditRes.success) {
      return { success: false as const, error: creditRes.error };
    }

    // Update the existing generation with new output
    await prisma.generation.update({
      where: { id: validated.generationId },
      data: {
        input: {
          mode: existingInput?.mode || "topic",
          content: validated.content,
        },
        output: result.data as any,
        model: result.model,
        tokensUsed: result.tokensUsed,
      },
    });

    // Fetch updated record and map
    const updated = await prisma.generation.findUnique({
      where: { id: validated.generationId },
      select: {
        id: true,
        input: true,
        output: true,
        createdAt: true,
        isFavorite: true,
      },
    });

    if (!updated) {
      return { success: false as const, error: "Failed to fetch updated generation." };
    }

    const detail = mapGenerationToVideoSeoDetails(updated);

    revalidatePath("/dashboard/create/video-seo");
    revalidatePath(`/dashboard/create/video-seo/${validated.generationId}`);

    return { success: true as const, data: detail };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 6. Refine Section ───────────────────────────────────────────────────

export async function refineSection(input: z.infer<typeof refineSchema>) {
  try {
    const validated = refineSchema.parse(input);
    const userId = await getAuthenticatedUserId();

    // Verify ownership
    const generation = await prisma.generation.findFirst({
      where: { id: validated.generationId, userId },
      select: { id: true },
    });

    if (!generation) {
      return { success: false as const, error: "Generation not found." };
    }

    // Build prompt and call AI
    const prompt = buildRefinePrompt({
      section: validated.section,
      content: validated.content,
      action: validated.action,
      value: validated.value,
    });

    const result = await OpenRouterEngine.generateText({
      feature: Feature.VIDEO_SEO,
      prompt,
      systemOverride: "You are an expert YouTube SEO specialist and content editor. Your task is to refine existing content based on specific instructions.",
    });
    const refined = result.text.trim();

    return { success: true as const, data: refined };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 7. Delete Generation ────────────────────────────────────────────────

export async function deleteGeneration(generationId: string) {
  try {
    const userId = await getAuthenticatedUserId();

    const generation = await prisma.generation.findFirst({
      where: { id: generationId, userId },
      select: { id: true },
    });

    if (!generation) {
      return { success: false as const, error: "Generation not found." };
    }

    await prisma.generation.delete({
      where: { id: generationId },
    });

    revalidatePath("/dashboard/create/video-seo");

    return { success: true as const };
  } catch (error) {
    return errorResponse(error);
  }
}
