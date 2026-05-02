import { Feature } from "../../../prisma/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { checkUsage, incrementUsage, getUserPlan } from "@/lib/usage";
import { checkFeatureAccess } from "@/lib/plan-guard";
import { GeminiProvider } from "./provider";
import { PROMPTS } from "./prompts";
import { AIRequest, AIResponse } from "./types";

export class AIEngine {
  static async generate(request: AIRequest): Promise<AIResponse> {
    const { feature, input, userId, context } = request;

    try {
      // 1. Validate Session & User (Implicitly handled by caller usually, but good to verify user exists if needed)
      // For now, assuming userId is valid from session.

      // 2. Check Plan Access
      const plan = await getUserPlan(userId);
      const access = checkFeatureAccess(plan, feature, context);

      if (!access.allowed) {
        return {
          success: false,
          error: access.reason || "Upgrade required to access this feature.",
        };
      }

      // 3. Check Usage Quota
      const usage = await checkUsage(userId, feature);
      if (!usage.allowed) {
        return {
          success: false,
          error: `Daily limit reached for ${feature}. Upgrade to unlimited for more.`,
        };
      }

      // 4. Load Prompt Template
      const template = PROMPTS[feature];
      if (!template) {
        return {
          success: false,
          error: `No prompt template found for feature: ${feature}`,
        };
      }

      const prompt = template.generatePrompt(input, context);

      // 5. Call AI Provider
      // We can inspect input/feature to decide if we need JSON or Text. 
      // For now, let's assume JSON for structured data features, Text for others.
      // Or better, let the features define their output type expectation.
      // For simplicity in this core engine, we'll start with text and parse if needed,
      // or default to JSON if the prompt implies it.
      
      // Let's use JSON generation by default for structured tools to ensure reliability
      const modelId = "gemini-flash-latest"; // Could be dynamic based on plan
      
      let aiOutput: any;
      let tokens = 0;

      // TODO: logic to determine if we want text or json. 
      // For now, let's default to text unless we strictly check feature type.
      // Actually, most Video SEO, Script logic requires structured JSON.
      // Let's attempt JSON generation if the feature suggests structure.

      // Quick switch for now (expand later)
      const isStructured: Feature[] = [
        Feature.VIDEO_SEO, 
        Feature.SCRIPT_WRITER, 
        Feature.SCRIPT_SHORTENER,
        Feature.HOOK_DETECTOR,
        Feature.TOPIC_GENERATOR,
        Feature.OUTLIER_DETECTOR,
        Feature.CONSISTENCY_CHECKER,
        Feature.NICHE_FINDER,
        Feature.THUMBNAIL_CONCEPT,
        Feature.CONTENT_SAFETY
      ];

      if (isStructured.includes(feature)) {
         const result = await GeminiProvider.generateJSON(prompt, undefined, modelId);
         aiOutput = result.data;
         tokens = result.tokens || 0;
      } else {
         const result = await GeminiProvider.generateText(prompt, modelId);
         aiOutput = result.text;
         tokens = result.tokens || 0;
      }

      // 6. Increment Usage
      await incrementUsage(userId, feature);

      // 7. Save to Generation Table
      await prisma.generation.create({
        data: {
          userId,
          feature,
          input: input as any,
          output: aiOutput as any,
          model: modelId,
          tokensUsed: tokens
        }
      });

      // 8. Return Output
      return {
        success: true,
        data: aiOutput,
        tokensUsed: tokens,
        model: modelId
      };

    } catch (error: any) {
      console.error("AI Engine Error:", error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred during generation."
      };
    }
  }
}
