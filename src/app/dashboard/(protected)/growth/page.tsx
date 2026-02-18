import { ComingSoon } from "@/components/dashboard/coming-soon";
import { IconTrendingUp } from "@tabler/icons-react";

export default function GrowthPage() {
  return (
    <ComingSoon 
      title="Creator Growth Dashboard" 
      description="Visualize your channel growth, identify trends, and get data-driven recommendations."
      icon={IconTrendingUp}
    />
  );
}
