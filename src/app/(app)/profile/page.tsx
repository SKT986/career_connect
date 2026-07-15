import { ComingSoon } from "@/components/shared/coming-soon";
import { User } from "lucide-react";

export default function ProfilePage() {
  return (
    <ComingSoon
      icon={User}
      title="Profile"
      description="A full profile editor — avatar, bio, skills, accommodations, and privacy controls — is coming soon."
    />
  );
}
