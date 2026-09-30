import { cn } from "@/lib/utils";

/**
 * Front Left mark: a floor plan. The stage is the bar across the top, the
 * crowd is the grid of dots, and the one solid teal dot at the front-left is
 * you. Keep in sync with public/images/logo.svg (src/app/icon.svg is the
 * favicon cut: stage bar + the teal dot).
 */
export function LogoMark({
  size = 28,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="6" y="6" width="52" height="8" fill="currentColor" />
      <g fill="currentColor" fillOpacity="0.38">
        <circle cx="27" cy="28" r="3" />
        <circle cx="41" cy="28" r="3" />
        <circle cx="55" cy="28" r="3" />
        <circle cx="13" cy="42" r="3" />
        <circle cx="27" cy="42" r="3" />
        <circle cx="41" cy="42" r="3" />
        <circle cx="55" cy="42" r="3" />
        <circle cx="13" cy="56" r="3" />
        <circle cx="27" cy="56" r="3" />
        <circle cx="41" cy="56" r="3" />
        <circle cx="55" cy="56" r="3" />
      </g>
      <circle cx="13" cy="28" r="6" fill="var(--signal, #00d4aa)" />
    </svg>
  );
}

const sizes = {
  sm: { mark: 20, text: "text-[15px]" },
  md: { mark: 26, text: "text-xl" },
  lg: { mark: 40, text: "text-3xl" },
} as const;

export function Logo({
  size = "md",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  const { mark, text } = sizes[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5 text-paper", className)}>
      <LogoMark size={mark} />
      <span className={cn("display leading-none", text)}>Front Left</span>
    </span>
  );
}
