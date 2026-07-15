import { ComingSoon } from "@/components/shared/coming-soon";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Settings"
      description="Account, privacy, and notification preferences are coming to this page next. For accessibility options, visit the Accessibility page in the meantime."
    />
  );
}
