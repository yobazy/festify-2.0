"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Event } from "@/types/event";

interface UpcomingEventsProps {
  events: Event[];
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) return null;

  return (
    <section className="py-10">
      <h2 className="font-brand text-2xl text-white mb-6">Events</h2>

      <div className="space-y-3">
        {events.map((event, i) => (
          <motion.div
            key={event.event_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <Link href={`/events/${event.event_id}`}>
              <div
                className={cn(
                  "glass glass-hover flex items-center gap-4 p-4",
                  "group"
                )}
              >
                <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={
                      (event.use_alt ? event.alt_img : event.img_url) ||
                      PLACEHOLDER_IMAGE
                    }
                    alt={event.event_name}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-sm group-hover:text-primary transition-colors truncate">
                    {event.event_name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(event.event_date)}
                    </span>
                    <span className="flex items-center gap-1 truncate">
                      <MapPin size={11} />
                      {event.event_location}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
