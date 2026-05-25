"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AIEngine } from "@/lib/ai/engine";
import { Feature } from "../../prisma/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { deductCreditsAction } from "./credits";

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
  script: z
    .string()
    .min(10, "Script/hook must be at least 10 characters long")
    .max(5000, "Script/hook cannot exceed 5000 chars"),
});

export async function generateHookAnalysis(input: z.infer<typeof generateSchema>) {
  try {
    const validated = generateSchema.parse(input);
    const userId = await getAuthenticatedUserId();

    const result = await AIEngine.generate({
      feature: Feature.HOOK_DETECTOR,
      input: { script: validated.script },
      userId,
    });

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    // Deduct credits
    const creditRes = await deductCreditsAction(Feature.HOOK_DETECTOR, { 
      format: validated.script.length > 500 ? "long" : "shorts" 
    });
    
    if (!creditRes.success) {
      return { success: false as const, error: creditRes.error };
    }

    return {
      success: true as const,
      data: result.data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    console.error("Hook Detector Action Error:", error);
    return { success: false as const, error: message };
  }
}
