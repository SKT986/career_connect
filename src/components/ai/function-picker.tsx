"use client";

import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AI_FUNCTIONS } from "@/lib/ai-functions";
import type { AiFunctionType } from "@/types/database.types";

export function FunctionPicker({
  value,
  onChange,
}: {
  value: AiFunctionType;
  onChange: (value: AiFunctionType) => void;
}) {
  const t = useTranslations("aiAssistant");
  const active = AI_FUNCTIONS.find((fn) => fn.value === value)!;

  return (
    <Select value={value} onValueChange={(v) => onChange(v as AiFunctionType)}>
      <SelectTrigger aria-label={t("functionPickerLabel")} className="w-full rounded-2xl sm:w-64">
        <div className="flex items-center gap-2">
          <active.icon className="h-4 w-4 text-primary" aria-hidden="true" />
          <SelectValue>{t(active.labelKey)}</SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {AI_FUNCTIONS.map((fn) => (
          <SelectItem key={fn.value} value={fn.value}>
            <div className="flex items-center gap-2">
              <fn.icon className="h-4 w-4 text-primary" aria-hidden="true" />
              {t(fn.labelKey)}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
