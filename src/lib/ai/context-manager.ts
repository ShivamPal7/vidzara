import { generateText } from "ai";
import { openrouterClient } from "./client";
import { prisma } from "../prisma";

export interface ChatMessageInput {
  role: "user" | "assistant" | "system";
  content: string;
}

export class ContextManager {
  /**
   * Processes history: keeps the last N messages, summarizes the rest,
   * updates the session summary in the database, and constructs the final prompt context.
   */
  static async optimizeContext(
    sessionId: string,
    messages: ChatMessageInput[],
    limit: number = 6
  ): Promise<{
    optimizedMessages: ChatMessageInput[];
    currentSummary: string | null;
  }> {
    try {
      if (messages.length <= limit) {
        return { optimizedMessages: messages, currentSummary: null };
      }

      // Identify the older messages to summarize
      const messagesToSummarize = messages.slice(0, messages.length - limit);
      const activeMessages = messages.slice(messages.length - limit);

      // Generate summary for older messages
      const summaryText = await this.summarizeHistory(messagesToSummarize);

      // Save summary in database
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { summary: summaryText },
      });

      return {
        optimizedMessages: activeMessages,
        currentSummary: summaryText,
      };
    } catch (error) {
      console.error("[ContextManager] Context optimization failed:", error);
      // Fallback: return rolling window without saving summary
      return {
        optimizedMessages: messages.slice(messages.length - limit),
        currentSummary: null,
      };
    }
  }

  /**
   * Generates a concise coaching summary of the conversation history.
   */
  private static async summarizeHistory(messages: ChatMessageInput[]): Promise<string> {
    const formattedHistory = messages
      .map((m) => `${m.role.toUpperCase()}: ${this.prunePayload(m.content)}`)
      .join("\n\n");

    const summaryPrompt = `
You are a context compression engine for an AI YouTube Coach chat session.
Summarize the following past conversation history between a User (YouTube Creator) and their Assistant (YouTube Coach).

Focus specifically on:
1. The user's channel details, goals, niche, or struggles discussed.
2. The key strategic advice, insights, or action items provided by the Coach.
3. Decisions or pivots agreed upon.

Keep the summary highly concise, organized, and dense with facts. Do NOT include greetings, pleasantries, or verbose formatting. Keep it to under 300 words.

PAST CONVERSATION HISTORY:
${formattedHistory}

CONCISE FACTUAL SUMMARY:
`;

    try {
      // Use the fast Gemini 2.5 Flash model through OpenRouter
      const { text } = await generateText({
        model: openrouterClient("google/gemini-2.5-flash"),
        prompt: summaryPrompt,
        temperature: 0.3,
      });
      return text.trim();
    } catch (error) {
      console.error("[ContextManager] Summary generation failed:", error);
      return "Factual summary unavailable due to processing issue.";
    }
  }

  /**
   * Prunes massive content blocks (like scripts or long SEO descriptions) in older messages
   * to avoid bloating the summarizer's context.
   */
  private static prunePayload(content: string): string {
    if (content.length <= 1000) return content;
    return content.slice(0, 1000) + "... [Truncated for space]";
  }
}
