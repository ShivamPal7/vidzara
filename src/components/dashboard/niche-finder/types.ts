export interface NicheResult {
  name: string;
  competitionLevel: "Low" | "Medium" | "High";
  monetizationPotential: string;
  contentStrategy: string;
  viralScore: number;
  revenueScore: number;
  competitionScore: number;
  audienceMetrics?: {
    audienceSize: string;
    searchDemand: string;
    growthTrend: string;
    viralPotential: string;
    competitionLevel: string;
  };
  monetizationScores?: {
    adsense: number;
    affiliate: number;
    sponsorship: number;
    digitalProduct: number;
    courseSelling: number;
  };
}

export interface MarketTrends {
  growingNiches2026: string[];
  newTrends: string[];
  saturatedNiches: string[];
  opportunityZone: string[];
}

export interface FinalRecommendation {
  bestNiche: string;
  whyRightForYou: string;
  competition: string;
  growthPotential: string;
  monetizationPotential: string;
}

export interface NicheFinderOutput {
  niches: NicheResult[];
  marketTrends?: MarketTrends;
  finalRecommendation?: FinalRecommendation;
}

export interface NicheFinderInput {
  interest?: string; // Legacy support
  country: string;
  category: string;
  subCategory?: string;
  subSubCategory?: string;
  customInterest?: string;
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
