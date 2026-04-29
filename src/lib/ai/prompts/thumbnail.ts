import { Feature } from "../../../../prisma/generated/prisma/enums";

export const ThumbnailConceptPrompt = {
  name: "Thumbnail Concept Generator",
  feature: Feature.THUMBNAIL_CONCEPT,
  description: "Generate high-converting YouTube thumbnail concepts.",
  generatePrompt: (input: any) => `
You are an expert YouTube strategist and graphic designer who specializes in creating ultra-high-converting, viral thumbnails. Your goal is to provide exactly 5 distinctive thumbnail concepts based on the following topic or script idea.

Topic/Idea: "${input.content}"

${input.options?.text !== false ? "- Text Ideas: Provide short, punchy, high-contrast text that sparks curiosity (max 4 words)." : ""}
${input.options?.emotions !== false ? "- Emotions: Specify the exact facial expression or emotion the subject should portray (e.g., Shock, Joy, Confusion) to maximize CTR." : ""}
${input.options?.layout !== false ? "- Layouts: Detail the visual composition. Focus on the Rule of Thirds, subject placement, focal points, and specific background elements." : ""}
${input.options?.colors !== false ? "- Colors: Provide a high-contrast color palette based on color psychology (e.g., Red for urgency, Yellow for energy, Blue for trust) to make the thumbnail pop in dark mode." : ""}

Generate exactly 5 distinct, highly clickable concepts.
Return ONLY valid JSON in the following format without markdown blocks:
{
  "concepts": [
    {
      "textIdea": "Punchy text",
      "emotion": "Specific facial expression",
      "layout": "Detailed visual composition...",
      "colors": ["#HEX1", "#HEX2", "#HEX3"]
    }
  ]
}
`
};
