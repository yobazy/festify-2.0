"use client";

import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTasteStore } from "@/stores/tasteStore";
import type { Event } from "@/types/event";

interface SaveEventButtonProps {
  event: Event;
  className?: string;
}

export function SaveEventButton({
  event,
  className,
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
        "inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium transition-all",
        isSaved
          ? "bg-primary text-black"
          : "bg-black/50 text-white hover:bg-black/65",
        className
      )}
      aria-pressed={isSaved}
    >
      <Bookmark size={14} className={cn(isSaved && "fill-current")} />
      {isSaved ? "Saved" : "Save"}
    </button>
  );
}
