import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  children,
}: {
  className?: string;
  tone?: "neutral" | "ok" | "warn" | "accent";
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        tone === "neutral" && "bg-bg-sunken text-muted",
        tone === "ok" && "bg-accent-soft text-ok",
        tone === "warn" && "bg-surface-2 text-warn",
        tone === "accent" && "bg-accent text-accent-fg",
        className,
      )}
    >
      {children}
    </span>
  );
}
