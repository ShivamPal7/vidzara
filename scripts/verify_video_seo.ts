import "dotenv/config";
import { AIEngine } from "../src/lib/ai/engine";
import { Feature } from "../prisma/generated/prisma/enums";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🎬 Verifying Video SEO Generator...");

  try {
    // 1. Get a user
    const user = await prisma.user.findFirst();
    if (!user) {
        throw new Error("No user found in database to test with.");
    }
    console.log("User:", user.id);

    // 2. Mock Input
    const input = {
      mode: "topic",
      content: "How to build a SaaS with Next.js and AI"
    };

    // 3. Call AI Engine directly (bypassing server action auth check for script)
    console.log("Generating SEO metadata via GeminiProvider DIRECTLY...");
    
    // Import prompt
    const { VideoSEOPrompt } = require("../src/lib/ai/prompts/video-seo");
    const { GeminiProvider } = require("../src/lib/ai/provider");

    const prompt = VideoSEOPrompt.generatePrompt(input);
    console.log("Prompt generated. Length:", prompt.length);

    const start = Date.now();
    const result = await GeminiProvider.generateJSON(prompt, undefined, "models/gemini-2.5-flash");
    const duration = Date.now() - start;

    console.log(`✅ Success! (${duration}ms)`);
    console.log("Result object from Provider:", JSON.stringify(result, null, 2));

    const output = result.data;
    console.log("Output structure keys:", Object.keys(output));
    
    // Validate output structure
    if (output.titles && output.description && output.tags && output.hashtags && output.keywords) {
        console.log("✅ JSON Structure Validated");
        console.log("Title Count:", output.titles.length);
        console.log("Sample Title:", output.titles[0]);
    } else {
        console.error("❌ Invalid JSON Structure:", Object.keys(output));
        process.exit(1);
    }

  } catch (error: any) {
    console.error("❌ Verification Failed:");
    console.error(error.message || error);
    process.exit(1);
  } finally {
      await prisma.$disconnect();
  }
}

main();
