"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Event } from "@/types/event";

interface FeaturedEventsProps {
  events: Event[];
}

export function FeaturedEvents({ events }: FeaturedEventsProps) {
  if (events.length === 0) return null;

  return (
    <section className="relative py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection>
          <h2 className="font-brand text-3xl sm:text-4xl text-white mb-2">
            Upcoming Events
          </h2>
          <p className="text-muted-foreground mb-10">
            Don&apos;t miss these upcoming festivals and shows
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.slice(0, 6).map((event, i) => (
            <AnimatedSection key={event.event_id} delay={i * 0.1}>
              <Link href={`/events/${event.event_id}`}>
                <GlassCard
                  hover
                  className="group relative overflow-hidden h-64"
                >
                  {/* Background Image */}
                  <Image
                    src={
                      (event.use_alt ? event.alt_img : event.img_url) ||
                      PLACEHOLDER_IMAGE
                    }
                    alt={event.event_name}
                    fill
                    className="object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
                  />

                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Date Badge */}
                  <div className="absolute top-4 right-4 glass px-3 py-1.5 text-xs font-medium text-white">
                    <Calendar size={12} className="inline mr-1.5 -mt-0.5" />
                    {formatDate(event.event_date)}
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="font-brand text-lg text-white mb-1 group-hover:text-primary transition-colors">
                      {event.event_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin size={14} />
                      <span>
                        {event.event_venue}, {event.event_location}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.4} className="text-center mt-10">
          <Link
            href="/events"
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-full",
              "border border-white/10 text-sm text-white",
              "hover:bg-white/5 hover:border-white/20 transition-all"
            )}
          >
            View All Events
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
