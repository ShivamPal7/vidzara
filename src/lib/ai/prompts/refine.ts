import { PromptTemplate } from "./index";
import { Feature } from "../../../../prisma/generated/prisma/enums";

/**
 * Refine prompt template — used by the RefinePopover to modify individual sections
 * (title, description) of generated Video SEO content.
 * 
 * This isn't tied to a specific Feature enum value since it's a sub-action,
 * but we export a standalone function for the refine server action.
 */

export function buildRefinePrompt(input: {
  section: string;       // "title" | "description"
  content: string;       // current content to refine
  action: string;        // "Make Shorter" | "Make Longer" | "Add Excitement" | "Change Tone" | "Translate" | "Custom Instruction"
  value?: string;        // e.g. "Professional" for tone, "Spanish" for translate, or custom text
}): string {
  const { section, content, action, value } = input;

  let instruction = "";

  switch (action) {
    case "Make Shorter":
      instruction = "Make the following content shorter and more concise while preserving the key message and SEO value.";
      break;
    case "Make Longer":
      instruction = "Expand the following content with more detail, context, and SEO-rich language while keeping it natural and engaging.";
      break;
    case "Add Excitement":
      instruction = "Rewrite the following content to be more exciting, energetic, and attention-grabbing. Use power words and emotional triggers.";
      break;
    case "Change Tone":
      instruction = `Rewrite the following content in a ${value || "professional"} tone while preserving the core message and SEO value.`;
      break;
    case "Translate":
      instruction = `Translate the following content to ${value || "Spanish"} while maintaining SEO optimization for that language. Keep it natural and fluent.`;
      break;
    case "Custom Instruction":
      instruction = value || "Improve the following content.";
      break;
    default:
      instruction = "Improve the following content while maintaining its SEO value.";
  }

  return `
You are an expert YouTube SEO specialist and content editor.

**Task:** Refine a video ${section}.

**Instruction:** ${instruction}

**Current Content:**
"${content}"

**Rules:**
- Return ONLY the refined text as a plain string, no JSON, no quotes, no explanation.
- Maintain SEO best practices.
- Keep the output appropriate for a YouTube video ${section}.
- If it's a title, keep it under 60 characters.
- If it's a description, maintain proper formatting with line breaks.
`;
}
