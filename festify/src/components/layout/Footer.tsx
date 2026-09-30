import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";

const columns = [
  {
    title: "Go",
    links: [
      { href: "/events", label: "Shows" },
      { href: "/events?type=festival", label: "Festivals" },
      { href: "/artists", label: "Artists" },
      { href: "/playlists", label: "Playlists" },
    ],
  },
  {
    title: "You",
    links: [
      { href: "/auth/signup", label: "Join" },
      { href: "/auth/login", label: "Sign in" },
      { href: "/settings", label: "Settings" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="page py-12">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))]">
          <div>
            <p className="display text-[clamp(2rem,5vw,3.5rem)] leading-[0.9] text-paper">
              See you
              <br />
              front left.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <p className="meta mb-4">{column.title}</p>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-paper-2 transition-colors hover:text-paper"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="rule mt-12 flex flex-col gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-paper">
            <LogoMark size={18} />
            <span className="meta-strong">Front Left</span>
          </div>
          <p className="meta">
            Shows from EDMTrain and Resident Advisor. Audio via Spotify.
          </p>
        </div>
      </div>
    </footer>
  );
}
