import { Feature } from "../../../prisma/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { checkUsage, incrementUsage, getUserPlan } from "@/lib/usage";
import { checkFeatureAccess } from "@/lib/plan-guard";
import { OpenRouterEngine } from "./openrouter";
import { GeminiProvider } from "./provider";
import { PROMPTS } from "./prompts";
import { FEATURE_MODELS } from "./models";
import { AIRequest, AIResponse } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Provider Selection
// ─────────────────────────────────────────────────────────────────────────────
//
// Default: OpenRouter (multi-model routing with automatic fallbacks)
//
// To temporarily switch to the Gemini direct provider set this in your .env:
//   AI_PROVIDER=gemini
//
// This is intentionally a manual escape hatch — do not rely on it in prod.
// ─────────────────────────────────────────────────────────────────────────────

const USE_GEMINI_BACKUP = process.env.AI_PROVIDER === "gemini";

// Features that produce structured JSON vs plain text
const STRUCTURED_FEATURES = new Set<Feature>([
  Feature.VIDEO_SEO,
  Feature.SCRIPT_WRITER,
  Feature.SCRIPT_SHORTENER,
  Feature.HOOK_DETECTOR,
  Feature.TOPIC_GENERATOR,
  Feature.COMPETITORS,
  Feature.CONSISTENCY_CHECKER,
  Feature.NICHE_FINDER,
  Feature.THUMBNAIL_CONCEPT,
  Feature.CONTENT_SAFETY,
  Feature.GROWTH_DASHBOARD,
]);

// ─────────────────────────────────────────────────────────────────────────────
// AIEngine
// ─────────────────────────────────────────────────────────────────────────────

export class AIEngine {
  static async generate(request: AIRequest): Promise<AIResponse> {
    const { feature, input, userId, context } = request;

    try {
      // 1. Check Plan Access
      const plan = await getUserPlan(userId);
      const access = checkFeatureAccess(plan, feature, context);

      if (!access.allowed) {
        return {
          success: false,
          error: access.reason || "Upgrade required to access this feature.",
        };
      }

      // 2. Check Usage Quota
      const usage = await checkUsage(userId, feature);
      if (!usage.allowed) {
        return {
          success: false,
          error: `Daily limit reached for ${feature}. Upgrade for unlimited access.`,
        };
      }

      // 3. Load Prompt Template
      const template = PROMPTS[feature];
      if (!template) {
        return {
          success: false,
          error: `No prompt template found for feature: ${feature}`,
        };
      }

      const prompt = template.generatePrompt(input, context);
      const isStructured = STRUCTURED_FEATURES.has(feature);

      // 4. Generate via selected provider
      let aiOutput: unknown;
      let tokensUsed = 0;
      let modelUsed = "unknown";

      if (USE_GEMINI_BACKUP) {
        // ── Gemini backup path (direct SDK, no OpenRouter) ───────────────────
        const geminiModelId = "gemini-flash-latest";
        if (isStructured) {
          const result = await GeminiProvider.generateJSON(prompt, undefined, geminiModelId);
          aiOutput = result.data;
        } else {
          const result = await GeminiProvider.generateText(prompt, geminiModelId);
          aiOutput = result.text;
        }
        modelUsed = geminiModelId;
      } else {
        // ── OpenRouter primary path ───────────────────────────────────────────
        if (isStructured) {
          const result = await OpenRouterEngine.generateObject({
            feature,
            prompt,
          });
          aiOutput = result.data;
          tokensUsed = result.tokensUsed;
          modelUsed = result.modelUsed;
        } else {
          const result = await OpenRouterEngine.generateText({
            feature,
            prompt,
          });
          aiOutput = result.text;
          tokensUsed = result.tokensUsed;
          modelUsed = result.modelUsed;
        }
      }

      // 5. Increment Usage
      await incrementUsage(userId, feature);

      // 6. Persist Generation Record
      const genRecord = await prisma.generation.create({
        data: {
          userId,
          feature,
          input: input as never,
          output: aiOutput as never,
          model: modelUsed,
          tokensUsed,
        },
      });

      // 7. Return
      return {
        success: true,
        data: aiOutput,
        tokensUsed,
        model: modelUsed,
        generationId: genRecord.id,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unexpected error occurred during generation.";
      console.error(`[AIEngine] Error for feature "${feature}":`, error);
      return { success: false, error: message };
    }
  }
}

// Re-export FEATURE_MODELS so callers don't need a separate import
export { FEATURE_MODELS };
