export interface Video {
  id: string;
  title: string;
  createdAt: string;
  isFavorite: boolean;
}

export interface VideoSeoSearchBarProps {
  className?: string;
  onGenerated?: (generationId: string) => void;
}

export interface VideoListProps {
  videos: Video[];
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export interface VideoRowProps {
  video: Video;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
}

// ── Details page types ─────────────────────────────────────────────────
export interface VideoSeoTag {
  keyword: string;
  score: number;
}

export interface SuggestedKeyword {
  keyword: string;
  score: number;
}

export interface VideoSeoDetails {
  id: string;
  prompt: string;
  title: string;
  titles: string[];
  description: string;
  tags: VideoSeoTag[];
  suggestedKeywords: SuggestedKeyword[];
  hashtags: string[];
  createdAt: string;
  isFavorite: boolean;
}
