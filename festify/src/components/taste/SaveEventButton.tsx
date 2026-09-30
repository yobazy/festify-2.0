"use client";

import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasteStore } from "@/stores/tasteStore";
import type { Event } from "@/types/event";

interface SaveEventButtonProps {
  event: Event;
  className?: string;
  /** Icon-only, for listing rows. */
  compact?: boolean;
}

export function SaveEventButton({
  event,
  className,
  compact = false,
}: SaveEventButtonProps) {
  const savedEvents = useTasteStore((state) => state.savedEvents);
  const toggleSaveEvent = useTasteStore((state) => state.toggleSaveEvent);

  const isSaved = savedEvents.some((entry) => entry.event_id === event.event_id);

  return (
    <button
      type="button"
      onClick={(actionEvent) => {
        actionEvent.preventDefault();
        actionEvent.stopPropagation();
        toggleSaveEvent(event);
      }}
      className={cn(
        "inline-flex items-center gap-2 text-xs font-medium transition-[background-color,color,border-color,transform] active:scale-95",
        compact ? "h-9 w-9 justify-center" : "h-10 px-4",
        isSaved
          ? "bg-paper text-ink"
          : "border border-line-strong text-paper hover:border-paper hover:bg-ink-2",
        className
      )}
      aria-pressed={isSaved}
      aria-label={isSaved ? `Remove ${event.event_name} from saved` : `Save ${event.event_name}`}
      title={isSaved ? "Saved" : "Save"}
    >
      <Bookmark size={14} className={cn(isSaved && "fill-current")} />
      {!compact && (isSaved ? "Saved" : "Save")}
    </button>
  );
}
