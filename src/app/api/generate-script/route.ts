import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { streamText } from "ai";
import { openrouterClient } from "@/lib/ai/client";
import { Feature } from "../../../../prisma/generated/prisma/enums";
import { checkUsage, incrementUsage, getUserPlan } from "@/lib/usage";
import { checkFeatureAccess } from "@/lib/plan-guard";
import { PROMPTS } from "@/lib/ai/prompts";
import { FEATURE_MODELS } from "@/lib/ai/models";
import { analyzeVideoStyle } from "@/lib/ai/style-analyzer";

export const dynamic = "force-dynamic";

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

    // 4. Verify usage limit
    const usage = await checkUsage(userId, Feature.SCRIPT_WRITER);
    if (!usage.allowed) {
      return NextResponse.json({ error: `Daily limit reached for Script Writer. Upgrade for unlimited access.` }, { status: 429 });
    }

    // 5. Reference video style interception
    let enrichedInput = { prompt, format, duration, tone, language, styleAnalysis: undefined as any };

    if (tone?.startsWith("Reference: ")) {
      const referenceUrl = tone.replace("Reference: ", "").trim();
      const styleAnalysis = await analyzeVideoStyle(referenceUrl);
      enrichedInput.tone = "Matched from reference video (see styleAnalysis for exact instructions)";
      enrichedInput.styleAnalysis = styleAnalysis;
    } else if (tone?.startsWith("Transcript: ")) {
      const transcriptText = tone.replace("Transcript: ", "").trim();
      const { analyzeTranscriptStyle } = await import("@/lib/ai/style-analyzer");
      const styleAnalysis = await analyzeTranscriptStyle(transcriptText);
      enrichedInput.tone = "Matched from manually provided transcript";
      enrichedInput.styleAnalysis = styleAnalysis;
    }

    // 6. Generate prompt using the prompt template
    const template = PROMPTS[Feature.SCRIPT_WRITER];
    if (!template) {
      return NextResponse.json({ error: "Prompt template missing" }, { status: 500 });
    }
    const basePrompt = template.generatePrompt(enrichedInput);

    // 7. Inject output format formatting directives to ensure easy plain text parsing
    const streamPrompt = `${basePrompt}

STRICT OUTPUT FORMAT MANDATE:
You MUST format your entire response exactly like this:

===TITLE===
[Your highly engaging, click-optimized YouTube Title]

===SUGGESTIONS===
[First follow-up prompt, max 6 words]
[Second follow-up prompt, max 6 words]
[Third follow-up prompt, max 6 words]

===SCRIPT===
[The HTML formatted script content using <h3>, <p>, and <strong> tags, following the formatting guidelines]

Do not include any markdown wrappers like \`\`\`html or \`\`\`json. Start immediately with ===TITLE===.
`;

    // 8. Stream the text output using the primary Gemini Pro model
    const modelConfig = FEATURE_MODELS[Feature.SCRIPT_WRITER];
    const modelId = modelConfig?.models[0] || "google/gemini-2.5-pro";

    const stream = await streamText({
      model: openrouterClient(modelId),
      prompt: streamPrompt,
      system: modelConfig?.systemPrompt,
      temperature: modelConfig?.temperature ?? 0.72,
      maxOutputTokens: 8000,
    });

    return stream.toTextStreamResponse({
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("[GenerateScriptAPI] Server Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
