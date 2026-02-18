import { ComingSoon } from "@/components/dashboard/coming-soon";
import { IconBulb } from "@tabler/icons-react";

export default function TopicGeneratorPage() {
  return (
    <ComingSoon 
      title="Topic Generator" 
      description="Discover high-potential video topics based on competitor analysis and trends."
      icon={IconBulb}
    />
  );
}
