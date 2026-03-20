"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { SaveEventButton } from "@/components/taste/SaveEventButton";
import type { Event } from "@/types/event";

interface EventHeaderProps {
  event: Event;
}

export function EventHeader({ event }: EventHeaderProps) {
  const imageUrl =
    (event.use_alt ? event.alt_img : event.img_url) || "/images/event-placeholder.svg";

  return (
    <section className="relative h-[60vh] min-h-[400px] flex items-end overflow-hidden">
      {/* Background Image */}
      <Image
        src={imageUrl}
        alt={event.event_name}
        fill
        priority
        className="object-cover"
      />

      {/* Overlays */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {event.festivalind && (
            <span className="inline-block bg-primary/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-white mb-4">
              Festival
            </span>
          )}

          <h1 className="font-brand text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
            {event.event_name}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-wrap items-center gap-4 text-muted-foreground"
        >
          <SaveEventButton event={event} className="bg-white/10 hover:bg-white/15" />

          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>
              {formatDateLong(event.event_date)}
              {event.event_end_date &&
                ` — ${formatDateLong(event.event_end_date)}`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>
              {event.event_venue}, {event.event_location}
            </span>
          </div>

          {event.edmtrain_link && (
            <a
              href={event.edmtrain_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <ExternalLink size={14} />
              EDMtrain
            </a>
          )}
        </motion.div>
      </div>
    </section>
  );
}

function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}
