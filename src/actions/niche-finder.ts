"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AIEngine } from "@/lib/ai/engine";
import { Feature } from "../../prisma/generated/prisma/enums";
import { deductCreditsAction } from "./credits";
import { revalidatePath } from "next/cache";

import { GeminiProvider } from "@/lib/ai/provider";

// ── Helpers ─────────────────────────────────────────────────────────────

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

function errorResponse(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Something went wrong.";
  console.error("Niche Finder Action Error:", error);
  return { success: false as const, error: message };
}

// ── Schemas ─────────────────────────────────────────────────────────────

const generateSchema = z.object({
  country: z.string().min(1, "Please select a target country"),
  category: z.string().min(1, "Please select a category"),
  subCategory: z.string().optional(),
  subSubCategory: z.string().optional(),
  customInterest: z
    .string()
    .max(500, "Custom interest cannot exceed 500 characters")
    .optional(),
  skillLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  contentType: z.string().min(1, "Please select a content format"),
});

// ── 1. Generate Niche Ideas ─────────────────────────────────────────────

export async function generateNicheIdeas(
  input: z.infer<typeof generateSchema>
) {
  try {
    const validated = generateSchema.parse(input);
    const userId = await getAuthenticatedUserId();

    const result = await AIEngine.generate({
      feature: Feature.NICHE_FINDER,
      input: {
        country: validated.country,
        category: validated.category,
        subCategory: validated.subCategory,
        subSubCategory: validated.subSubCategory,
        customInterest: validated.customInterest,
        skillLevel: validated.skillLevel,
        contentType: validated.contentType,
      },
      userId,
    });

    if (!result.success) {
      return { success: false as const, error: result.error };
    }

    // Deduct credits
    const creditRes = await deductCreditsAction(Feature.NICHE_FINDER);
    if (!creditRes.success) {
      return { success: false as const, error: creditRes.error };
    }

    revalidatePath("/dashboard/analyze/niche-finder");

    return {
      success: true as const,
      data: result.data,
      generationId: result.generationId,
    };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 2. List Niche Generations ───────────────────────────────────────────

export async function getNicheGenerations() {
  try {
    const userId = await getAuthenticatedUserId();

    const generations = await prisma.generation.findMany({
      where: {
        userId,
        feature: Feature.NICHE_FINDER,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        input: true,
        output: true,
        createdAt: true,
        isFavorite: true,
      },
    });

    return { success: true as const, data: generations };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 3. Get Niche Generation Detail ──────────────────────────────────────

export async function getNicheGenerationById(generationId: string) {
  try {
    const userId = await getAuthenticatedUserId();

    const generation = await prisma.generation.findFirst({
      where: {
        id: generationId,
        userId,
        feature: Feature.NICHE_FINDER,
      },
      select: {
        id: true,
        input: true,
        output: true,
        createdAt: true,
        isFavorite: true,
      },
    });

    if (!generation) {
      return { success: false as const, error: "Generation not found." };
    }

    return { success: true as const, data: generation };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 4. Toggle Favorite ──────────────────────────────────────────────────

export async function toggleFavorite(generationId: string) {
  try {
    const userId = await getAuthenticatedUserId();

    const generation = await prisma.generation.findFirst({
      where: { id: generationId, userId, feature: Feature.NICHE_FINDER },
      select: { id: true, isFavorite: true },
    });

    if (!generation) {
      return { success: false as const, error: "Generation not found." };
    }

    const updated = await prisma.generation.update({
      where: { id: generationId },
      data: { isFavorite: !generation.isFavorite },
    });

    revalidatePath("/dashboard/analyze/niche-finder");

    return {
      success: true as const,
      isFavorite: updated.isFavorite,
    };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 5. Delete Generation ────────────────────────────────────────────────

export async function deleteGeneration(generationId: string) {
  try {
    const userId = await getAuthenticatedUserId();

    const generation = await prisma.generation.findFirst({
      where: { id: generationId, userId, feature: Feature.NICHE_FINDER },
      select: { id: true },
    });

    if (!generation) {
      return { success: false as const, error: "Generation not found." };
    }

    await prisma.generation.delete({
      where: { id: generationId },
    });

    revalidatePath("/dashboard/analyze/niche-finder");

    return { success: true as const };
  } catch (error) {
    return errorResponse(error);
  }
}

// ── 6. Predefined flow structures and category retrieval ─────────────────

const PREDEFINED_FLOW: Record<string, {
  subCategories: string[];
  subSubCategories?: Record<string, string[]>;
}> = {
  "AI": {
    subCategories: [
      "AI Tools Tutorials",
      "ChatGPT Tutorials",
      "AI Automation",
      "AI Business",
      "AI News",
      "AI Side Hustles",
      "AI Content Creation",
      "AI Video Editing",
      "AI Story Videos",
      "AI Cartoon Stories",
      "AI Motivational Stories",
      "AI Facts Channel",
      "AI Case Studies"
    ],
    subSubCategories: {
      "AI Story Videos": [
        "Horror Stories",
        "Motivational Stories",
        "Success Stories",
        "Business Stories",
        "Cartoon Stories",
        "Kids Stories",
        "Historical Stories"
      ]
    }
  },
  "Gaming": {
    subCategories: [
      "Mobile Gaming",
      "PC Gaming",
      "Console Gaming",
      "Game Reviews",
      "Game Lore",
      "Esports",
      "Gameplay Videos",
      "Gaming Shorts",
      "Gaming Facts",
      "Gaming Tutorials",
      "Gaming News"
    ],
    subSubCategories: {
      "Mobile Gaming": [
        "BGMI",
        "Free Fire",
        "COD Mobile",
        "Clash of Clans",
        "Minecraft"
      ]
    }
  },
  "Education": {
    subCategories: [
      "Competitive Exams",
      "Coding",
      "Career Guidance",
      "School Education",
      "Language Learning",
      "Science Education",
      "Math Education",
      "AI Education"
    ]
  },
  "Finance": {
    subCategories: [
      "Stock Market",
      "Personal Finance",
      "Mutual Funds",
      "Business Finance",
      "Cryptocurrency",
      "Make Money Online"
    ]
  },
  "Motivation": {
    subCategories: [
      "Motivational Stories",
      "Success Stories",
      "Self Improvement",
      "Mindset Content",
      "Productivity",
      "Discipline Content"
    ]
  },
  "Cartoon Story": {
    subCategories: [
      "Kids Stories",
      "Moral Stories",
      "Hindi Cartoon Stories",
      "English Cartoon Stories",
      "Motivational Stories",
      "Educational Stories",
      "AI Animated Stories"
    ]
  }
};

function findPredefinedCategory(category: string): string | null {
  const norm = category.toLowerCase().trim();
  if (norm === "ai" || norm === "artificial intelligence") return "AI";
  if (norm === "gaming" || norm === "games" || norm === "game") return "Gaming";
  if (norm === "education" || norm === "school" || norm === "teaching" || norm === "learning") return "Education";
  if (norm === "finance" || norm === "money" || norm === "investing") return "Finance";
  if (norm === "motivation" || norm === "motivational" || norm === "inspirational") return "Motivation";
  if (norm === "cartoon story" || norm === "cartoon stories" || norm === "cartoon") return "Cartoon Story";
  return null;
}

function findPredefinedSubSub(categoryKey: string, subCategory: string): string[] | null {
  const flow = PREDEFINED_FLOW[categoryKey];
  if (!flow || !flow.subSubCategories) return null;
  
  const normSub = subCategory.toLowerCase().trim();
  for (const key of Object.keys(flow.subSubCategories)) {
    if (key.toLowerCase().trim() === normSub) {
      return flow.subSubCategories[key];
    }
  }
  return null;
}

export async function getSubCategories(category: string, country: string) {
  try {
    await getAuthenticatedUserId(); // Shield with authentication
    
    const predefKey = findPredefinedCategory(category);
    if (predefKey) {
      return { success: true as const, data: PREDEFINED_FLOW[predefKey].subCategories };
    }

    // Custom Category -> Call Gemini to generate dynamic options
    const prompt = `
You are a content creator strategist.
The user wants to start a channel or create content about the general category "${category}" targeting the audience in "${country}".
Suggest exactly 8 highly relevant, modern, specific, and distinct sub-categories.

CRITICAL INSTRUCTIONS:
1. Keep each sub-category name extremely short, punchy, and concise (exactly 2 to 4 words).
2. DO NOT write full sentences, descriptions, or long phrases. It must look like a simple button label.
3. Example of good output: "AI Video Editors", "B2B Copywriting", "Retro Keyboard Mods".

Return your response strictly as a JSON array of strings:
[
  "Short Subcategory 1",
  "Short Subcategory 2",
  ...
]
`;

    try {
      const res = await GeminiProvider.generateJSON<string[]>(prompt, undefined, "gemini-2.5-flash-lite");
      if (res && Array.isArray(res.data)) {
        return { success: true as const, data: res.data };
      }
    } catch (apiErr) {
      console.error("Gemini failed to generate subcategories:", apiErr);
    }

    // Fallback if API fails
    const fallback = [
      `${category} Tutorials`,
      `${category} Tips & Tricks`,
      `${category} for Beginners`,
      `Advanced ${category}`,
      `Daily ${category} Vlogs`,
      `${category} News & Updates`,
      `${category} Side Hustles`,
      `${category} Review & Guide`
    ];
    return { success: true as const, data: fallback };
  } catch (error) {
    return errorResponse(error);
  }
}

export async function getSubSubCategories(category: string, subCategory: string, country: string) {
  try {
    await getAuthenticatedUserId(); // Shield with authentication

    const predefKey = findPredefinedCategory(category);
    if (predefKey) {
      const subSubList = findPredefinedSubSub(predefKey, subCategory);
      if (subSubList) {
        return { success: true as const, data: subSubList };
      }
    }

    // Custom Category or Subcategory -> Generate specific topics via Gemini
    const prompt = `
You are a content creator strategist.
The user's general category is "${category}" and they selected the sub-category "${subCategory}" targeting the audience in "${country}".
Suggest exactly 6 highly specific, actionable niches or content topics within this sub-category.

CRITICAL INSTRUCTIONS:
1. Keep each topic suggestion extremely short, punchy, and concise (exactly 3 to 5 words).
2. DO NOT write full sentences, explanations, or long details. It must look like a simple button label.
3. Example of good output: "2D Railway Horror Animations", "B2B SaaS Hook Writing", "Mechanical Switch Sound Tests".

Return your response strictly as a JSON array of strings:
[
  "Short Topic 1",
  "Short Topic 2",
  ...
]
`;

    try {
      const res = await GeminiProvider.generateJSON<string[]>(prompt, undefined, "gemini-2.5-flash-lite");
      if (res && Array.isArray(res.data)) {
        return { success: true as const, data: res.data };
      }
    } catch (apiErr) {
      console.error("Gemini failed to generate sub-sub-categories:", apiErr);
    }

    // Fallback if API fails
    const fallback = [
      `Specific ${subCategory} concepts`,
      `Niche ${subCategory} examples`,
      `Modern ${subCategory} strategies`,
      `${subCategory} for professionals`,
      `Creative ${subCategory} setups`,
      `Low competition ${subCategory} ideas`
    ];
    return { success: true as const, data: fallback };
  } catch (error) {
    return errorResponse(error);
  }
}
