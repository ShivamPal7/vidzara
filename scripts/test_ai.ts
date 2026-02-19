import "dotenv/config";
import { GeminiProvider } from "../src/lib/ai/provider";

async function main() {
  console.log("🔍 Verifying Vidzara AI Integration...");
  
  try {
    // This uses the default model set in provider.ts (gemini-2.5-flash)
    console.log("Sending request to GeminiProvider...");
    const start = Date.now();
    const result = await GeminiProvider.generateText("Reply with 'System Operational' if you can read this.");
    const duration = Date.now() - start;

    console.log(`✅ Success! (${duration}ms)`);
    console.log("🤖 AI Response:", result.text);
  } catch (error: any) {
    console.error("❌ Verification Failed:");
    console.error(error.message || error);
    process.exit(1);
  }
}

main();
