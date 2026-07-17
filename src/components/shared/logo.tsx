import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("font-semibold tracking-tight", className)}>
      Career<span className="text-primary">Connect</span>
    </span>
  );
}
