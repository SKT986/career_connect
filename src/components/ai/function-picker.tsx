"use client";

import { cn } from "@/lib/utils";
import { AI_FUNCTIONS } from "@/lib/ai-functions";
import type { AiFunctionType } from "@/types/database.types";

export function FunctionPicker({
  value,
  onChange,
}: {
  value: AiFunctionType;
  onChange: (value: AiFunctionType) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="AI assistant function"
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
    >
      {AI_FUNCTIONS.map((fn) => (
        <button
          key={fn.value}
          type="button"
          role="radio"
          aria-checked={value === fn.value}
          onClick={() => onChange(fn.value)}
          className={cn(
            "flex flex-col items-start gap-1.5 rounded-2xl border p-3 text-left transition-colors",
            value === fn.value
              ? "border-primary bg-accent"
              : "border-border bg-card hover:bg-accent/60"
          )}
        >
          <fn.icon className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-xs font-medium">{fn.label}</span>
        </button>
      ))}
    </div>
  );
}
