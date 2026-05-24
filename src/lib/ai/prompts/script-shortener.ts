import { Feature } from "../../../../prisma/generated/prisma/enums";

export const ScriptShortenerPrompt = {
  name: "Script Shortener",
  feature: Feature.SCRIPT_SHORTENER,
  description: "Convert long scripts into Reels/Shorts-friendly formats",
  generatePrompt: (input: string, context?: { count?: number }) => {
    const count = context?.count || 3;

    return `I am going to provide you with a long-form video script.
Your task is to extract, condense, and rewrite the best, most engaging parts of this long script into exactly ${count} highly engaging short-form scripts (perfect for YouTube Shorts, Instagram Reels, or TikTok).

Each short script should be designed to be under 60 seconds when spoken (roughly 120-150 words).

For each short, you must provide:
1. Title: A catchy internal title for the short.
2. Hook: A punchy, attention-grabbing opening (first 3 seconds).
3. Body: The core value or story, fast-paced and engaging.
4. Call To Action (CTA): A quick, natural call to action (e.g., subscribe, like, comment).
5. Visuals: A brief suggestion for what should be on screen (b-roll, text, camera angles).

LONG SCRIPT:
"""
${input}
"""

OUTPUT FORMAT:
Provide the output strictly as a JSON object with a single key "shorts" containing the array of short scripts. Do not include markdown formatting like \`\`\`json.
{
  "shorts": [
    {
      "title": "string",
      "hook": "string",
      "body": "string",
      "cta": "string",
      "visuals": "string"
    }
  ]
}

Ensure exactly ${count} items in the array.`;
  },
};
