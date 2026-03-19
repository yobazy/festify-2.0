"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { PLACEHOLDER_IMAGE } from "@/lib/constants";
import type { Event } from "@/types/event";

interface PopularFestivalsProps {
  festivals: Event[];
}

export function PopularFestivals({ festivals }: PopularFestivalsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (festivals.length === 0) return null;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 340 : -340, behavior: "smooth" });
  };

  return (
    <section className="relative py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            {/* Equalizer decoration */}
            <div className="eq-bars" aria-hidden>
              <div className="eq-bar" />
              <div className="eq-bar" />
              <div className="eq-bar" />
              <div className="eq-bar" />
            </div>
            <div>
              <h2 className="font-brand text-3xl sm:text-4xl text-white leading-none">
                Popular <span className="text-gradient">Festivals</span>
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                The biggest electronic music events this year
              </p>
            </div>
          </div>

          {/* Scroll arrows */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-full glass hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-full glass hover:bg-white/10 transition-colors text-muted-foreground hover:text-white"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </AnimatedSection>

        {/* Horizontal scroll track */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {festivals.map((festival, i) => {
            const img =
              (festival.use_alt ? festival.alt_img : festival.img_url) ||
              PLACEHOLDER_IMAGE;

            return (
              <motion.div
                key={festival.event_id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                style={{ scrollSnapAlign: "start" }}
                className="shrink-0 w-72 sm:w-80"
              >
                <Link href={`/events/${festival.event_id}`}>
                  <div className="group relative overflow-hidden rounded-2xl h-44 card-glow bg-card border border-white/5 hover:border-primary/30 transition-all duration-300">
                    {/* Background image */}
                    <Image
                      src={img}
                      alt={festival.event_name}
                      fill
                      sizes="320px"
                      className="object-cover opacity-40 group-hover:opacity-55 group-hover:scale-105 transition-all duration-500"
                    />

                    {/* Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* Date badge */}
                    <div className="absolute top-3 right-3 glass px-2.5 py-1 text-[11px] font-medium text-white flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(festival.event_date)}
                    </div>

                    {/* Festival badge */}
                    <div className="absolute top-3 left-3 gradient-purple px-2.5 py-1 rounded-full text-[11px] font-medium text-white">
                      Festival
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-brand text-base text-white group-hover:text-primary transition-colors line-clamp-1 mb-1">
                        {festival.event_name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={11} />
                        <span className="truncate">
                          {festival.event_venue
                            ? `${festival.event_venue}, ${festival.event_location}`
                            : festival.event_location}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
