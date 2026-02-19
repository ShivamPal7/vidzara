import { PromptTemplate } from "./index";
import { Feature } from "../../../../prisma/generated/prisma/enums";

export const VideoSEOPrompt: PromptTemplate = {
  name: "Video SEO Generator",
  feature: Feature.VIDEO_SEO,
  description: "Generate high-CTR titles, optimized descriptions, tags, and hashtags for YouTube videos.",
  generatePrompt: (input: any) => {
    const { mode, content } = input;
    // content can be topic, key points, or full script based on mode.

    return `
You are an expert YouTube Strategist and SEO Specialist. Your goal is to generate highly clickable, algorithm-optimized metadata for a YouTube video.

**Input Context:**
- **Mode:** ${mode} (The user provided a ${mode})
- **Content:** "${content}"

**Task:**
Generate the following metadata in strict JSON format.

**Requirements:**

1.  **Titles (10 total):**
    -   Create 10 high-CTR, click-worthy titles.
    -   Mix strategies: Curiosity gaps, emotional triggers, "How-to" value, and negative hooks (e.g., "Stop doing this").
    -   Keep them under 60 characters where possible.
    -   MUST be engaging and natural, not robotic.

2.  **Description:**
    -   Write a compelling, SEO-optimized video description (first 2-3 lines are crucial).
    -   Include the primary keywords naturally in the first paragraph.
    -   Include a placeholder section for "Timestamps" (e.g., "0:00 - Intro").
    -   Include a placeholder section for "Links & CTA".
    -   Tone: Professional, helpful, and engaging.

3.  **Tags (15-25):**
    -   Generate 15-25 separate tags.
    -   Mix broad niche tags and specific long-tail tags.

4.  **Hashtags (10):**
    -   Generate 10 relevant hashtags (without the # symbol in the array, just the text).

5.  **Keywords:**
    -   List 10-15 target keywords (mix of short-tail and long-tail) that this video should rank for.

**Output Format (Strict JSON):**
{
  "titles": ["Title 1", "Title 2", ...],
  "description": "Full description text...",
  "tags": ["tag1", "tag2", ...],
  "hashtags": ["hashtag1", "hashtag2", ...],
  "keywords": ["keyword 1", "keyword 2", ...]
}
`;
  },
};
