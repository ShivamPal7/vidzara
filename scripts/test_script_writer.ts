import "dotenv/config";
import { OpenRouterEngine } from "../src/lib/ai/openrouter";
import { Feature } from "../prisma/generated/prisma/enums";

async function main() {
  console.log("🔍 Testing OpenRouter Script Writer Configuration...");
  
  const testPrompt = `
Generate a script for a YouTube video about "5 Life Hacks for Software Developers".
The script should be highly engaging.
`;

  try {
    console.log("Calling OpenRouterEngine.generateObject for SCRIPT_WRITER...");
    const start = Date.now();
    const result = await OpenRouterEngine.generateObject({
      feature: Feature.SCRIPT_WRITER,
      prompt: testPrompt,
    });
    const duration = Date.now() - start;

    console.log(`✅ Success! (${duration}ms)`);
    console.log("🤖 Model Used:", result.modelUsed);
    console.log("Tokens Used:", result.tokensUsed);
    console.log("Output structure keys:", Object.keys(result.data as any));
  } catch (error: any) {
    console.error("❌ Generation Failed:");
    console.error(error.message || error);
    if (error.responseBody) {
      console.error("Response Body:", error.responseBody);
    }
    process.exit(1);
  }
}

main();
