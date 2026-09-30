import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  /** `live` is teal and means now / playing / on stage — nothing else. */
  variant?: "default" | "live" | "muted" | "accent";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[11px] leading-5 tracking-wide",
        variant === "default" && "border border-line text-paper-2",
        variant === "muted" && "bg-ink-3 text-smoke",
        (variant === "live" || variant === "accent") && "bg-signal text-signal-ink",
        className
      )}
    >
      {children}
    </span>
  );
}
