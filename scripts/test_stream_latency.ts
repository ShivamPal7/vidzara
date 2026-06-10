import "dotenv/config";
import { streamText } from "ai";
import { openrouterClient } from "../src/lib/ai/client";
import { FEATURE_MODELS } from "../src/lib/ai/models";
import { Feature } from "../prisma/generated/prisma/enums";

async function main() {
  console.log("🔍 Measuring Time to First Token (TTFT) on OpenRouter...");
  const modelConfig = FEATURE_MODELS[Feature.SCRIPT_WRITER];
  const modelId = modelConfig?.models[0] || "google/gemini-2.5-pro";
  
  console.log(`Model: ${modelId}`);
  const start = Date.now();
  let firstTokenTime = 0;
  let totalTokens = 0;

  try {
    const stream = await streamText({
      model: openrouterClient(modelId),
      prompt: "Write a short 50-word script about coding.",
      system: modelConfig?.systemPrompt,
      temperature: 0.72,
    });

    for await (const chunk of stream.textStream) {
      if (firstTokenTime === 0) {
        firstTokenTime = Date.now() - start;
        console.log(`⏱️ Time to First Token (TTFT): ${firstTokenTime}ms`);
      }
      totalTokens += chunk.length;
    }

    const duration = Date.now() - start;
    console.log(`✅ Stream Completed!`);
    console.log(`Total Time: ${duration}ms`);
    console.log(`Throughput: ${(totalTokens / (duration / 1000)).toFixed(2)} chars/sec`);
  } catch (error: any) {
    console.error("❌ Stream failed:", error.message || error);
  }
}

main();
