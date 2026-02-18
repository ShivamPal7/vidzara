import { ComingSoon } from "@/components/dashboard/coming-soon";
import { IconUsers } from "@tabler/icons-react";

export default function AffiliatePage() {
  return (
    <ComingSoon 
      title="Affiliate Dashboard" 
      description="Track your referrals, earnings, and payouts as a Vidzara affiliate."
      icon={IconUsers}
    />
  );
}
