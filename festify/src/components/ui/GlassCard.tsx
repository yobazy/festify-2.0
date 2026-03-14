import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = false,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass",
        hover && "glass-hover cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
