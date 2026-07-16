import { useTranslations } from "next-intl";
import { MailCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function VerifyEmailPage() {
  const t = useTranslations("auth");
  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader className="items-center text-center">
        <span className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
          <MailCheck className="h-7 w-7" aria-hidden="true" />
        </span>
        <CardTitle className="text-2xl">{t("verifyEmail.checkInbox")}</CardTitle>
        <CardDescription>{t("verifyEmail.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-center text-sm text-muted-foreground">{t("verifyEmail.didntGetIt")}</p>
      </CardContent>
    </Card>
  );
}
