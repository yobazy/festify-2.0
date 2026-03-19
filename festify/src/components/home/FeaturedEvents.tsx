"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Event } from "@/types/event";

interface FeaturedEventsProps {
  events: Event[];
}

export function FeaturedEvents({ events }: FeaturedEventsProps) {
  if (events.length === 0) return null;

  const [hero, ...rest] = events.slice(0, 6);

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-brand text-3xl sm:text-4xl text-white leading-tight">
              Upcoming{" "}
              <span className="text-gradient">Events</span>
            </h2>
            <p className="text-muted-foreground mt-2">
              Don&apos;t miss these upcoming festivals and shows
            </p>
          </div>
          <Link
            href="/events"
            className={cn(
              "hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground",
              "hover:text-white transition-colors group"
            )}
          >
            View all
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </AnimatedSection>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Hero card — spans 2 cols × 2 rows */}
          {hero && (
            <AnimatedSection className="md:col-span-2 md:row-span-2">
              <HeroCard event={hero} />
            </AnimatedSection>
          )}

          {/* Remaining cards */}
          {rest.map((event, i) => (
            <AnimatedSection key={event.event_id} delay={(i + 1) * 0.1}>
              <SmallCard event={event} />
            </AnimatedSection>
          ))}
        </div>

        {/* Mobile view all */}
        <AnimatedSection delay={0.4} className="text-center mt-8 sm:hidden">
          <Link
            href="/events"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-full",
              "border border-white/10 text-sm text-white",
              "hover:bg-white/5 hover:border-white/20 transition-all"
            )}
          >
            View All Events
            <ArrowRight size={14} />
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}

function HeroCard({ event }: { event: Event }) {
  const img = (event.use_alt ? event.alt_img : event.img_url) || PLACEHOLDER_IMAGE;

  return (
    <Link href={`/events/${event.event_id}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "group relative overflow-hidden rounded-2xl h-72 md:h-full min-h-[300px] card-glow",
          "bg-card border border-white/5 hover:border-primary/40 transition-all duration-300"
        )}
      >
        <Image
          src={img}
          alt={event.event_name}
          fill
          sizes="(max-width: 768px) 100vw, 66vw"
          className="object-cover opacity-40 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700"
          priority
        />

        {/* Multi-layer gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

        {/* Date badge */}
        <div className="absolute top-4 right-4 glass px-3 py-1.5 text-xs font-medium text-white flex items-center gap-1.5">
          <Calendar size={12} />
          {formatDate(event.event_date)}
          {event.event_end_date && (
            <span className="text-muted-foreground">– {formatDate(event.event_end_date)}</span>
          )}
        </div>

        {/* Festival badge */}
        {event.festivalInd && (
          <div className="absolute top-4 left-4 gradient-purple px-3 py-1 rounded-full text-xs font-medium text-white">
            Festival
          </div>
        )}

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="font-brand text-2xl sm:text-3xl text-white mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {event.event_name}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin size={14} className="shrink-0 text-primary/70" />
            <span>
              {event.event_venue}
              {event.event_location && `, ${event.event_location}`}
            </span>
          </div>

          {/* Hover CTA */}
          <div className="mt-4 flex items-center gap-2 text-sm text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>View event</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function SmallCard({ event }: { event: Event }) {
  const img = (event.use_alt ? event.alt_img : event.img_url) || PLACEHOLDER_IMAGE;

  return (
    <Link href={`/events/${event.event_id}`}>
      <div
        className={cn(
          "group relative overflow-hidden rounded-2xl h-36 card-glow",
          "bg-card border border-white/5 hover:border-primary/30 transition-all duration-300"
        )}
      >
        <Image
          src={img}
          alt={event.event_name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover opacity-35 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Date */}
        <div className="absolute top-2.5 right-2.5 glass px-2 py-0.5 text-[11px] font-medium text-white flex items-center gap-1">
          <Calendar size={10} />
          {formatDate(event.event_date)}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <h3 className="font-brand text-sm text-white group-hover:text-primary transition-colors line-clamp-1">
            {event.event_name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <MapPin size={10} className="shrink-0" />
            <span className="truncate">{event.event_location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
