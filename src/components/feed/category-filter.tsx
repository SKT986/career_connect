"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { POST_CATEGORIES } from "@/lib/nav";

export function CategoryFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") ?? "all";
  const t = useTranslations("feed");
  const tCategories = useTranslations("postCategories");

  function setCategory(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("category");
    else params.set("category", value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label={t("filterByCategory")}>
      <button
        role="tab"
        aria-selected={active === "all"}
        onClick={() => setCategory("all")}
        className={cn(
          "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
          active === "all"
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-muted-foreground hover:bg-accent"
        )}
      >
        {t("all")}
      </button>
      {POST_CATEGORIES.map((c) => (
        <button
          key={c.value}
          role="tab"
          aria-selected={active === c.value}
          onClick={() => setCategory(c.value)}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
            active === c.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-accent"
          )}
        >
          {tCategories(c.labelKey)}
        </button>
      ))}
    </div>
  );
}
