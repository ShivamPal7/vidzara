"use server";

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAffiliates() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }
  
  const affiliates = await prisma.affiliate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      referrals: true,
    }
  });
  
  return affiliates;
}

export async function updateAffiliateStatus(id: string, enabled: boolean) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!isAdmin(session?.user?.email)) {
    throw new Error("Unauthorized");
  }

  await prisma.affiliate.update({
    where: { id },
    data: { enabled },
  });

  revalidatePath("/admin/affiliates");
  return { success: true };
}
