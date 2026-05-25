"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function getAuthenticatedUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

export async function getChatSessions() {
  try {
    const userId = await getAuthenticatedUserId();
    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    return { success: true as const, data: sessions };
  } catch (error: any) {
    console.error("[ChatAction] getChatSessions failed:", error);
    return { success: false as const, error: error.message || "Failed to load chat history." };
  }
}

export async function createChatSession(initialTitle: string = "New Coaching Session") {
  try {
    const userId = await getAuthenticatedUserId();
    const session = await prisma.chatSession.create({
      data: {
        userId,
        title: initialTitle,
      },
    });
    revalidatePath("/dashboard/new");
    return { success: true as const, data: session };
  } catch (error: any) {
    console.error("[ChatAction] createChatSession failed:", error);
    return { success: false as const, error: error.message || "Failed to create coaching session." };
  }
}

export async function deleteChatSession(sessionId: string) {
  try {
    const userId = await getAuthenticatedUserId();

    // Verify ownership first
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return { success: false as const, error: "Coaching session not found." };
    }

    await prisma.chatSession.delete({
      where: { id: sessionId },
    });

    revalidatePath("/dashboard/new");
    return { success: true as const };
  } catch (error: any) {
    console.error("[ChatAction] deleteChatSession failed:", error);
    return { success: false as const, error: error.message || "Failed to delete coaching session." };
  }
}

export async function updateChatSessionTitle(sessionId: string, title: string) {
  try {
    const userId = await getAuthenticatedUserId();

    // Verify ownership
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return { success: false as const, error: "Coaching session not found." };
    }

    const updated = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { title },
    });

    revalidatePath("/dashboard/new");
    return { success: true as const, data: updated };
  } catch (error: any) {
    console.error("[ChatAction] updateChatSessionTitle failed:", error);
    return { success: false as const, error: error.message || "Failed to rename coaching session." };
  }
}

export async function getChatMessages(sessionId: string) {
  try {
    const userId = await getAuthenticatedUserId();

    // Verify ownership
    const session = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      return { success: false as const, error: "Coaching session not found." };
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });

    return { success: true as const, data: messages };
  } catch (error: any) {
    console.error("[ChatAction] getChatMessages failed:", error);
    return { success: false as const, error: error.message || "Failed to retrieve messages." };
  }
}
