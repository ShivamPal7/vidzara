import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { openrouterClient } from "@/lib/ai/client";
import { Feature } from "../../../../../prisma/generated/prisma/enums";
import { checkUsage, getUserPlan } from "@/lib/usage";
import { checkFeatureAccess } from "@/lib/plan-guard";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ClarifyingQuestionsSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string().optional(),
      question: z.string(),
      options: z.array(z.string()).min(2).max(4),
    })
  ).min(2).max(3),
});

export type ClarifyingQuestionsResponse = z.infer<typeof ClarifyingQuestionsSchema>;

export async function POST(req: Request) {
  try {
    // 1. Authenticate user
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Parse request payload
    const { prompt, format, duration, tone, language } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // 3. Verify plan access
    const plan = await getUserPlan(userId);
    const access = checkFeatureAccess(plan, Feature.SCRIPT_WRITER);
    if (!access.allowed) {
      return NextResponse.json({ error: access.reason || "Upgrade required to access this feature." }, { status: 403 });
    }

    // 4. Verify usage limit (check if remaining credits > 0)
    const usage = await checkUsage(userId, Feature.SCRIPT_WRITER);
    if (!usage.allowed) {
      return NextResponse.json({ error: `Daily limit reached for Script Writer. Upgrade for unlimited access.` }, { status: 429 });
    }

    // 5. Generate dynamic questions using fast & cheap model
    const modelId = "google/gemini-2.5-flash-lite";

    const promptText = `
You are a script development assistant. For the topic: "${prompt}", generate exactly 3 clarifying questions that will help shape a compelling YouTube script.

CORE PRINCIPLE:
Think about this specific topic and ask: "What are the 3 things about how this script should be WRITTEN that, if I knew the answer, would most change the script's structure, tone, or storytelling approach?"

IMPORTANT: Your questions must be about script writing decisions only. Never ask questions that are trying to gain knowledge or information about the topic itself — assume full topic knowledge. Every question should be about HOW to write, not WHAT to write about.

CONSTRAINTS:
1. Generate EXACTLY 3 questions.
2. Each question must uncover a different script writing decision that would meaningfully change how the script is written.
3. Questions should be 10–18 words, grounded in this specific topic.
4. Each question must have exactly 3 meaningfully distinct answer options (3–6 words each).
5. No generic questions — every question must feel like it could only be asked for this topic.
`;

    const { object } = await generateObject({
      model: openrouterClient(modelId),
      schema: ClarifyingQuestionsSchema,
      prompt: promptText,
      system: "You are a specialized script editor and YouTube content strategist. Generate 3 highly specific script options in JSON based on the prompt.",
      temperature: 0.75,
    });

    // Populate unique IDs dynamically on the server side
    const questionsWithIds = object.questions.map((q, idx) => ({
      id: q.id || `q-${idx}`,
      question: q.question,
      options: q.options,
    }));

    return NextResponse.json({ questions: questionsWithIds });
  } catch (error: any) {
    console.error("[QuestionsAPI] Server Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
