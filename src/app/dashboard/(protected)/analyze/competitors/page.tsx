import { ComingSoon } from "@/components/dashboard/coming-soon";
import { IconChartDots } from "@tabler/icons-react";

export default function CompetitorsPage() {
  return (
    <ComingSoon 
      title="Competitors" 
      description="Find competitors that perform significantly better than average to replicate their success."
      icon={IconChartDots}
    />
  );
}
