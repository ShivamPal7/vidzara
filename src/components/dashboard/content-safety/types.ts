export interface SafetyHighlight {
  text: string;
  reason: string;
  type: "clickbait" | "policy" | "algorithm";
}

export interface SafetySuggestion {
  original: string;
  rewrite: string;
  reason: string;
}

export interface ContentSafetyResult {
  score: number; // 0 to 100, 100 being perfect safety
  summary: string;
  highlights: SafetyHighlight[];
  suggestions: SafetySuggestion[];
}
