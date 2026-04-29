"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AIEngine } from "@/lib/ai/engine";
import { Feature } from "../../prisma/generated/prisma/enums";
import {
  mapGenerationToRecentScript,
  mapGenerationToScriptDetail,
} from "@/lib/ai/mappers/script-writer";
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
  console.error("Script Writer Action Error:", error);
  return { success: false as const, error: message };
}

// ── Schemas ─────────────────────────────────────────────────────────────

const generateSchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters long").max(4000),
  format: z.string(),
  duration: z.string(),
  tone: z.string().optional(),
  language: z.string(),
});

// ── 1. Generate Script ──────────────────────────────────────────────────

export async function generateScript(
  input: z.infer<typeof generateSchema>
) {
  try {
    const validated = generateSchema.parse(input);
    const userId = await getAuthenticatedUserId();

    const result = await AIEngine.generate({
      feature: Feature.SCRIPT_WRITER,
      input: validated,
      userId,
    });

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    // Find the generation that was just created (most recent for this user + feature)
    const generation = await prisma.generation.findFirst({
      where: { userId, feature: Feature.SCRIPT_WRITER },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    revalidatePath("/dashboard/create/script-writer");

    return {
      success: true as const,
      data: result.data,
      generationId: generation?.id,
    };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 2. List Recent Scripts ──────────────────────────────────────────────

export async function getRecentScripts() {
  try {
    const userId = await getAuthenticatedUserId();

    const generations = await prisma.generation.findMany({
      where: {
        userId,
        feature: Feature.SCRIPT_WRITER,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const scripts = generations.map((g) => mapGenerationToRecentScript(g as any));

    return { success: true as const, data: scripts };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 3. Get Script Detail ────────────────────────────────────────────────

export async function getScriptDetail(generationId: string) {
  try {
    const userId = await getAuthenticatedUserId();

    const generation = await prisma.generation.findFirst({
      where: {
        id: generationId,
        userId,
        feature: Feature.SCRIPT_WRITER,
      },
    });

    if (!generation) {
      return { success: false as const, error: "Script not found." };
    }

    const detail = mapGenerationToScriptDetail(generation as any);

    return { success: true as const, data: detail };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 4. Refine Script ──────────────────────────────────────────────────────

const refineSchema = z.object({
  generationId: z.string().min(1),
  content: z.string().min(1),
  prompt: z.string().min(1),
});

export async function refineScript(input: z.infer<typeof refineSchema>) {
  try {
    const validated = refineSchema.parse(input);
    const userId = await getAuthenticatedUserId();

    // Verify ownership
    const generation = await prisma.generation.findFirst({
      where: { id: validated.generationId, userId, feature: Feature.SCRIPT_WRITER },
      select: { id: true, output: true },
    });

    if (!generation) {
      return { success: false as const, error: "Script not found." };
    }

    // Since this is a refinement, we can just use GeminiProvider directly 
    // with a specific refinement prompt instead of going through the full AIEngine
    const { GeminiProvider } = await import("@/lib/ai/provider");
    
    const refinePrompt = `
You are an expert YouTube scriptwriter and editor.
Your task is to refine the following video script according to the user's instructions.

USER INSTRUCTION:
${validated.prompt}

CURRENT SCRIPT:
${validated.content}

Return ONLY the refined script formatted in HTML (using <h3> and <p> and <strong> tags). Do not include markdown blocks like \`\`\`html.
Keep the parts of the script that are not affected by the instruction exactly the same.
`;

    const result = await GeminiProvider.generateText(refinePrompt);
    let refinedContent = result.text.trim();
    if (refinedContent.startsWith("\`\`\`html")) {
      refinedContent = refinedContent.replace(/^\`\`\`html/, "").replace(/\`\`\`$/, "").trim();
    }

    // Update the database record with the new content
    const existingOutput = generation.output as any;
    await prisma.generation.update({
      where: { id: validated.generationId },
      data: {
        output: {
          ...existingOutput,
          content: refinedContent,
        },
      },
    });

    revalidatePath(`/dashboard/create/script-writer/${validated.generationId}`);

    return { success: true as const, data: refinedContent };
  } catch (error) {
    return errorResponse(error);
  }
}
