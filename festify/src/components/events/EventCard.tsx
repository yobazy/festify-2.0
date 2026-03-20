"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SaveEventButton } from "@/components/taste/SaveEventButton";
import type { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const rawImageUrl = event.use_alt ? event.alt_img : event.img_url;
  const imageUrl = normalizeImageUrl(rawImageUrl) || "/images/event-placeholder.svg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <div className="relative">
        <div className="absolute left-3 top-3 z-10">
          <SaveEventButton event={event} />
        </div>

        <Link href={`/events/${event.event_id}`}>
        <div
          className={cn(
            "group relative overflow-hidden rounded-2xl h-72",
            "bg-card border border-white/5",
            "hover:border-primary/30 transition-all duration-300",
            "hover:shadow-lg hover:shadow-primary/10"
          )}
        >
          {/* Background Image */}
          <Image
            src={imageUrl}
            alt={event.event_name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-500"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Date Badge */}
          <div className="absolute top-3 right-3 glass px-3 py-1 text-xs font-medium text-white flex items-center gap-1.5">
            <Calendar size={12} />
            {formatDate(event.event_date)}
            {event.event_end_date && (
              <span className="text-muted-foreground">
                {" "}
                - {formatDate(event.event_end_date)}
              </span>
            )}
          </div>

          {/* Festival Badge */}
          {event.festivalind && (
            <div className="absolute top-3 left-3 bg-primary/80 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-medium text-white">
              Festival
            </div>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="font-brand text-xl text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {event.event_name}
            </h3>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin size={14} className="shrink-0" />
                <span className="truncate">
                  {event.event_venue}
                  {event.event_location && `, ${event.event_location}`}
                </span>
              </div>

              {event.artists && event.artists.length > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users size={14} className="shrink-0" />
                  <span>{event.artists.length} artists</span>
                </div>
              )}
            </div>
          </div>
        </div>
        </Link>
      </div>
    </motion.div>
  );
}

function normalizeImageUrl(url: string | null): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  // Some RA rows include a full URL after the CDN host prefix.
  const raPrefix = "https://images.ra.co/";
  if (trimmed.startsWith(raPrefix + "https://")) {
    return trimmed.slice(raPrefix.length);
  }

  return trimmed;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
