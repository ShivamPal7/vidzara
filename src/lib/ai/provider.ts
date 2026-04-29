import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "./types";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export const GeminiProvider: AIProvider = {
  async generateText(prompt: string, modelId: string = "gemini-flash-latest") {
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        text,
        tokens: undefined // Gemini doesn't always return token count in standard response easily without extra calls
      };
    } catch (error) {
      console.error("Gemini Generation Error:", error);
      throw error;
    }
  },

  async generateJSON<T>(prompt: string, schema?: any, modelId: string = "gemini-flash-latest") {
    try {
      const model = genAI.getGenerativeModel({ 
        model: modelId,
        generationConfig: { responseMimeType: "application/json" }
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const data = JSON.parse(text) as T;
        return { data };
      } catch (e) {
        console.error("Failed to parse JSON response:", text);
        throw new Error("Invalid JSON response from AI");
      }
    } catch (error) {
      console.error("Gemini JSON Generation Error:", error);
      throw error;
    }
  }
};
