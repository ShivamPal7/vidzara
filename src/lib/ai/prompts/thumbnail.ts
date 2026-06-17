import { Feature } from "../../../../prisma/generated/prisma/enums";

export const ThumbnailConceptPrompt = {
  name: "Thumbnail Concept Generator",
  feature: Feature.THUMBNAIL_CONCEPT,
  description: "Generate high-converting YouTube thumbnail concepts.",
  generatePrompt: (input: any) => {
    const options = input.options || {};
    const count = options.count || 3;

    return `
Topic/Idea: "${input.content}"

You are an expert YouTube thumbnail strategist and visual psychologist. Your goal is to analyze the video topic, understand the core audience intent, curiosity angle, promised payoff, and hook, and then generate exactly ${count} distinct, high-converting thumbnail concepts.

For each concept, you must design:
1. Niche-Aware Understanding: Create visual hooks tailored to the specific content category (e.g., tech, finance, storytelling, gaming, challenge, educational). Do not make them generic. Identify the single biggest curiosity trigger, conflict, or result promised in the video.
2. 5 Thumbnail Text Ideas (in the 'textIdeas' field): Generate exactly 5 different punchy, high-contrast, click-optimized text options (max 4 words each) that evoke curiosity, urgency, or conflict.
   - Example Topic: "I Used AI to Build 5 Faceless YouTube Channels in 7 Days"
     Generated Text Options:
     * "AI Built 5 Channels"
     * "7 Days AI Challenge"
     * "I Let AI Do Everything"
     * "5 Faceless Channels Later..."
     * "This AI Shocked Me"
   - Make sure they are high-impact and readable on small mobile screens. Set the best single one as the primary 'textIdea' for backward compatibility.
3. A complete ready-to-use thumbnail creation prompt (in the 'thumbnailPrompt' field) containing:
   - textPlacement: Detailed styling and placement guidelines (e.g., font style, background plates/boxes, left/right alignment, avoiding the timestamp/overlays).
   - subject: Detailed description of the primary subject, human character, or focal object.
   - facialExpression: Exaggerated facial expression, gaze direction, and emotional trigger of the subject (e.g., shock, curiosity, smug confidence, intense concentration).
   - background: The environment, background details, relevant props, and depth of field.
   - composition: Camera shot style, framing, off-center positioning (Rule of Thirds), and layout balance.
   - lighting: Detailed lighting design, source direction, intensity, and rim light highlights.
   - colorsDescription: Curated color palette details, high-contrast pairs (e.g., orange/blue), and dark-mode optimization.
   - midjourneyPrompt: A single ready-to-use image generation prompt (Midjourney v6.0 / DALL-E 3 format) incorporating all these details (subject, expression, background, composition, lighting, colors, style, and texture) but NO actual text. Do not include quotes, watermarks, or text in the image prompt itself (use '--no text, words, font, watermark').

Return ONLY valid JSON matching the following schema structure, without any markdown formatting wrappers or backticks:
{
  "concepts": [
    {
      "textIdea": "Primary text idea (max 4 words)",
      "textIdeas": [
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4",
        "Option 5"
      ],
      "emotion": "Suggested facial expression or emotion",
      "layout": "Detailed composition layout description",
      "colors": ["#HEX1", "#HEX2", "#HEX3"],
      "imagePrompt": "Complete copy-pasteable Midjourney prompt string...",
      "thumbnailPrompt": {
        "textPlacement": "Description of text positioning, font style, and backing colors...",
        "subject": "Details of the main subject/character...",
        "facialExpression": "Details of the facial expression and emotional impact...",
        "background": "Description of the background setting and key elements...",
        "composition": "Framing, shot scale, and Rule of Thirds layout...",
        "lighting": "Lighting direction, color temperature, and highlight details...",
        "colorsDescription": "Color harmony explanation and contrast optimization...",
        "midjourneyPrompt": "Complete copy-pasteable Midjourney prompt string..."
      }
    }
  ]
}
`;
  }
};
