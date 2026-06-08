import { PromptTemplate } from "./index";
import { Feature } from "../../../../prisma/generated/prisma/enums";

export const TopicGeneratorPrompt: PromptTemplate = {
  name: "Topic Generator",
  feature: Feature.TOPIC_GENERATOR,
  description:
    "Analyze competitor channels and/or a user prompt to generate viral topic ideas.",
  generatePrompt: (input: any) => {
    const { channelNames, channelName, recentVideos, outliers, prompt } = input;

    const hasCompetitors =
      (recentVideos && recentVideos.length > 0) ||
      channelNames ||
      channelName;
    const hasPrompt = prompt && prompt.trim().length > 0;

    // Format video list for competitor mode
    const formatVideos = (videos: any[]) =>
      videos
        .map((v, i) => `${i + 1}. Title: "${v.title}" | Views: ${v.viewCount}`)
        .join("\n");

    const recentVideosList =
      recentVideos && recentVideos.length > 0
        ? formatVideos(recentVideos)
        : "No recent videos provided.";

    const outliersList =
      outliers && outliers.length > 0
        ? formatVideos(outliers)
        : "No specific outliers identified.";

    const displayChannels = channelNames || channelName || "Unknown Channel";

    // ─── Build the prompt ────────────────────────────────────────────────────

    let contextSection = "";
    let taskSection = "";

    if (hasCompetitors && hasPrompt) {
      // COMBINED mode
      contextSection = `
**Competitor Channel(s):** ${displayChannels}

**User's Focus / Niche Prompt:**
${prompt}

**Competitor's Recent Videos (Last 20+ uploads):**
${recentVideosList}

**Outlier Videos (Performed significantly above average):**
${outliersList}
`.trim();

      taskSection = `
**Task:**
1. **Analyze the competitor's top content**: Based on the outlier videos, identify what topics, formats, and psychological hooks are working well right now.
2. **Factor in the user's prompt**: Use the niche/context from the user's prompt to make the suggestions more targeted and relevant.
3. **Suggest Improvements**: Identify ways the user can make better, more differentiated videos than this competitor.
4. **Generate 5 Viral Ideas**: Provide exactly 5 high-potential video ideas — inspired by the competitor's successful content and shaped by the user's described focus.
`.trim();
    } else if (hasCompetitors) {
      // COMPETITOR-ONLY mode
      contextSection = `
**Competitor Channel(s):** ${displayChannels}

**Recent Videos (Last 20+ uploads):**
${recentVideosList}

**Outlier Videos (Videos that performed significantly above their average):**
${outliersList}
`.trim();

      taskSection = `
**Task:**
1. **Analyze Top Content**: Look at the "Outlier Videos" and determine what topics, formats, or psychological hooks are working well for them right now.
2. **Suggest Improvements**: Identify actionable ways the user can make *better* videos than this competitor (e.g., better pacing, newer information, different perspective).
3. **Generate 5 Viral Ideas**: Provide exactly 5 distinct, high-potential video ideas inspired by the competitor's successful content but improved for virality.
`.trim();
    } else {
      // PROMPT-ONLY mode
      contextSection = `
**User's Niche / Topic Focus:**
${prompt}
`.trim();

      taskSection = `
**Task:**
1. **Analyze the Niche**: Based on what the user has described, identify the key content opportunities, audience pain points, and winning formats in this niche right now.
2. **Suggest Improvements**: Identify what most creators in this space are doing wrong or missing, and how the user can stand out.
3. **Generate 5 Viral Ideas**: Provide exactly 5 original, high-potential video ideas tailored specifically to the user's described niche and goals.
`.trim();
    }

    return `
${contextSection}

${taskSection}

**Output Format (Strict JSON):**
{
  "topContentAnalysis": "A 2-3 sentence analysis of what formats or topics are currently working (based on competitors and/or the described niche).",
  "improvements": [
    "A specific, actionable improvement",
    "Another specific improvement"
  ],
  "viralIdeas": [
    {
      "title": "A highly clickable, optimized title for the idea",
      "topic": "The general topic category",
      "reason": "Why this specific idea will perform well (psychological hook, trend, or format advantage)"
    }
  ]
}
`.trim();
  },
};

