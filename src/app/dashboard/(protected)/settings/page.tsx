import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const [userProfile, accounts] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.account.findMany({
      where: { userId: session.user.id },
      select: { providerId: true },
    }),
  ]);

  const hasGoogle = accounts.some((a) => a.providerId === "google");

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        <SettingsForm
          user={session.user}
          profile={userProfile}
          hasGoogle={hasGoogle}
        />
      </div>
    </div>
  );
}
