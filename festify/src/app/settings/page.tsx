import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getSpotifyConnection } from "@/lib/spotify-server";

export default async function SettingsOverviewPage() {
  const user = await requireUser();
  const spotifyConnection = await getSpotifyConnection(user.id);

  const rows = [
    {
      href: "/settings/account",
      title: "Account",
      description: "Email, session and sign out.",
      status: user.email ?? "Signed in",
    },
    {
      href: "/settings/music",
      title: "Music",
      description: "Spotify connection and playlist sync.",
      status: spotifyConnection ? "Spotify connected" : "Spotify not connected",
    },
  ];

  return (
    <section>
      {rows.map((row) => (
        <div
          key={row.href}
          className="grid gap-2 border-b border-line py-5 sm:grid-cols-[minmax(0,1fr)_auto]"
        >
          <div className="min-w-0">
            <h2 className="display-narrow text-2xl text-paper">
              <Link href={row.href} className="transition-colors hover:text-signal">
                {row.title}
              </Link>
            </h2>
            <p className="mt-1 text-sm text-smoke">{row.description}</p>
          </div>
          <p className="meta truncate sm:text-right">{row.status}</p>
        </div>
      ))}
    </section>
  );
}
