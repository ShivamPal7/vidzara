export interface ThumbnailMappedOutput {
  id: string;
  prompt: string;
  title: string;
  concepts: {
    id: string;
    textIdea: string;
    emotion: string;
    layout: string;
    colors: string[];
  }[];
  createdAt: string;
  isFavorite: boolean;
}

export function mapGenerationToThumbnailDetails(generation: any): ThumbnailMappedOutput {
  const input = generation.input as any;
  const output = (generation.output ?? {}) as any;
  const concepts = Array.isArray(output.concepts) ? output.concepts : [];

  const mappedConcepts = concepts.map((c: any, i: number) => ({
    id: c.id || `${generation.id}-c${i}`,
    textIdea: c.textIdea || c.textOverlay || c.title || "Untitled",
    emotion: c.emotion || c.visualDescription || "Neutral",
    layout: c.layout || c.colorPsychology || "Standard layout",
    colors: Array.isArray(c.colors) ? c.colors : [],
    imagePrompt: c.imagePrompt || undefined
  }));

  return {
    id: generation.id,
    prompt: input?.content || "",
    title: mappedConcepts[0]?.textIdea || "Thumbnail Concept",
    concepts: mappedConcepts,
    createdAt: generation.createdAt.toISOString(),
    isFavorite: generation.isFavorite,
  };
}

export function mapGenerationToThumbnailListItem(generation: any) {
  const output = (generation.output ?? {}) as any;
  const concepts = Array.isArray(output.concepts) ? output.concepts : [];
  
  return {
    id: generation.id,
    title: concepts[0]?.textIdea || concepts[0]?.textOverlay || concepts[0]?.title || "Thumbnail Generation",
    createdAt: generation.createdAt.toISOString(),
    isFavorite: generation.isFavorite,
  };
}
