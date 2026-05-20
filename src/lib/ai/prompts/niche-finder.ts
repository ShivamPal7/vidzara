import { PromptTemplate } from "./index";
import { Feature } from "../../../../prisma/generated/prisma/enums";

export const NicheFinderPrompt: PromptTemplate = {
  name: "Niche Finder",
  feature: Feature.NICHE_FINDER,
  description: "Discover profitable and low-competition content niches based on your interests, skills, and target format.",
  generatePrompt: (input: any) => {
    const { interest, skillLevel, contentType } = input;

    return `
**Creator Profile:**
- **Topic Area / Interest:** "${interest}"
- **Skill Level:** ${skillLevel}
- **Content Format:** ${contentType}

**Your Task:**
You are a niche strategy expert. Identify exactly 3 distinct, sustainable **content niches** — not video titles, not one-off video ideas, but genuine **content territories** the creator can own long-term and build an entire channel or series around.

A niche is a clearly defined audience + topic intersection where a creator can consistently produce content, build authority, and grow a loyal audience. Think: "Budget Travel for Solo Female Travelers in Southeast Asia" — not "10 Budget Travel Tips".

**Rules for each niche:**

1. **Niche Name**: A punchy, memorable 3–8 word name that defines the niche clearly. It should feel like a channel concept or a content category — broad enough to sustain 50+ videos but specific enough to attract a loyal audience.

2. **Niche Identity**: Describe the niche in 1–2 sentences. Who is the target audience? What specific problem, passion, or identity does this niche serve? What makes it a sustainable long-term content territory — not just a trending topic?

3. **Why This Niche Wins**: Explain in 2–3 sentences the structural opportunity — why is this niche underserved or growing? What gives a ${skillLevel}-level creator an edge here? Why does the ${contentType} format fit this niche uniquely well?

4. **Competition Level**: Assess overall market saturation. Must be exactly one of: "Low", "Medium", "High".

5. **Monetization Potential**: List the specific monetization paths this niche enables long-term — affiliate categories, digital product types, brand deal verticals, community models, course potential, etc. Be realistic and specific.

6. **Content Strategy**: Describe the overarching content strategy for this niche — the types of recurring content pillars, series formats, or content angles that would define the channel. Do NOT list individual video titles. Think themes and series (e.g., "Weekly breakdowns of...", "Deep-dive comparisons of...", "Beginner walkthroughs covering...").

7. **Metrics (1–100 numeric scores):**
   - \`viralScore\`: Viral and shareability potential of this niche's content
   - \`revenueScore\`: Long-term revenue and monetization potential
   - \`competitionScore\`: Level of competition (100 = fully saturated, 1 = completely untapped)

**Output Format (Strict JSON — no markdown, no code blocks, raw JSON only):**
{
  "niches": [
    {
      "name": "Niche Name Here",
      "competitionLevel": "Low" | "Medium" | "High",
      "viralScore": 85,
      "revenueScore": 78,
      "competitionScore": 42,
      "monetizationPotential": "Specific monetization channels and products...",
      "contentStrategy": "Overarching content strategy, recurring series themes, and content pillars..."
    }
  ]
}
`;
  },
};
