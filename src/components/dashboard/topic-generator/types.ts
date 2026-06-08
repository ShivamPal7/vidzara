export interface ViralIdea {
  title: string;
  topic: string;
  reason: string;
}

export interface TopicGeneratorOutput {
  topContentAnalysis: string;
  improvements: string[];
  viralIdeas: ViralIdea[];
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

export interface TopicGeneratorInput {
  channelName?: string;
  channelNames?: string;
  recentVideos?: YouTubeVideo[];
  outliers?: YouTubeVideo[];
  prompt?: string;
}

export interface TopicGeneration {
  id: string;
  userId: string;
  feature: string;
  input: any; // Ideally TopicGeneratorInput
  output: any; // Ideally TopicGeneratorOutput
  model: string | null;
  tokensUsed: number | null;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Competitor {
  id: string;
  userId: string;
  channelId: string;
  channelName: string;
  channelHandle: string | null;
  thumbnailUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
