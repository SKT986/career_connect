import { ComingSoon } from "@/components/shared/coming-soon";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <ComingSoon
      icon={LayoutDashboard}
      title="Your Dashboard"
      description="Saved posts, interview score history, resume versions, mentor conversations, job recommendations, and profile completion will all live here soon."
    />
  );
}
