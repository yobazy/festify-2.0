import Link from "next/link";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayLineupLinkProps {
  eventId: number;
  label?: string;
  className?: string;
}

/** Teal play affordance: jumps to the event's "Listen" section, player ready. */
export function PlayLineupLink({
  eventId,
  label = "Hear the lineup",
  className,
}: PlayLineupLinkProps) {
  return (
    <Link
      href={`/events/${eventId}#listen`}
      className={cn(
        "group/play inline-flex items-center gap-3 text-sm font-medium text-paper",
        className
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center bg-signal text-signal-ink transition-transform group-hover/play:scale-105 group-active/play:scale-95">
        <Play size={18} className="ml-0.5 fill-current" />
      </span>
      {label}
    </Link>
  );
}
