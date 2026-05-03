export type HookStatus = "WEAK" | "AVERAGE" | "STRONG";

export interface HookSuggestion {
  rewrite: string;
  reason: string;
}

export interface HookDetectorResult {
  status: HookStatus;
  explanation: string;
  suggestions: HookSuggestion[];
}
