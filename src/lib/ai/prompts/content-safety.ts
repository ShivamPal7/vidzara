import { PromptTemplate } from "./index";
import { Feature } from "../../../../prisma/generated/prisma/enums";

export const ContentSafetyPrompt: PromptTemplate = {
  name: "Content Safety Checker",
  feature: Feature.CONTENT_SAFETY,
  description: "Check content for clickbait risk, algorithm issues, and potential YouTube policy violations.",
  generatePrompt: (input: any) => {
    const { content } = input;
    
    return `
**Input Content:**
"${content}"

**Task:**
Analyze the content for three main categories of issues:
1. **Clickbait Risk**: Overly sensational language, misleading promises, or extreme hyperbole that viewers or the algorithm might penalize as clickbait.
2. **Policy Violations**: Any language that violates YouTube's Advertiser-Friendly Guidelines or Community Guidelines (e.g., violence, profanity, sensitive events, dangerous acts, hate speech).
3. **Algorithm Issues**: Factors that might hurt engagement or reach (e.g., extremely long monologues without calls to action, repetitive spammy keywords).

For each issue found, you must:
- Highlight the exact specific phrase or segment causing the issue.
- Categorize it ("clickbait", "policy", or "algorithm").
- Explain the reason clearly.
- Provide a safer, optimized rewrite for that specific phrase (or the overall text if it applies broadly).

Finally, provide an overall **Risk Score** from 0 to 100, where 100 means perfectly safe and compliant, and lower scores indicate higher risk. Provide a 1-2 sentence summary of your findings.

**Requirements:**
- If the content is perfectly safe, output an empty array for highlights and suggestions, and a score of 100.
- Ensure the \`highlights\` and \`suggestions\` are directly correlated where possible.

**Output Format (Strict JSON):**
{
  "score": 85,
  "summary": "The content is mostly safe but contains minor clickbait elements that could affect viewer retention.",
  "highlights": [
    {
      "text": "you won't believe what happens",
      "type": "clickbait",
      "reason": "Highly sensational phrase often flagged by algorithms as low-quality clickbait."
    }
  ],
  "suggestions": [
    {
      "original": "you won't believe what happens",
      "rewrite": "the surprising outcome explained",
      "reason": "Maintains curiosity without triggering clickbait filters."
    }
  ]
}
`;
  },
};
