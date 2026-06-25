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
import { analyzeVideoStyle } from "@/lib/ai/style-analyzer";
import { deductCreditsAction } from "./credits";
import { incrementUsage } from "@/lib/usage";

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

    // ── Reference video tone interception ─────────────────────────────
    let enrichedInput: typeof validated & { styleAnalysis?: any } = { ...validated };

    if (validated.tone?.startsWith("Reference: ")) {
      const referenceUrl = validated.tone.replace("Reference: ", "").trim();
      const styleAnalysis = await analyzeVideoStyle(referenceUrl);
      enrichedInput = {
        ...validated,
        tone: "Matched from reference video (see styleAnalysis for exact instructions)",
        styleAnalysis,
      };
    } else if (validated.tone?.startsWith("Transcript: ")) {
      const transcriptText = validated.tone.replace("Transcript: ", "").trim();
      // We can run the same analysis logic but skip the fetch step
      const { analyzeTranscriptStyle } = await import("@/lib/ai/style-analyzer");
      const styleAnalysis = await analyzeTranscriptStyle(transcriptText);
      enrichedInput = {
        ...validated,
        tone: "Matched from manually provided transcript",
        styleAnalysis,
      };
    }
    // ──────────────────────────────────────────────────────────────────

    const result = await AIEngine.generate({
      feature: Feature.SCRIPT_WRITER,
      input: enrichedInput,
      userId,
    });

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    // Deduct credits
    const creditRes = await deductCreditsAction(Feature.SCRIPT_WRITER, { 
      format: validated.format, 
      duration: validated.duration 
    });
    
    if (!creditRes.success) {
      return { success: false as const, error: creditRes.error };
    }

    return {
      success: true as const,
      generationId: result.generationId,
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
      select: { id: true, output: true, input: true },
    });

    if (!generation) {
      return { success: false as const, error: "Script not found." };
    }

    // Since this is a refinement, we can generate text using OpenRouter Client
    const { generateText } = await import("ai");
    const { openrouterClient } = await import("@/lib/ai/client");
    const { FEATURE_MODELS } = await import("@/lib/ai/models");
    
    // For script refinement, we use a faster and cheaper model (Gemini 2.5 Flash)
    const modelId = "google/gemini-2.5-flash";

    const inputData = generation.input as any;
    const language = inputData?.language;
    const languageName = language
      ? language.charAt(0).toUpperCase() + language.slice(1)
      : "English";

    const currentYear = new Date().getFullYear();
    const refinePrompt = `
You are an expert YouTube scriptwriter and editor.
Your task is to refine the following video script according to the user's instructions.

USER INSTRUCTION:
${validated.prompt}

CURRENT SCRIPT:
${validated.content}

Return ONLY the refined script formatted in HTML (using <h3> and <p> and <strong> tags). Do not include markdown blocks like \`\`\`html.
Keep the parts of the script that are not affected by the instruction exactly the same.

LANGUAGE CONSTRAINT:
- The script is written in ${languageName}. You MUST write the refined script content in ${languageName} language. Do not translate the script to English or any other language unless explicitly requested.

CRITICAL SYSTEM DIRECTIVE (CURRENT YEAR):
- The current year is ${currentYear}.
- When refining, if you mention or update references to the current year, you MUST use "${currentYear}" instead of "2024" or "2025".
`;

    const result = await generateText({
      model: openrouterClient(modelId),
      prompt: refinePrompt,
      temperature: 0.3, // Lower temperature for high fidelity to instructions and original script structure
    });
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

// ── 5. Save Generated Script (From Stream) ─────────────────────────────

const saveSchema = z.object({
  prompt: z.string(),
  format: z.string(),
  duration: z.string(),
  tone: z.string().optional(),
  language: z.string(),
  title: z.string().min(1),
  content: z.string().min(1),
  refinementSuggestions: z.array(z.string()).length(3),
  modelUsed: z.string().optional(),
});

export async function saveGeneratedScript(input: z.infer<typeof saveSchema>) {
  try {
    const validated = saveSchema.parse(input);
    const userId = await getAuthenticatedUserId();

    // Deduct credits
    const creditRes = await deductCreditsAction(Feature.SCRIPT_WRITER, {
      format: validated.format,
      duration: validated.duration,
    });
    
    if (!creditRes.success) {
      return { success: false as const, error: creditRes.error };
    }

    // Persist Generation Record
    const genRecord = await prisma.generation.create({
      data: {
        userId,
        feature: Feature.SCRIPT_WRITER,
        input: {
          prompt: validated.prompt,
          format: validated.format,
          duration: validated.duration,
          tone: validated.tone,
          language: validated.language,
        } as any,
        output: {
          title: validated.title,
          content: validated.content,
          refinementSuggestions: validated.refinementSuggestions,
        } as any,
        model: validated.modelUsed || "google/gemini-2.5-pro",
        tokensUsed: 0, // Streaming token count can default to 0
      },
    });

    // Increment Usage
    await incrementUsage(userId, Feature.SCRIPT_WRITER);

    revalidatePath("/dashboard/create/script-writer");

    return {
      success: true as const,
      generationId: genRecord.id,
    };
  } catch (error) {
    return errorResponse(error);
  }
}

