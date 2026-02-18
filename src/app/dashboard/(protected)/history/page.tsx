import { ComingSoon } from "@/components/dashboard/coming-soon";
import { IconHistory } from "@tabler/icons-react";

export default function HistoryPage() {
  return (
    <ComingSoon 
      title="Generation History" 
      description="View, copy, and manage all your past AI generations in one place."
      icon={IconHistory}
    />
  );
}
