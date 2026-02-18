import { ComingSoon } from "@/components/dashboard/coming-soon";
import { IconSettings } from "@tabler/icons-react";

export default function SettingsPage() {
  return (
    <ComingSoon 
      title="Settings" 
      description="Manage your profile, account preferences, and application settings."
      icon={IconSettings}
    />
  );
}
