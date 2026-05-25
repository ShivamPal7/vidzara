"use server";

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getSubscriptions() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }
  
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
    }
  });
  
  return subscriptions;
}
