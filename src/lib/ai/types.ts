import { Feature } from "../../../prisma/generated/prisma/enums";

export interface AIRequest {
  feature: Feature;
  input: any; // Flexible input structure based on feature
  userId: string;
  context?: any; // e.g., platform for script writer
}

export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  tokensUsed?: number;
  model?: string;
}

export interface AIProvider {
  generateText(prompt: string, modelId?: string): Promise<{ text: string; tokens?: number }>;
  generateJSON<T>(prompt: string, schema?: any, modelId?: string): Promise<{ data: T; tokens?: number }>;
}
