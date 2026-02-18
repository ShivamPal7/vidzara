import { ComingSoon } from "@/components/dashboard/coming-soon";
import { IconShieldCheck } from "@tabler/icons-react";

export default function ContentSafetyPage() {
  return (
    <ComingSoon 
      title="Content Safety Checker" 
      description="Ensure your content is safe, ad-friendly, and complies with platform guidelines."
      icon={IconShieldCheck}
    />
  );
}
