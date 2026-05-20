"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AIEngine } from "@/lib/ai/engine";
import { Feature } from "../../prisma/generated/prisma/enums";
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
  console.error("Niche Finder Action Error:", error);
  return { success: false as const, error: message };
}

// ── Schemas ─────────────────────────────────────────────────────────────

const generateSchema = z.object({
  interest: z
    .string()
    .min(3, "Interest must be at least 3 characters long")
    .max(500, "Interest cannot exceed 500 characters"),
  skillLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  contentType: z.string().min(1, "Please select a content format"),
});

// ── 1. Generate Niche Ideas ─────────────────────────────────────────────

export async function generateNicheIdeas(
  input: z.infer<typeof generateSchema>
) {
  try {
    const validated = generateSchema.parse(input);
    const userId = await getAuthenticatedUserId();

    const result = await AIEngine.generate({
      feature: Feature.NICHE_FINDER,
      input: {
        interest: validated.interest,
        skillLevel: validated.skillLevel,
        contentType: validated.contentType,
      },
      userId,
    });

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    revalidatePath("/dashboard/analyze/niche-finder");

    return {
      success: true as const,
      data: result.data,
      generationId: result.generationId,
    };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 2. List Niche Generations ───────────────────────────────────────────

export async function getNicheGenerations() {
  try {
    const userId = await getAuthenticatedUserId();

    const generations = await prisma.generation.findMany({
      where: {
        userId,
        feature: Feature.NICHE_FINDER,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        input: true,
        output: true,
        createdAt: true,
        isFavorite: true,
      },
    });

    return { success: true as const, data: generations };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 3. Get Niche Generation Detail ──────────────────────────────────────

export async function getNicheGenerationById(generationId: string) {
  try {
    const userId = await getAuthenticatedUserId();

    const generation = await prisma.generation.findFirst({
      where: {
        id: generationId,
        userId,
        feature: Feature.NICHE_FINDER,
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

    return { success: true as const, data: generation };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 4. Toggle Favorite ──────────────────────────────────────────────────

export async function toggleFavorite(generationId: string) {
  try {
    const userId = await getAuthenticatedUserId();

    const generation = await prisma.generation.findFirst({
      where: { id: generationId, userId, feature: Feature.NICHE_FINDER },
      select: { id: true, isFavorite: true },
    });

    if (!generation) {
      return { success: false as const, error: "Generation not found." };
    }

    const updated = await prisma.generation.update({
      where: { id: generationId },
      data: { isFavorite: !generation.isFavorite },
    });

    revalidatePath("/dashboard/analyze/niche-finder");

    return {
      success: true as const,
      isFavorite: updated.isFavorite,
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
      where: { id: generationId, userId, feature: Feature.NICHE_FINDER },
      select: { id: true },
    });

    if (!generation) {
      return { success: false as const, error: "Generation not found." };
    }

    await prisma.generation.delete({
      where: { id: generationId },
    });

    revalidatePath("/dashboard/analyze/niche-finder");

    return { success: true as const };
  } catch (error) {
    return errorResponse(error);
  }
}
