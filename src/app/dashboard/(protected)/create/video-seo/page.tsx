import { ComingSoon } from "@/components/dashboard/coming-soon";
import { IconSearch } from "@tabler/icons-react";

export default function VideoSeoPage() {
  return (
    <ComingSoon 
      title="Video SEO Generator" 
      description="Optimize your video titles, descriptions, tags, and keywords for maximum reach."
      icon={IconSearch}
    />
  );
}
