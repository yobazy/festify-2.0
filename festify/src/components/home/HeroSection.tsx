import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 pb-6 pt-28 sm:pt-32">
      {/* Ambient Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] max-w-full -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
          Upcoming EDM events, lineups you can listen to
        </p>

        <h1 className="mt-5 max-w-3xl font-brand text-4xl leading-[1.05] text-white sm:text-6xl">
          Find the festival.{" "}
          <span className="bg-gradient-to-r from-primary to-brand-glow bg-clip-text text-transparent">
            Hear the lineup
          </span>{" "}
          before you go.
        </h1>

        <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Browse shows and festivals, see who&apos;s playing, and preview every
          artist on Spotify before you buy the ticket.
        </p>

        <form
          action="/events"
          method="get"
          role="search"
          className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
        >
          <label htmlFor="hero-search" className="sr-only">
            Search events, artists, or cities
          </label>
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="hero-search"
              name="q"
              type="search"
              placeholder="Search events, artists, or cities"
              className={cn(
                "h-12 w-full rounded-full pl-11 pr-4",
                "border border-white/10 bg-white/5",
                "text-sm text-white placeholder:text-muted-foreground",
                "transition-colors focus:border-primary/50"
              )}
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium text-primary-foreground gradient-purple transition-opacity hover:opacity-90"
          >
            Find events
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </form>

        <p className="mt-4 text-sm text-muted-foreground">
          Or jump to{" "}
          <Link href="/playlists" className="text-white underline-offset-4 hover:underline">
            playlists for top lineups
          </Link>
        </p>
      </div>
    </section>
  );
}
