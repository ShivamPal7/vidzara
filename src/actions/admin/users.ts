"use server";

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }
  
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      subscription: true,
      userProfile: true,
      affiliate: true,
      creditLogs: {
        orderBy: { createdAt: "desc" },
      },
    }
  });
  
  return users;
}

export async function deleteUser(id: string) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }

  await prisma.user.delete({
    where: { id },
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function adjustUserCredits(
  userId: string,
  amount: number, // positive to add, negative to remove
  reason: string
) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user || !isAdmin(session.user.email)) {
    throw new Error("Unauthorized");
  }

  if (amount === 0) {
    throw new Error("Adjustment amount cannot be zero.");
  }

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    const newCredits = user.credits + amount;
    if (newCredits < 0) {
      throw new Error(`Cannot deduct ${Math.abs(amount)} credits. User only has ${user.credits} credits.`);
    }

    // Update user credits
    await tx.user.update({
      where: { id: userId },
      data: {
        credits: newCredits,
      },
    });

    // Create CreditLog
    await tx.creditLog.create({
      data: {
        userId,
        amount,
        reason,
        adminId: session.user.id,
      },
    });
  });

  revalidatePath("/admin/users");
  return { success: true };
}
