import { PromptTemplate } from "./index";
import { Feature } from "../../../../prisma/generated/prisma/enums";

export const VideoSEOPrompt: PromptTemplate = {
  name: "Video SEO Generator",
  feature: Feature.VIDEO_SEO,
  description: "Generate high-CTR titles, optimized descriptions, tags, and hashtags for YouTube videos.",
  generatePrompt: (input: any) => {
    const { mode, content, options } = input;
    // content can be topic, key points, or full script based on mode.
    // options: { title, description, tags, hashtags } toggles from the frontend

    return `
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
    -   Each tag MUST include an estimated relevance/search-volume score from 0 to 100.

4.  **Hashtags (10):**
    -   Generate 10 relevant hashtags (without the # symbol in the array, just the text).

5.  **Keywords (10-15):**
    -   List 10-15 target keywords (mix of short-tail and long-tail) that this video should rank for.
    -   Each keyword MUST include an estimated relevance/search-volume score from 0 to 100.

**Output Format (Strict JSON):**
{
  "titles": ["Title 1", "Title 2", ...],
  "description": "Full description text...",
  "tags": [{ "keyword": "tag1", "score": 85 }, { "keyword": "tag2", "score": 72 }, ...],
  "hashtags": ["hashtag1", "hashtag2", ...],
  "keywords": [{ "keyword": "keyword 1", "score": 90 }, { "keyword": "keyword 2", "score": 78 }, ...]
}
`;
  },
};
