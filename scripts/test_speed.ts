import "dotenv/config";
import { generateObject as aiGenerateObject, generateText as aiGenerateText } from "ai";
import { openrouterClient } from "../src/lib/ai/client";
import { FEATURE_SCHEMAS } from "../src/lib/ai/schemas";
import { Feature } from "../prisma/generated/prisma/enums";

async function main() {
  console.log("⚡ Comparing generation speeds on OpenRouter...");
  const modelId = "google/gemini-2.5-pro";
  const targetLanguageModel = openrouterClient(modelId);
  
  const testPrompt = `
Generate a script for a YouTube video about "5 Life Hacks for Software Developers".
The script should be highly engaging and about 1 minute long.

Return your response strictly in the following JSON format:
{
  "title": "YouTube Title",
  "content": "HTML formatted script content using <h3> and <p>",
  "refinementSuggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}
`;

  // Test 1: Constrained schema generation (generateObject)
  try {
    console.log("\n--- Method 1: aiGenerateObject (Constrained JSON Schema) ---");
    const start = Date.now();
    const result = await aiGenerateObject({
      model: targetLanguageModel,
      schema: FEATURE_SCHEMAS[Feature.SCRIPT_WRITER]!,
      prompt: testPrompt,
      temperature: 0.72,
    });
    const duration = Date.now() - start;
    console.log(`Method 1 Time: ${duration}ms`);
    console.log("Method 1 Output Length:", JSON.stringify(result.object).length);
  } catch (error: any) {
    console.error("Method 1 Failed:", error.message || error);
  }

  // Test 2: Unconstrained text generation (generateText)
  try {
    console.log("\n--- Method 2: aiGenerateText (Plain Text returning JSON) ---");
    const start = Date.now();
    const result = await aiGenerateText({
      model: targetLanguageModel,
      prompt: testPrompt,
      temperature: 0.72,
    });
    const duration = Date.now() - start;
    console.log(`Method 2 Time: ${duration}ms`);
    console.log("Method 2 Output Length:", result.text.length);
  } catch (error: any) {
    console.error("Method 2 Failed:", error.message || error);
  }
}

main();
