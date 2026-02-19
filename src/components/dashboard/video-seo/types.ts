export interface Video {
  id: string;
  title: string;
  createdAt: string;
  isFavorite: boolean;
}

export interface VideoSeoSearchBarProps {
  className?: string;
}

export interface VideoListProps {
  videos: Video[];
  className?: string;
}

export interface VideoRowProps {
  video: Video;
  onToggleFavorite?: (id: string) => void;
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
  description: string;
  tags: VideoSeoTag[];
  suggestedKeywords: SuggestedKeyword[];
  hashtags: string[];
}
