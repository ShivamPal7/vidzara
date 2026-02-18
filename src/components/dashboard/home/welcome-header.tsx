import { getSession } from "@/lib/auth-client";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

interface WelcomeHeaderProps {
  user: {
    name: string;
    image?: string | null;
  };
}

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  const date = new Date();
  const hours = date.getHours();
  let greeting = "Good evening";

  if (hours < 12) {
    greeting = "Good morning";
  } else if (hours < 18) {
    greeting = "Good afternoon";
  }

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {greeting}, {user.name}
      </h1>
      <p className="text-muted-foreground text-sm sm:text-base">
        Ready to create something amazing today?
      </p>
    </div>
  );
}
