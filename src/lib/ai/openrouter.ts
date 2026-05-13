import { generateObject as aiGenerateObject, generateText as aiGenerateText } from "ai";
import { Feature } from "../../../prisma/generated/prisma/enums";
import { openrouterClient } from "./client";
import { FEATURE_MODELS } from "./models";
import { FEATURE_SCHEMAS } from "./schemas";

export class OpenRouterEngine {
  /**
   * Generates type-safe structured object output natively leveraging OpenRouter Fallback array routing.
   * Models and configurations are clean-isolated inside `models.ts`.
   */
  static async generateObject<T>(params: {
    feature: Feature;
    prompt: string;
    systemOverride?: string;
  }): Promise<{ data: T; tokensUsed: number; modelUsed: string }> {
    const modelConfig = FEATURE_MODELS[params.feature];
    const targetSchema = FEATURE_SCHEMAS[params.feature];

    if (!modelConfig) {
      throw new Error(`Model routing profile missing for feature: ${params.feature}`);
    }
    if (!targetSchema) {
      throw new Error(`Structured schema configuration missing for feature: ${params.feature}`);
    }

    // Join target routing array into native comma-delimited fallback routing syntax
    const fallbackModelString = modelConfig.models.join(",");
    const targetLanguageModel = openrouterClient(fallbackModelString);

    try {
      const { object, usage } = await aiGenerateObject({
        model: targetLanguageModel,
        schema: targetSchema,
        prompt: params.prompt,
        system: params.systemOverride || modelConfig.systemPrompt,
        temperature: modelConfig.temperature,
      });

      return {
        data: object as T,
        tokensUsed: usage?.totalTokens ?? 0,
        modelUsed: modelConfig.models[0], // Identifies the primary requested intelligence tier endpoint
      };
    } catch (error) {
      console.error(`OpenRouter Engine generation failure for [${params.feature}]:`, error);
      throw error;
    }
  }

  /**
   * Generates standard plain-text strings natively leveraging OpenRouter Fallbacks.
   */
  static async generateText(params: {
    feature: Feature;
    prompt: string;
    systemOverride?: string;
  }): Promise<{ text: string; tokensUsed: number; modelUsed: string }> {
    const modelConfig = FEATURE_MODELS[params.feature];

    if (!modelConfig) {
      throw new Error(`Model routing profile missing for feature: ${params.feature}`);
    }

    const fallbackModelString = modelConfig.models.join(",");
    const targetLanguageModel = openrouterClient(fallbackModelString);

    try {
      const { text, usage } = await aiGenerateText({
        model: targetLanguageModel,
        prompt: params.prompt,
        system: params.systemOverride || modelConfig.systemPrompt,
        temperature: modelConfig.temperature,
      });

      return {
        text,
        tokensUsed: usage?.totalTokens ?? 0,
        modelUsed: modelConfig.models[0],
      };
    } catch (error) {
      console.error(`OpenRouter Engine Text generation failure for [${params.feature}]:`, error);
      throw error;
    }
  }
}

// Convenient modular re-exports for external module actions
export * from "./client";
export * from "./models";
export * from "./schemas";
