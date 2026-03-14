import { cn } from "@/lib/utils";

interface GradientBackgroundProps {
  className?: string;
  variant?: "hero" | "section" | "subtle";
}

export function GradientBackground({
  className,
  variant = "hero",
}: GradientBackgroundProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none overflow-hidden",
        className
      )}
      aria-hidden
    >
      {variant === "hero" && (
        <>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-accent/10 rounded-full blur-[100px]" />
        </>
      )}
      {variant === "section" && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
      )}
      {variant === "subtle" && (
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
      )}
    </div>
  );
}
