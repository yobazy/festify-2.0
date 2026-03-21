import Link from "next/link";
import { Music2, UserRound, Sparkles } from "lucide-react";
import { requireUser } from "@/lib/auth";
import {
  getSpotifyConnection,
  listSavedPlaylistsForUser,
} from "@/lib/spotify-server";

export default async function SettingsOverviewPage() {
  const user = await requireUser();
  const [spotifyConnection, savedPlaylists] = await Promise.all([
    getSpotifyConnection(user.id),
    listSavedPlaylistsForUser(user.id),
  ]);

  const cards = [
    {
      href: "/settings/account",
      icon: UserRound,
      title: "Account",
      description: "Review the session you are using right now.",
      meta: user.email ?? "Signed in",
    },
    {
      href: "/settings/music",
      icon: Music2,
      title: "Music",
      description: "Manage Spotify sync and saved playlists.",
      meta: spotifyConnection
        ? "Spotify connected"
        : "Spotify not connected yet",
    },
    {
      href: "/settings/music",
      icon: Sparkles,
      title: "Saved playlists",
      description: "Your running list of playlists saved from artist pages.",
      meta: `${savedPlaylists.length} saved`,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="glass rounded-3xl border border-white/5 p-6 sm:p-8">
        <h2 className="font-brand text-2xl text-white">Overview</h2>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          This is your shortcut into account controls, Spotify sync, and the
          playlists you save while exploring artists.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="glass group rounded-3xl border border-white/5 p-6 transition-colors hover:border-white/10 hover:bg-white/5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                <Icon size={18} />
              </div>
              <h3 className="mt-5 text-lg font-medium text-white">{card.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {card.description}
              </p>
              <p className="mt-5 text-xs uppercase tracking-[0.2em] text-primary/80">
                {card.meta}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
