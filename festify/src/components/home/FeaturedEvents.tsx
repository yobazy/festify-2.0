"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
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
        {/* Section header — editorial numbered style */}
        <AnimatedSection className="mb-10">
          <div className="section-rule mb-6" />
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-5">
              <span className="font-brand-thin text-[80px] leading-none text-white/[0.04] select-none -mb-2">
                01
              </span>
              <div>
                <p className="eyebrow mb-1">Upcoming</p>
                <h2 className="font-brand text-3xl sm:text-4xl text-white leading-none">
                  &ldquo;Events&rdquo;
                </h2>
              </div>
            </div>
            <Link
              href="/events"
              className={cn(
                "hidden sm:inline-flex items-center gap-2",
                "eyebrow text-white/30 hover:text-white transition-colors group"
              )}
            >
              All Events
              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </AnimatedSection>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Hero card — spans 2 cols × 2 rows */}
          {hero && (
            <AnimatedSection className="md:col-span-2 md:row-span-2">
              <HeroCard event={hero} />
            </AnimatedSection>
          )}

          {/* Remaining cards */}
          {rest.map((event, i) => (
            <AnimatedSection key={event.event_id} delay={(i + 1) * 0.08}>
              <SmallCard event={event} />
            </AnimatedSection>
          ))}
        </div>

        {/* Mobile view all */}
        <AnimatedSection delay={0.4} className="text-center mt-8 sm:hidden">
          <Link
            href="/events"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-2.5",
              "border border-white/10 eyebrow text-white/50",
              "hover:border-white/25 hover:text-white transition-all"
            )}
          >
            View All Events
            <ArrowRight size={11} />
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
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "group relative overflow-hidden h-72 md:h-full min-h-[320px] card-glow",
          "bg-[#0f0f0f] border border-white/[0.06] hover:border-white/20 transition-all duration-300"
        )}
      >
        <Image
          src={img}
          alt={event.event_name}
          fill
          sizes="(max-width: 768px) 100vw, 66vw"
          className="object-cover opacity-50 group-hover:opacity-65 group-hover:scale-103 transition-all duration-700"
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

        {/* Neon top accent on hover */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-neon opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Top row */}
        <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-4">
          {event.festivalInd && (
            <span className="eyebrow px-2 py-1 bg-neon text-black">
              &ldquo;Festival&rdquo;
            </span>
          )}
          <span className="eyebrow text-white/35 ml-auto">
            {formatDateShort(event.event_date)}
            {event.event_end_date && ` — ${formatDateShort(event.event_end_date)}`}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="w-10 h-px bg-white/20 mb-4" />
          <h3 className="font-brand text-2xl sm:text-3xl text-white mb-2 group-hover:text-neon transition-colors duration-200 line-clamp-2 leading-tight">
            {event.event_name}
          </h3>
          <p className="eyebrow text-white/35">
            {event.event_venue}
            {event.event_location && ` · ${event.event_location}`}
          </p>
          <div className="mt-4 flex items-center gap-2 eyebrow text-neon opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            View event →
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
          "group relative overflow-hidden h-36 card-glow",
          "bg-[#0f0f0f] border border-white/[0.06] hover:border-white/20 transition-all duration-300"
        )}
      >
        <Image
          src={img}
          alt={event.event_name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover opacity-50 group-hover:opacity-65 group-hover:scale-103 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-neon opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 right-2">
          <span className="eyebrow text-white/30">{formatDateShort(event.event_date)}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="w-5 h-px bg-white/15 mb-2" />
          <h3 className="font-brand text-sm text-white group-hover:text-neon transition-colors duration-200 line-clamp-1">
            {event.event_name}
          </h3>
          <p className="eyebrow text-white/25 mt-0.5 truncate">{event.event_location}</p>
        </div>
      </div>
    </Link>
  );
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}
