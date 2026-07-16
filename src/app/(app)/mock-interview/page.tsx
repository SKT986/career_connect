import { getTranslations } from "next-intl/server";
import { MockInterviewFlow } from "@/components/mock-interview/mock-interview-flow";

export default async function MockInterviewPage() {
  const t = await getTranslations("mockInterview");
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t("pageTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("pageSubtitle")}</p>
      </div>
      <MockInterviewFlow />
    </div>
  );
}
