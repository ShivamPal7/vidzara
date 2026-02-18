import { ComingSoon } from "@/components/dashboard/coming-soon";
import { IconChartDots } from "@tabler/icons-react";

export default function OutlierDetectorPage() {
  return (
    <ComingSoon 
      title="Outlier Detector" 
      description="Find videos that perform significantly better than average to replicate their success."
      icon={IconChartDots}
    />
  );
}
