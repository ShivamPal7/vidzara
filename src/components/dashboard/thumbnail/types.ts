export interface Thumbnail {
  id: string;
  title: string;
  createdAt: string;
  isFavorite: boolean;
}

export interface ThumbnailSearchBarProps {
  className?: string;
  onGenerated?: (generationId: string) => void;
}

export interface ThumbnailListProps {
  thumbnails: Thumbnail[];
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export interface ThumbnailRowProps {
  thumbnail: Thumbnail;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

// ── Details page types ─────────────────────────────────────────────────
export interface ThumbnailConceptDetail {
  id: string;
  textIdea: string;
  emotion: string;
  layout: string;
  colors: string[];
  imagePrompt?: string;
}

export interface ThumbnailDetails {
  id: string;
  prompt: string;
  title: string;
  concepts: ThumbnailConceptDetail[];
  createdAt: string;
  isFavorite: boolean;
}

