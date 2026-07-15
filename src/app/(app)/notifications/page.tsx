import { ComingSoon } from "@/components/shared/coming-soon";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <ComingSoon
      icon={Bell}
      title="Notifications"
      description="Real-time alerts for replies, mentor comments, completed interviews, and company invitations will show up here."
    />
  );
}
