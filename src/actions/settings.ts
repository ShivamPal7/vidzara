"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "next/navigation";

const profileSchema = z.object({
  displayName: z.string().min(2).max(50),
  niche: z.string().min(1, "Please select an area of interest"),
  avatar: z.string().optional(),
  youtubeChannelId: z.string().optional(),
});

export type ProfileData = z.infer<typeof profileSchema>;

export async function updateProfile(data: ProfileData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  const validData = profileSchema.parse(data);

  await prisma.userProfile.update({
    where: { userId: session.user.id },
    data: {
      displayName: validData.displayName,
      niche: validData.niche,
      avatar: validData.avatar,
      youtubeChannelId: validData.youtubeChannelId,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard"); // Update sidebar/header if name is there
  return { success: true };
}

export async function deleteAccount() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Delete user - cascading delete should handle related records
  // (Session, Account, UserProfile, Subscription, etc.)
  await prisma.user.delete({
    where: { id: session.user.id },
  });

  // Redirect to home/login
  redirect("/");
}
