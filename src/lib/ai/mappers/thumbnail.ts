export interface ThumbnailMappedOutput {
  id: string;
  prompt: string;
  title: string;
  concepts: {
    id: string;
    textIdea: string;
    textIdeas?: string[];
    emotion: string;
    layout: string;
    colors: string[];
    imagePrompt?: string;
    thumbnailPrompt?: {
      textPlacement: string;
      subject: string;
      facialExpression: string;
      background: string;
      composition: string;
      lighting: string;
      colorsDescription: string;
      midjourneyPrompt: string;
    };
  }[];
  createdAt: string;
  isFavorite: boolean;
}

export function mapGenerationToThumbnailDetails(generation: any): ThumbnailMappedOutput {
  const input = generation.input as any;
  const output = (generation.output ?? {}) as any;
  const concepts = Array.isArray(output.concepts) ? output.concepts : [];

  const mappedConcepts = concepts.map((c: any, i: number) => {
    const defaultText = c.textIdea || c.textOverlay || c.title || "Untitled";
    const textIdeas = Array.isArray(c.textIdeas) ? c.textIdeas : [defaultText];

    let thumbnailPrompt = undefined;
    if (c.thumbnailPrompt) {
      thumbnailPrompt = {
        textPlacement: c.thumbnailPrompt.textPlacement || "",
        subject: c.thumbnailPrompt.subject || "",
        facialExpression: c.thumbnailPrompt.facialExpression || c.emotion || "",
        background: c.thumbnailPrompt.background || "",
        composition: c.thumbnailPrompt.composition || c.layout || "",
        lighting: c.thumbnailPrompt.lighting || "",
        colorsDescription: c.thumbnailPrompt.colorsDescription || "",
        midjourneyPrompt: c.thumbnailPrompt.midjourneyPrompt || c.imagePrompt || "",
      };
    }

    return {
      id: c.id || `${generation.id}-c${i}`,
      textIdea: defaultText,
      textIdeas,
      emotion: c.emotion || c.visualDescription || "Neutral",
      layout: c.layout || c.colorPsychology || "Standard layout",
      colors: Array.isArray(c.colors) ? c.colors : [],
      imagePrompt: c.imagePrompt || undefined,
      thumbnailPrompt
    };
  });

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
