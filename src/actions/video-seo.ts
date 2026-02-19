"use server";

import { z } from "zod";
import { auth } from "@/lib/auth"; // Better Auth
import { headers } from "next/headers";
import { AIEngine } from "@/lib/ai/engine";
import { Feature } from "../../prisma/generated/prisma/enums";

// Define input schema
const videoSEOSchema = z.object({
  mode: z.enum(["topic", "keypoints", "script"]),
  content: z.string().min(3, "Content must be at least 3 characters long").max(5000, "Content cannot exceed 5000 chars"),
});

export async function generateVideoSEO(input: z.infer<typeof videoSEOSchema>) {
  try {
    // 1. Validate Input
    const validated = videoSEOSchema.parse(input);

    // 2. Authenticate User
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const userId = session.user.id;

    // 3. Call AI Engine
    // The engine handles plan verification, usage tracking, and data persistence internally.
    const result = await AIEngine.generate({
      feature: Feature.VIDEO_SEO,
      input: {
        mode: validated.mode,
        content: validated.content,
      },
      userId: userId,
    });

    return { success: true, data: result };

  } catch (error: any) {
    console.error("Video SEO Generation Failed:", error);
    // Return a structured error, don't throw to client components if possible
    return {
      success: false,
      error: error.message || "Something went wrong generating video SEO.",
    };
  }
}
