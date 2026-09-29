import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Festify mark: equalizer bars that rise into a festival main-stage peak,
 * with a teal "live" pennant flying from the center pole.
 * Keep in sync with public/images/logo.svg (src/app/icon.svg is the simplified 3-bar favicon cut).
 */
export function LogoMark({
  size = 32,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const id = useId();
  const bgId = `${id}-bg`;
  const glowId = `${id}-glow`;

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--brand-from, #b52ad6)" }} />
          <stop offset="1" style={{ stopColor: "var(--brand-to, #5e1273)" }} />
        </linearGradient>
        <radialGradient id={glowId} cx="0.5" cy="0.85" r="0.6">
          <stop offset="0" style={{ stopColor: "var(--brand-glow, #d946ef)", stopOpacity: 0.55 }} />
          <stop offset="1" style={{ stopColor: "var(--brand-glow, #d946ef)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${bgId})`} />
      <rect width="64" height="64" rx="15" fill={`url(#${glowId})`} />
      <g fill="#ffffff">
        <rect x="11" y="37" width="6" height="15" rx="3" />
        <rect x="20" y="29" width="6" height="23" rx="3" />
        <rect x="29" y="19" width="6" height="33" rx="3" />
        <rect x="38" y="29" width="6" height="23" rx="3" />
        <rect x="47" y="37" width="6" height="15" rx="3" />
        <rect x="31" y="8" width="2" height="14" rx="1" />
      </g>
      <path d="M33 8.5 L45 12.75 L33 17 Z" fill="var(--accent, #00d4aa)" />
    </svg>
  );
}

const sizes = {
  sm: { mark: 24, text: "text-sm" },
  md: { mark: 32, text: "text-xl" },
  lg: { mark: 40, text: "text-2xl" },
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
    <span className={cn("flex items-center gap-2", className)}>
      <LogoMark
        size={mark}
        className="transition-transform group-hover:scale-110"
      />
      <span className={cn("font-brand tracking-wide text-white", text)}>
        Festify
      </span>
    </span>
  );
}
