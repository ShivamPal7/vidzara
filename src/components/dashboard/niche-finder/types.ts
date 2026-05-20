export interface NicheResult {
  name: string;
  competitionLevel: "Low" | "Medium" | "High";
  monetizationPotential: string;
  contentStrategy: string;
  viralScore: number;
  revenueScore: number;
  competitionScore: number;
}

export interface NicheFinderOutput {
  niches: NicheResult[];
}

export interface NicheFinderInput {
  interest: string;
  skillLevel: "Beginner" | "Intermediate" | "Advanced";
  contentType: string;
}

export interface NicheGeneration {
  id: string;
  userId?: string;
  feature?: string;
  input: any; // NicheFinderInput
  output: any; // NicheFinderOutput
  model?: string | null;
  tokensUsed?: number | null;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
