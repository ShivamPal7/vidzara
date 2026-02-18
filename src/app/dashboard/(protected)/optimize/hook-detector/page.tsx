import { ComingSoon } from "@/components/dashboard/coming-soon";
import { IconFishHook } from "@tabler/icons-react";

export default function HookDetectorPage() {
  return (
    <ComingSoon 
      title="Hook Failure Detector" 
      description="Analyze your video hooks to ensure maximum viewer retention."
      icon={IconFishHook}
    />
  );
}
