import { ComingSoon } from "@/components/dashboard/coming-soon";
import { IconCreditCard } from "@tabler/icons-react";

export default function BillingPage() {
  return (
    <ComingSoon 
      title="Billing & Subscription" 
      description="Manage your subscription, view invoices, and upgrade your plan."
      icon={IconCreditCard}
    />
  );
}
