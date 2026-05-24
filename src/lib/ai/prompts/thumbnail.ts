import { Feature } from "../../../../prisma/generated/prisma/enums";

export const ThumbnailConceptPrompt = {
  name: "Thumbnail Concept Generator",
  feature: Feature.THUMBNAIL_CONCEPT,
  description: "Generate high-converting YouTube thumbnail concepts.",
  generatePrompt: (input: any) => {
    const options = input.options || {};
    const count = options.count || 3;
    const generateImagePrompt = options.generateImagePrompt === true;

    return `
Topic/Idea: "${input.content}"

Generate exactly ${count} distinct, highly clickable YouTube thumbnail concepts.

${options.text !== false ? "- Text Ideas: Provide short, punchy, high-contrast text that sparks curiosity (max 4 words)." : ""}
${options.emotions !== false ? "- Emotions: Specify the exact facial expression or emotion the subject should portray (e.g., Shock, Joy, Confusion) to maximize CTR." : ""}
${options.layout !== false ? "- Layouts: Detail the visual composition. Focus on the Rule of Thirds, subject placement, focal points, and specific background elements." : ""}
${options.colors !== false ? "- Colors: Provide a high-contrast color palette based on color psychology (e.g., Red for urgency, Yellow for energy, Blue for trust) to make the thumbnail pop in dark mode." : ""}
${generateImagePrompt ? `- Image Generation Prompt: For each concept, write a highly detailed, professional, high-CTR YouTube thumbnail prompt optimized for Midjourney (v6.0+) and DALL-E 3.
  Follow this exact, highly effective prompt structure:
  "[Subject & Exaggerated Expression], close-up shot, looking directly at the camera, [Specific High-Stakes Object or Environment in the Background], [Lighting Style: cinematic, rim lighting, glowing neon, intense high contrast], [Composition: subject placed off-center on one third of the frame leaving clean negative space on the other side for text], ultra-saturated vivid colors, photographic 8k resolution, professional editorial portrait photography style, --ar 16:9 --style raw --s 250 --no text, words, font, watermark, logo, signature"
  Write this as a single, contiguous string. Make it extremely high stakes, vivid, and eye-catching to ensure a high CTR.
  CRITICAL: The prompt details (subject, emotion, colors, and composition layout) MUST exactly correspond to and reflect the specific 'textIdea', 'emotion', 'layout', and 'colors' generated for this particular concept option so they form a coherent, matched set.` : ""}

Return ONLY valid JSON in the following format without markdown blocks:
{
  "concepts": [
    {
      "textIdea": "Punchy text",
      "emotion": "Specific facial expression",
      "layout": "Detailed visual composition...",
      "colors": ["#HEX1", "#HEX2", "#HEX3"]${generateImagePrompt ? `,
      "imagePrompt": "Detailed AI image generation prompt..."` : ""}
    }
  ]
}
`;
  }
};
