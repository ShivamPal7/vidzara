import { PromptTemplate } from "./index";
import { Feature } from "../../../../prisma/generated/prisma/enums";

export const NicheFinderPrompt: PromptTemplate = {
  name: "Niche Finder",
  feature: Feature.NICHE_FINDER,
  description: "Discover profitable and low-competition content niches based on your interests, skills, and target format.",
  generatePrompt: (input: any) => {
    const { country, category, subCategory, subSubCategory, customInterest, skillLevel, contentType } = input;

    let targetInterest = "";
    if (category === "Other") {
      targetInterest = customInterest || "Custom Interest";
    } else {
      targetInterest = category;
      if (subCategory) targetInterest += ` -> ${subCategory}`;
      if (subSubCategory) targetInterest += ` -> ${subSubCategory}`;
    }

    return `
**Creator Profile:**
- **Interest / Topic path:** "${targetInterest}"
- **Target Country Audience:** ${country}
- **Skill Level:** ${skillLevel}
- **Content Format:** ${contentType}

**Your Task:**
You are a niche strategy expert. Identify exactly 3 distinct, sustainable **content niches** — not video titles, not one-off video ideas, but genuine **content territories** the creator can own long-term and build an entire channel or series around.

A niche is a clearly defined audience + topic intersection where a creator can consistently produce content, build authority, and grow a loyal audience. Think: "Budget Travel for Solo Female Travelers in Southeast Asia" — not "10 Budget Travel Tips".

**CRITICAL RULES:**
1. **Target Country Audience Specificity (${country}):** Custom-tailor your recommendations, metrics, and trends to ${country}'s audience. Consider local trends, monetization availability (e.g. ad rates/sponsors in ${country}), and cultural appeal.
2. **Beginner-Friendly / Skill-Level Fit:** Ensure the niches are highly practical, simple, and realistic for a creator at a "${skillLevel}" skill level. Avoid complex, overly broad, or confusing topics. Give them a clear topic direction they can start producing videos for tomorrow!
3. **Structured JSON Output:** Return the response strictly matching the schema below.

**Rules for each of the 3 niches:**
1. **Name**: A punchy, memorable 3–8 word name (like a channel concept).
2. **Competition Level**: "Low", "Medium", or "High".
3. **Metrics (1–100 numeric scores):**
   - \`viralScore\`: Shareability and virality potential.
   - \`revenueScore\`: Combined long-term monetization potential.
   - \`competitionScore\`: Level of saturation (100 = fully saturated, 1 = completely untapped).
4. **Audience Metrics (Audience Size, Search Demand, Growth Trend, Viral Potential, Competition Level):** Specific descriptive tags explaining the audience numbers and search velocity in ${country}.
5. **Monetization Scores (Adsense, Affiliate, Sponsorship, Digital Product, Course Selling):** Numeric scores from 1 to 100 indicating the viability of each revenue stream in ${country}.
6. **Monetization Potential**: Realistic and specific explanation of the top monetization channels.
7. **Content Strategy**: Clear description of the recurring content pillars or video series.

**Market Trends (marketTrends):**
Provide an analysis of the broader category space in 2026 for ${country}:
- Growing Niches: 2-3 specific niches growing fast in 2026.
- New Trends: Emerging formats, styles, or concepts in 2026.
- Saturated Niches: Saturated areas creators should avoid.
- Opportunity Zone: Sweet spot niches in 2026.

**Final Recommendation (finalRecommendation):**
Select the absolute best niche of the 3 that fits the creator's profile:
- bestNiche: Name of the best niche.
- whyRightForYou: Detailed explanation of why it fits their skill level (${skillLevel}) and format (${contentType}) in ${country}.
- competition: Competition level.
- growthPotential: Growth explanation.
- monetizationPotential: Monetization explanation.

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
      "contentStrategy": "Overarching content strategy, recurring series themes, and content pillars...",
      "audienceMetrics": {
        "audienceSize": "Massive (5M+)",
        "searchDemand": "Very High",
        "growthTrend": "Exploding",
        "viralPotential": "High",
        "competitionLevel": "Moderate"
      },
      "monetizationScores": {
        "adsense": 80,
        "affiliate": 90,
        "sponsorship": 75,
        "digitalProduct": 85,
        "courseSelling": 60
      }
    }
  ],
  "marketTrends": {
    "growingNiches2026": ["Niche A...", "Niche B..."],
    "newTrends": ["Trend A...", "Trend B..."],
    "saturatedNiches": ["Saturated Niche A...", "Saturated Niche B..."],
    "opportunityZone": ["Opportunity Niche A...", "Opportunity Niche B..."]
  },
  "finalRecommendation": {
    "bestNiche": "Best Niche Name",
    "whyRightForYou": "Why it fits the creator...",
    "competition": "Low" | "Medium" | "High",
    "growthPotential": "Growth outlook details...",
    "monetizationPotential": "Monetization outlook details..."
  }
}
`;
  },
};
