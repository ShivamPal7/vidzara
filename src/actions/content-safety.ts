"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AIEngine } from "@/lib/ai/engine";
import { Feature } from "../../prisma/generated/prisma/enums";

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
  content: z
    .string()
    .min(3, "Content must be at least 3 characters long")
    .max(100000, "Content cannot exceed 100000 chars"),
});

export async function generateContentSafety(input: z.infer<typeof generateSchema>) {
  try {
    const validated = generateSchema.parse(input);
    const userId = await getAuthenticatedUserId();

    const result = await AIEngine.generate({
      feature: Feature.CONTENT_SAFETY,
      input: { content: validated.content },
      userId,
    });

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    return {
      success: true as const,
      data: result.data,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.issues[0]?.message || "Invalid input data." };
    }
    const message = error instanceof Error ? error.message : "Something went wrong.";
    console.error("Content Safety Action Error:", error);
    return { success: false as const, error: message };
  }
}
