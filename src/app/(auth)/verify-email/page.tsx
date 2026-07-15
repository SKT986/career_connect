import { MailCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function VerifyEmailPage() {
  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader className="items-center text-center">
        <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <MailCheck className="h-7 w-7" aria-hidden="true" />
        </span>
        <CardTitle className="text-2xl">Check your inbox</CardTitle>
        <CardDescription>
          We sent a verification link to your university email. Click it to unlock the community feed,
          AI assistant, and everything else.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t get it? Check spam, or try signing in again in a few minutes.
        </p>
      </CardContent>
    </Card>
  );
}
