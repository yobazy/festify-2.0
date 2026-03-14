"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { RotatingWords } from "./RotatingWords";

export function HeroSection() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-25"
      >
        <source src="/videos/header-video.mp4" type="video/mp4" />
      </video>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 gradient-overlay-strong" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />

      {/* Ambient Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[150px]" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="font-brand text-5xl sm:text-6xl lg:text-8xl text-white mb-4 tracking-tight">
            Discover
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="mb-8"
        >
          <RotatingWords
            words={["festivals", "playlists", "artists", "events"]}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
        >
          Your gateway to the electronic music scene. Find events, explore
          artist lineups, and discover curated Spotify playlists.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/events">
            <Button size="lg" className="rounded-full px-8 text-base">
              Browse Events
            </Button>
          </Link>
          <Link href="/artists">
            <Button
              variant="outline"
              size="lg"
              className="rounded-full px-8 text-base"
            >
              Explore Artists
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
