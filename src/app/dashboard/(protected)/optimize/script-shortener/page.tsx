import { ComingSoon } from "@/components/dashboard/coming-soon";
import { IconScissors } from "@tabler/icons-react";

export default function ScriptShortenerPage() {
  return (
    <ComingSoon 
      title="Script Shortener" 
      description="Turn long scripts into engaging short-form content automatically."
      icon={IconScissors}
    />
  );
}
