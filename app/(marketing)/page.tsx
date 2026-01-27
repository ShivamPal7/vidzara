import { LoginForm } from "@/components/login-form";
import { Hero } from "@/components/marketing/hero";
import { Workflows } from "@/components/marketing/workflows";
import { Features } from "@/components/marketing/features";

export default function Home() {
  return (
    <div>
      <Hero />
      <Workflows />
      <Features />
    </div>
  );
}
