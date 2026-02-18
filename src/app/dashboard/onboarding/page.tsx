import { OnboardingWizard } from "@/components/dashboard/onboarding-wizard";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Onboarding - Vidzara",
};

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Check if already completed
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (userProfile?.onboardingComplete) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="w-full max-w-lg mb-8 text-center space-y-2">
        <h1 className="text-4xl font-extrabold lg:text-5xl text-primary">
          Welcome to Vidzara
        </h1>
        <p className="text-lg text-muted-foreground">
          Your AI-powered content journey starts here.
        </p>
      </div>
      <OnboardingWizard initialName={session.user.name || ""} />
    </div>
  );
}
