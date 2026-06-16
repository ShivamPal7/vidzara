import { Feature } from "../../../../prisma/generated/prisma/enums";
import { PromptTemplate } from "./index";

export const ScriptWriterPrompt: PromptTemplate = {
  name: "Script Writer",
  feature: Feature.SCRIPT_WRITER,
  description: "Generate highly engaging, viral-optimized video scripts.",
  generatePrompt: (input: any) => {
    const { prompt, format, duration, tone, language, styleAnalysis } = input;

    const isShort = format === "short" || format === "insta" || format === "instagram" || format === "tiktok";
    const durationInMinutes = parseFloat(duration) || (isShort ? 1 : 10);
    const estimatedWords = Math.round(durationInMinutes * 150);
    const timeLabel = durationInMinutes < 1 ? `${Math.round(durationInMinutes * 60)} seconds` : `${durationInMinutes} minutes`;

    const structureGuidance = isShort
      ? `
      - Hook (0-3s): Visually and audibly jarring. Open a massive curiosity loop. No intros. No "Hey guys".
      - Body: High-paced delivery. Change the subject or visual every 2-3 seconds. Use fast analogies. YOU MUST expand this section significantly with detailed storytelling, multiple examples, and rich context to ensure you hit the ${estimatedWords} word count target. Do not summarize or cut it short.
      - Payoff & CTA (Last 3s): Deliver the answer fast and immediately ask a controversial/engaging question or loop the ending back to the start.
      `
      : `
      - The Hook (0-15s): The most critical part. Validate the click immediately. State the ultimate stakes. Why does this matter NOW?
      - The Setup (15-60s): Build the narrative arc. Make the viewer feel the pain point or the magnitude of the mystery.
      - The Escalation (Body): Divide into 3-4 clear 'Chapters'. In each chapter, solve one problem but introduce a bigger one. Use 'Show, Don't Tell'. Use metaphors.
      - The Climax & Payoff: Deliver the ultimate value promised in the title.
      - The Outro (Under 15s): No "thanks for watching". Give one final mind-bending thought or immediately bridge to another video concept.
      `;

    return `
Your assignment: Write a script based on the following topic.
Topic/Prompt: "${prompt}"

CONSTRAINTS & PARAMETERS:
- Format: ${isShort ? `Vertical Short-Form Video (${format === "tiktok" ? "TikTok" : format === "insta" || format === "instagram" ? "Instagram Reel" : "Shorts/Reel/TikTok"}) specifically targeted for a ${timeLabel} duration.` : "Long-form YouTube Video"}
- Target Length: Aim for approximately ${estimatedWords} words. You should generate a comprehensive script that provides enough depth and content to match this length (which corresponds to a ${timeLabel} video at a standard speaking pace).
- Tone/Vibe: ${tone || "Highly engaging, storytelling-driven, authoritative yet conversational"}
- Language: STRICTLY write the ENTIRE script in ${language || "English"}. Do not use any other language. All spoken text must be in this language.

VIRAL PSYCHOLOGY RULES YOU MUST FOLLOW:
1. NO BORING INTROS. Never say "Welcome back to the channel". Start exactly where the action or mystery is at its peak.
2. KILL THE FLUFF. If a sentence doesn't advance the plot, build curiosity, or deliver immense value, delete it.
3. OPEN LOOPS. Constantly tease what's coming later in the video to prevent clicking off.
4. RHYTHM & PACING. Mix short, punchy sentences with longer descriptive ones. 
5. THE 'BUT/THEREFORE' RULE. Events in the script should happen "because" of the previous event, or "but" something gets in the way. Never "and then".

STRUCTURE GUIDANCE:
${structureGuidance}
${
  styleAnalysis
    ? `
REFERENCE STYLE MANDATE (HIGHEST PRIORITY — OVERRIDE ALL DEFAULTS):
A reference video was analyzed. You MUST write the entire script in the creator's exact signature style described below.
This is not a suggestion. Every sentence, every structural choice, every word must reflect this style:

- Tone: ${styleAnalysis.toneDescription}
- Pacing: ${styleAnalysis.pacingStyle}
- Sentence Rhythm: ${styleAnalysis.sentenceRhythm} sentences — use this rhythm throughout
- Structural Pattern: ${styleAnalysis.structuralPattern}
- Hook Techniques to replicate: ${styleAnalysis.hookTechniques.join(", ")}
- Phrasing/Vocabulary Patterns to use: ${styleAnalysis.phrasingPatterns.join(", ")}
- Uses Personal Storytelling: ${styleAnalysis.usesStorytelling ? "YES — write in first person, share personal anecdotes" : "NO — stay objective/analytical"}
- Signature Stylistic Quirks to replicate: ${styleAnalysis.stylisticQuirks.join(", ")}

CRITICAL: Do NOT fall back to generic YouTube script style. Every line must feel like it was written by the creator of the reference video.
`
    : ""
}
HTML FORMATTING RULES FOR SCRIPT 'content':
- Use <h3> tags for section headers (e.g., <h3>The Hook</h3>, <h3>Chapter 1: The Illusion</h3>).
- Use <p> tags for the spoken script lines.
- Use <strong> tags within <p> to emphasize words the creator should stress vocally.
- DO NOT use <h1> or <h2> tags.
- The script content must be valid HTML.

REFINEMENT SUGGESTIONS RULES:
- 'refinementSuggestions' must contain exactly 3 short follow-up prompts for editing the WRITTEN SCRIPT TEXT ONLY.
- Each suggestion must be a direct command under 6 words. (e.g. "Make the hook shorter", "Add a cliffhanger ending", "Use simpler words", "Make outro punchier")
- DO NOT suggest visuals, camera directions, audio cues, pacing notes, or anything outside the written text.

Write the best script of your career.
`;
  },
};
