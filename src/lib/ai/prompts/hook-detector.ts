import { PromptTemplate } from "./index";
import { Feature } from "../../../../prisma/generated/prisma/enums";

export const HookDetectorPrompt: PromptTemplate = {
  name: "Hook Detector",
  feature: Feature.HOOK_DETECTOR,
  description: "Analyze the first 3-5 seconds of a video script and determine if the hook is weak, average, or strong, and suggest improvements.",
  generatePrompt: (input: any) => {
    const { script } = input;
    
    return `
**Input Script / Intro:**
"${script}"

**Task:**
1. Analyze the hook based on factors like curiosity gap, pattern interrupt, pacing, value proposition, and emotional resonance.
2. Grade the hook as one of the following: "WEAK", "AVERAGE", or "STRONG".
3. Provide a brief explanation of why you gave this grade.
4. Provide exactly 3 rewritten, better hook suggestions that are optimized for high retention. For each suggestion, explain why it works better.

**Output Format (Strict JSON):**
{
  "status": "WEAK", // Must be "WEAK", "AVERAGE", or "STRONG"
  "explanation": "Brief explanation of why this hook received this grade. E.g., 'It starts too slowly and doesn't immediately tell the viewer what they will gain.'",
  "suggestions": [
    {
      "rewrite": "The actual rewritten hook text.",
      "reason": "Why this specific rewrite is highly effective."
    },
    {
      "rewrite": "Another rewritten hook text.",
      "reason": "Why this specific rewrite is highly effective."
    },
    {
      "rewrite": "A third rewritten hook text.",
      "reason": "Why this specific rewrite is highly effective."
    }
  ]
}
`;
  },
};
