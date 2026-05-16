import { createOpenAI } from "@ai-sdk/openai";

/**
 * Core OpenRouter Gateway client instance configured for Vercel AI SDK ecosystem.
 */
export const openrouterClient = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY,
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://vidzara.com",
    "X-Title": "Vidzara Backend Engine",
  },
});
