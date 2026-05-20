import { PromptTemplate } from "./index";
import { Feature } from "../../../../prisma/generated/prisma/enums";

export const ConsistencyCheckerPrompt: PromptTemplate = {
  name: "Consistency Checker",
  feature: Feature.CONSISTENCY_CHECKER,
  description: "Audits YouTube channels for upload schedules, topical consistency, and brand packaging alignment.",
  generatePrompt: (input: any) => {
    const { channelTitle, recentVideos, postingStats } = input;

    return `
You are analyzing the brand consistency and posting regularity for the YouTube channel: "${channelTitle}".

**CONTEXT DETAILS:**
- Channel Title: ${channelTitle}
- Total Videos Evaluated: ${recentVideos.length}
- Calculated Posting Interval Statistics: 
  * Average days between uploads: ${postingStats.averageIntervalDays.toFixed(1)} days
  * Maximum days between uploads: ${postingStats.maxIntervalDays} days
  * Minimum days between uploads: ${postingStats.minIntervalDays} days
  * Schedule Deviation Index (Variance): ${postingStats.varianceDays.toFixed(1)}

**RECENT UPLOADS LIST (titles, publication dates, and descriptions):**
${JSON.stringify(recentVideos, null, 2)}

**YOUR TASKS:**
Perform a comprehensive Brand Integrity and Posting Cadence audit based on this data. Evaluate:
1. **Topical Drift / Niche Alignment:** Are they staying focused on their core authority, or are they drifting across confusingly unrelated categories?
2. **Packaging Style Consistency:** Are titles, format structures, and visual expectations matching, or are some videos written in completely different styles?
3. **Posting Cadence:** Based on the calculated posting intervals, explain their posting pattern (e.g., Weekly, Bi-weekly, irregular) and suggest optimization.
4. **Growth Velocity:** Assess recent view velocity trends. Is it accelerating (up), stagnating (flat), or decelerating (down)?
5. **Action Plan:** Create distinct lists of positive items they should double down on (Continue Doing), issues to eliminate (Stop Doing), and an overarching Improvement Plan.

Format your response in strict compliance with the Zod schema structure. Do not include markdown code wrapping like \`\`\`json. Return pure JSON.
`;
  },
};
