/**
 * Video SEO Output Mapper
 * 
 * Transforms raw AI JSON output + Generation record → frontend VideoSeoDetails type.
 * Handles fallbacks for malformed AI responses.
 */

export interface VideoSeoMappedOutput {
  id: string;
  prompt: string;
  title: string;
  titles: string[];
  description: string;
  tags: { keyword: string; score: number }[];
  suggestedKeywords: { keyword: string; score: number }[];
  hashtags: string[];
  createdAt: string;
  isFavorite: boolean;
}

interface RawAIOutput {
  titles?: string[];
  description?: string;
  tags?: ({ keyword: string; score: number } | string)[];
  hashtags?: string[];
  keywords?: ({ keyword: string; score: number } | string)[];
}

/**
 * Normalize a tag/keyword entry — handles both string and { keyword, score } formats
 * for backward compatibility with older generations.
 */
function normalizeTagEntry(
  entry: { keyword: string; score: number } | string,
  index: number
): { keyword: string; score: number } {
  if (typeof entry === "string") {
    // Assign a synthetic score — higher for earlier items (assumed more relevant)
    return { keyword: entry, score: Math.max(50, 90 - index * 3) };
  }
  return {
    keyword: entry.keyword || "",
    score: typeof entry.score === "number" ? entry.score : 70,
  };
}

/**
 * Map a Generation record (from Prisma) to the frontend VideoSeoDetails shape.
 */
export function mapGenerationToVideoSeoDetails(generation: {
  id: string;
  input: any;
  output: any;
  createdAt: Date;
  isFavorite: boolean;
}): VideoSeoMappedOutput {
  const input = generation.input as { content?: string; mode?: string } | null;
  const output = (generation.output ?? {}) as RawAIOutput;

  const titles = Array.isArray(output.titles) ? output.titles : [];
  const tags = Array.isArray(output.tags)
    ? output.tags.map((t, i) => normalizeTagEntry(t, i))
    : [];
  const keywords = Array.isArray(output.keywords)
    ? output.keywords.map((k, i) => normalizeTagEntry(k, i))
    : [];

  return {
    id: generation.id,
    prompt: input?.content || "",
    title: titles[0] || "Untitled",
    titles,
    description: output.description || "",
    tags,
    suggestedKeywords: keywords,
    hashtags: Array.isArray(output.hashtags) ? output.hashtags : [],
    createdAt: generation.createdAt.toISOString(),
    isFavorite: generation.isFavorite,
  };
}

/**
 * Map a Generation record to a list item shape for the video list page.
 */
export function mapGenerationToVideoListItem(generation: {
  id: string;
  output: any;
  createdAt: Date;
  isFavorite: boolean;
}): { id: string; title: string; createdAt: string; isFavorite: boolean } {
  const output = (generation.output ?? {}) as RawAIOutput;
  const titles = Array.isArray(output.titles) ? output.titles : [];

  return {
    id: generation.id,
    title: titles[0] || "Untitled Generation",
    createdAt: generation.createdAt.toISOString(),
    isFavorite: generation.isFavorite,
  };
}
