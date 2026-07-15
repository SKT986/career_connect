"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { promoteToMentorAction } from "@/services/adminActions";
import type { PromotableStudent } from "@/types/domain";

export function PromoteStudentList({ students }: { students: PromotableStudent[] }) {
  const [isPending, startTransition] = useTransition();

  function handlePromote(profileId: string, displayName: string) {
    startTransition(async () => {
      const result = await promoteToMentorAction(profileId);
      if (result.error) toast.error(result.error);
      else toast.success(`${displayName} can now set up a mentor profile at /mentors.`);
    });
  }

  if (students.length === 0) {
    return <p className="text-sm text-muted-foreground">No students matched that search.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {students.map((student) => (
        <li key={student.profileId}>
          <Card className="rounded-2xl">
            <CardContent className="flex items-center gap-3 p-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  {student.displayName.slice(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{student.displayName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {student.universityEmail ?? "No email on file"}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                className="gap-1.5 rounded-full"
                disabled={isPending}
                onClick={() => handlePromote(student.profileId, student.displayName)}
              >
                <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                Promote to mentor
              </Button>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
