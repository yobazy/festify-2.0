"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
        {/* Section header */}
        <AnimatedSection className="mb-8">
          <div className="section-rule mb-6" />
          <div className="flex items-end justify-between">
            <div className="flex items-end gap-5">
              <span className="font-brand-thin text-[80px] leading-none text-white/[0.04] select-none -mb-2">
                02
              </span>
              <div>
                <p className="eyebrow mb-1 flex items-center gap-2">
                  <span className="eq-bars" aria-hidden>
                    <span className="eq-bar" />
                    <span className="eq-bar" />
                    <span className="eq-bar" />
                    <span className="eq-bar" />
                  </span>
                  Now Playing
                </p>
                <h2 className="font-brand text-3xl sm:text-4xl text-white leading-none">
                  &ldquo;Festivals&rdquo;
                </h2>
              </div>
            </div>

            {/* Scroll arrows */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                className="p-2 border border-white/10 hover:border-white/25 transition-colors text-[#5a5a5a] hover:text-white"
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-2 border border-white/10 hover:border-white/25 transition-colors text-[#5a5a5a] hover:text-white"
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </AnimatedSection>

        {/* Horizontal scroll track */}
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
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
                  <div className="group relative overflow-hidden h-44 card-glow bg-[#0f0f0f] border border-white/[0.06] hover:border-white/20 transition-all duration-300">
                    <Image
                      src={img}
                      alt={festival.event_name}
                      fill
                      sizes="320px"
                      className="object-cover opacity-50 group-hover:opacity-65 group-hover:scale-103 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-neon opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Top row */}
                    <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-3">
                      <span className="eyebrow px-1.5 py-0.5 bg-neon text-black">&ldquo;Festival&rdquo;</span>
                      <span className="eyebrow text-white/30">
                        {formatDate(festival.event_date)}
                      </span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <div className="w-5 h-px bg-white/15 mb-2" />
                      <h3 className="font-brand text-sm text-white group-hover:text-neon transition-colors duration-200 line-clamp-1">
                        {festival.event_name}
                      </h3>
                      <p className="eyebrow text-white/25 mt-1 truncate">
                        {festival.event_venue
                          ? `${festival.event_venue} · ${festival.event_location}`
                          : festival.event_location}
                      </p>
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
