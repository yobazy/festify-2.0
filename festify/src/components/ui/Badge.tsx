import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "muted";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variant === "default" && "bg-primary/20 text-primary",
        variant === "accent" && "bg-accent/20 text-accent",
        variant === "muted" && "bg-white/5 text-muted-foreground",
        className
      )}
    >
      {children}
    </span>
  );
}
