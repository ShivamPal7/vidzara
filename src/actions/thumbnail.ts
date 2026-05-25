"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AIEngine } from "@/lib/ai/engine";
import { Feature } from "../../prisma/generated/prisma/enums";
import { deductCreditsAction } from "./credits";
import {
  mapGenerationToThumbnailDetails,
  mapGenerationToThumbnailListItem,
} from "@/lib/ai/mappers/thumbnail";
import { revalidatePath } from "next/cache";

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
  console.error("Thumbnail Action Error:", error);
  return { success: false as const, error: message };
}

// ── Schemas ─────────────────────────────────────────────────────────────

const generateSchema = z.object({
  mode: z.string().optional(),
  content: z
    .string()
    .min(3, "Content must be at least 3 characters long")
    .max(5000, "Content cannot exceed 5000 chars"),
  options: z
    .object({
      text: z.boolean().default(true),
      emotions: z.boolean().default(true),
      layout: z.boolean().default(true),
      colors: z.boolean().default(true),
      generateImagePrompt: z.boolean().default(false),
      count: z.number().min(1).max(10).default(3),
    })
    .optional(),
});

const regenerateSchema = z.object({
  generationId: z.string().min(1),
  content: z.string().min(3).max(5000),
});

// ── 1. Generate Concepts ────────────────────────────────────────────────

export async function generateThumbnailConcepts(
  input: z.infer<typeof generateSchema>
) {
  try {
    const validated = generateSchema.parse(input);
    const userId = await getAuthenticatedUserId();

    const result = await AIEngine.generate({
      feature: Feature.THUMBNAIL_CONCEPT,
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
    const creditRes = await deductCreditsAction(Feature.THUMBNAIL_CONCEPT);
    if (!creditRes.success) {
      return { success: false as const, error: creditRes.error };
    }

    // Find the generation that was just created
    const generation = await prisma.generation.findFirst({
      where: { userId, feature: Feature.THUMBNAIL_CONCEPT },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    revalidatePath("/dashboard/create/thumbnail");

    return {
      success: true as const,
      data: result.data,
      generationId: generation?.id,
    };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 2. List Generations ─────────────────────────────────────────────────

export async function getThumbnailGenerations() {
  try {
    const userId = await getAuthenticatedUserId();

    const generations = await prisma.generation.findMany({
      where: {
        userId,
        feature: Feature.THUMBNAIL_CONCEPT,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        output: true,
        createdAt: true,
        isFavorite: true,
      },
    });

    const thumbnails = generations.map((g) => mapGenerationToThumbnailListItem(g));

    return { success: true as const, data: thumbnails };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 3. Get Detail ───────────────────────────────────────────────────────

export async function getThumbnailDetail(generationId: string) {
  try {
    const userId = await getAuthenticatedUserId();

    const generation = await prisma.generation.findFirst({
      where: {
        id: generationId,
        userId,
        feature: Feature.THUMBNAIL_CONCEPT,
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

    const detail = mapGenerationToThumbnailDetails(generation);

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

    revalidatePath("/dashboard/create/thumbnail");

    return {
      success: true as const,
      isFavorite: !generation.isFavorite,
    };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 5. Delete Generation ────────────────────────────────────────────────

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

    revalidatePath("/dashboard/create/thumbnail");

    return { success: true as const };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 6. Regenerate Concepts ──────────────────────────────────────────────

export async function regenerateThumbnail(
  input: z.infer<typeof regenerateSchema>
) {
  try {
    const validated = regenerateSchema.parse(input);
    const userId = await getAuthenticatedUserId();

    // Verify ownership
    const existing = await prisma.generation.findFirst({
      where: { id: validated.generationId, userId, feature: Feature.THUMBNAIL_CONCEPT },
      select: { id: true, input: true },
    });

    if (!existing) {
      return { success: false as const, error: "Generation not found." };
    }

    const existingInput = existing.input as { mode?: string, options?: any } | null;

    // Generate new content with updated prompt
    const result = await AIEngine.generate({
      feature: Feature.THUMBNAIL_CONCEPT,
      input: {
        mode: existingInput?.mode || "topic",
        content: validated.content,
        options: existingInput?.options || { text: true, emotions: true, layout: true, colors: true },
      },
      userId,
    });

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    // Deduct credits
    const creditRes = await deductCreditsAction(Feature.THUMBNAIL_CONCEPT);
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
          options: existingInput?.options || { text: true, emotions: true, layout: true, colors: true },
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

    const detail = mapGenerationToThumbnailDetails(updated);

    revalidatePath("/dashboard/create/thumbnail");
    revalidatePath(`/dashboard/create/thumbnail/${validated.generationId}`);

    return { success: true as const, data: detail };
  } catch (error) {
    return errorResponse(error);
  }
}
