import Link from "next/link";
import {
  CalendarRange,
  Headphones,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function DiscoveryPaths() {
  const today = new Date();
  const nextThirtyDays = new Date(today);
  nextThirtyDays.setDate(today.getDate() + 30);

  const quickPaths = [
    {
      href: "/events?type=festival",
      title: "Festivals",
      description: "Big lineups, weekend plans, and the largest event pages.",
      icon: Sparkles,
      accent: "text-primary",
    },
    {
      href: `/events?from=${formatDateInput(today)}&to=${formatDateInput(nextThirtyDays)}`,
      title: "Next 30 days",
      description: "Shows coming up soon, so you can plan fast.",
      icon: CalendarRange,
      accent: "text-accent",
    },
    {
      href: "/artists?spotify=1",
      title: "Artists with tracks",
      description: "Start with artists you can preview or open in Spotify.",
      icon: Headphones,
      accent: "text-green-500",
    },
  ];

  return (
    <section className="px-4 pb-10 pt-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-brand text-3xl text-white sm:text-4xl">
              Browse
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Pick a lane and get into the good stuff.
            </p>
          </div>
          <Link
            href="/events"
            className="text-sm text-muted-foreground transition-colors hover:text-white"
          >
            All events
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickPaths.map((path) => {
            const Icon = path.icon;

            return (
              <Link
                key={path.title}
                href={path.href}
                className={cn(
                  "glass glass-hover group rounded-3xl p-5 transition-all",
                  "border border-white/5 hover:border-white/10"
                )}
              >
                <div
                  className={cn(
                    "mb-4 inline-flex rounded-2xl bg-white/5 p-3",
                    path.accent
                  )}
                >
                  <Icon size={20} />
                </div>
                <h3 className="font-brand text-xl text-white transition-colors group-hover:text-primary">
                  {path.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {path.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
