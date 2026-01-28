import { LoginForm } from "@/components/login-form";
import { Hero } from "@/components/marketing/hero";
import { Workflows } from "@/components/marketing/workflows";
import { Features } from "@/components/marketing/features";
import { Pricing } from "@/components/marketing/pricing";
import { Testimonials } from "@/components/marketing/testimonials";
import { FAQ } from "@/components/marketing/faq";

export default function Home() {
  return (
    <div>
      <Hero />
      <Workflows />
      <Features />
      <Testimonials />
      <Pricing />
      <FAQ />
    </div>
  );
}
