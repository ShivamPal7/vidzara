"use server";

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

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

  return { success: true };
}
