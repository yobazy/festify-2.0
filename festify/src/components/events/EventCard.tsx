"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
  index?: number;
}

export function EventCard({ event, index = 0 }: EventCardProps) {
  const imageUrl =
    (event.use_alt ? event.alt_img : event.img_url) || PLACEHOLDER_IMAGE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/events/${event.event_id}`}>
        <div
          className={cn(
            "group relative overflow-hidden h-72",
            "bg-[#0f0f0f] border border-white/[0.06]",
            "hover:border-white/20 transition-all duration-300",
            "card-glow"
          )}
        >
          {/* Background Image — more prominent */}
          <Image
            src={imageUrl}
            alt={event.event_name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover opacity-55 group-hover:opacity-70 group-hover:scale-103 transition-all duration-700"
          />

          {/* Gradient — weighted to bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

          {/* Neon top-edge accent line on hover */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-neon opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Top bar — date + festival tag */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 pt-3">
            {event.festivalInd ? (
              <span className="eyebrow px-2 py-1 bg-neon text-black">
                "Festival"
              </span>
            ) : (
              <span />
            )}
            <span className="eyebrow text-white/40">
              {formatDateShort(event.event_date)}
              {event.event_end_date && ` — ${formatDateShort(event.event_end_date)}`}
            </span>
          </div>

          {/* Content — editorial layout */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/* Thin rule above content */}
            <div className="w-8 h-px bg-white/20 mb-3" />

            <h3 className="font-brand text-base text-white mb-1.5 group-hover:text-neon transition-colors duration-200 line-clamp-2 leading-snug">
              {event.event_name}
            </h3>

            <p className="eyebrow text-white/35 truncate">
              {event.event_venue
                ? `${event.event_venue} · ${event.event_location}`
                : event.event_location}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }).toUpperCase();
}
