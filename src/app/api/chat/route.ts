import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { streamText } from "ai";
import { openrouterClient } from "@/lib/ai/client";
import { prisma } from "@/lib/prisma";
import { YOUTUBE_COACH_SYSTEM } from "@/lib/ai/system-prompts";
import { getConnectedChannel } from "@/actions/growth-analytics";

const HISTORY_WINDOW = 10; // number of recent messages to include in context

export async function POST(req: Request) {
  try {
    // 1. Authenticate
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Parse request
    const { sessionId, prompt, isDeepThinking, attachments } = await req.json();
    if (!sessionId || !prompt?.trim()) {
      return NextResponse.json({ error: "Missing sessionId or prompt" }, { status: 400 });
    }

    // 3. Verify session ownership
    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });
    if (!chatSession) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    }

    // 4. Save the user's message to DB first
    let dbContent = prompt;
    if (attachments && attachments.length > 0) {
      const names = attachments.map((att: any) => `📎 ${att.name}`).join(", ");
      dbContent += `\n\n(Attached: ${names})`;
    }

    await prisma.chatMessage.create({
      data: { sessionId, role: "user", content: dbContent },
    });

    // 5. Fetch channel context
    const channelResult = await getConnectedChannel();
    let channelContext = "";
    if (channelResult.success && channelResult.data) {
      const ch = channelResult.data;
      channelContext = `
[CONNECTED YOUTUBE CHANNEL]:
- Name: ${ch.channelTitle}
- Handle: ${ch.channelHandle || "N/A"}
- Subscribers: ${Number(ch.subscriberCount).toLocaleString()}
- Channel ID: ${ch.channelId}
Use this data to make your coaching specific and personal.
`;
    } else {
      channelContext = `[CONNECTED YOUTUBE CHANNEL]: None connected yet. You can suggest the creator connects their channel in the Growth Dashboard for personalized analytics.`;
    }

    // 6. Build conversation history context
    //    We fetch all messages BEFORE the current one and inject them as text
    //    in the system prompt. This avoids all Vercel AI SDK message format
    //    validation issues (Zod errors) that arise when passing history via messages[].
    const allMessages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    // Exclude the current user message (last saved) from history display
    const historyMessages = allMessages.slice(0, -1);
    const recentHistory = historyMessages.slice(-HISTORY_WINDOW);

    let historyContext = "";
    if (chatSession.summary) {
      historyContext += `\n\n[EARLIER CONVERSATION SUMMARY]:\n${chatSession.summary}`;
    }
    if (recentHistory.length > 0) {
      const lines = recentHistory.map((m) => {
        const speaker = m.role === "user" ? "Creator" : "You (Coach)";
        const content = m.content.length > 800 ? m.content.slice(0, 800) + "…" : m.content;
        return `${speaker}: ${content}`;
      });
      historyContext += `\n\n[RECENT CONVERSATION]:\n${lines.join("\n\n")}`;
    }

    // Async summarization: if we have many old messages and no summary yet, generate one
    const oldMessages = historyMessages.slice(0, -HISTORY_WINDOW);
    if (oldMessages.length >= 4 && !chatSession.summary) {
      // Fire and forget — doesn't block the response
      summarizeOldMessages(sessionId, oldMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }))).catch(console.error);
    }

    // 7. Build final system prompt
    let systemPrompt = YOUTUBE_COACH_SYSTEM + "\n\n" + channelContext;

    if (historyContext) {
      systemPrompt += historyContext + "\n\n---";
    }

    if (isDeepThinking) {
      systemPrompt += `
[DEEP THINKING MODE]:
Begin your response with thorough reasoning inside <reasoning>...</reasoning> tags (100–500 words).
Structure your reasoning: what the creator's core problem is, what frameworks apply, what your recommendation will be.
After </reasoning>, write your actual response directly to the creator.`;
    }

    const modelId = isDeepThinking
      ? "google/gemini-2.5-pro"
      : "google/gemini-2.5-flash";

    // 7.5. Process attachments for the LLM (Forward images as image parts, decode text files)
    const contentParts: any[] = [];
    let promptWithAttachments = prompt;

    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        const isImage = att.type.startsWith("image/");
        const isTextFile = att.type.startsWith("text/") || 
                           att.name.endsWith(".txt") || 
                           att.name.endsWith(".md") || 
                           att.name.endsWith(".json") || 
                           att.name.endsWith(".csv") ||
                           att.type === "application/json" ||
                           att.type === "text/csv";

        if (isImage) {
          try {
            const base64Data = att.dataUrl.split(",")[1];
            contentParts.push({
              type: "image",
              image: base64Data,
              mimeType: att.type,
            });
          } catch (err) {
            console.error(`[ChatAPI] Failed to parse image attachment ${att.name}:`, err);
          }
        } else if (isTextFile) {
          try {
            const base64Data = att.dataUrl.split(",")[1];
            const textContent = Buffer.from(base64Data, "base64").toString("utf-8");
            promptWithAttachments += `\n\n--- ATTACHED FILE: ${att.name} ---\n${textContent}\n--- END OF ATTACHED FILE ---`;
          } catch (err) {
            console.error(`[ChatAPI] Failed to decode text file ${att.name}:`, err);
          }
        } else {
          promptWithAttachments += `\n\n[Attached File: ${att.name} (${att.type})]`;
        }
      }
    }

    contentParts.unshift({ type: "text", text: promptWithAttachments });
    const userMessageContent = contentParts.length === 1 ? promptWithAttachments : contentParts;

    // 8. Stream the response
    //    Pass ONLY the current user message — history is in the system prompt.
    //    This is the only safe way to avoid Vercel AI SDK Zod validation errors
    //    caused by complex message content types from prior model responses.
    const stream = await streamText({
      model: openrouterClient(modelId),
      system: systemPrompt,
      messages: [{ role: "user", content: userMessageContent as any }],
      temperature: isDeepThinking ? 0.6 : 0.75,
      maxOutputTokens: 4000,
      async onFinish({ text }) {
        try {
          let content = text;
          let deepThinkingLog: string | null = null;

          if (isDeepThinking) {
            const match = text.match(/<reasoning>([\s\S]*?)<\/reasoning>/);
            if (match) {
              deepThinkingLog = match[1].trim();
              content = text.replace(/<reasoning>[\s\S]*?<\/reasoning>/g, "").trim();
            }
          }

          await prisma.chatMessage.create({
            data: { sessionId, role: "assistant", content, isDeepThinking, deepThinkingLog },
          });

          await prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() },
          });
        } catch (err) {
          console.error("[ChatAPI] Failed to persist assistant message:", err);
        }
      },
    });

    return stream.toTextStreamResponse();
  } catch (error: any) {
    console.error("[ChatAPI] Server error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/** Summarize old messages and persist to DB — called async, never blocks the response */
async function summarizeOldMessages(
  sessionId: string,
  messages: Array<{ role: "user" | "assistant"; content: string }>
) {
  const { generateText } = await import("ai");
  const { openrouterClient: client } = await import("@/lib/ai/client");

  const formatted = messages
    .map((m) => `${m.role === "user" ? "Creator" : "Coach"}: ${m.content.slice(0, 600)}`)
    .join("\n\n");

  const { text } = await generateText({
    model: client("google/gemini-2.5-flash"),
    prompt: `Summarize this YouTube coaching conversation in under 200 words. Focus on: the creator's goals/challenges, key advice given, decisions made. Be factual and concise.\n\n${formatted}`,
    temperature: 0.3,
  });

  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { summary: text.trim() },
  });
}
