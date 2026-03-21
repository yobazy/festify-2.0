import Link from "next/link";
import { cn } from "@/lib/utils";

const settingsLinks = [
  {
    href: "/settings",
    label: "Overview",
    description: "Quick account and music summary",
  },
  {
    href: "/settings/account",
    label: "Account",
    description: "Email, session, and sign out",
  },
  {
    href: "/settings/music",
    label: "Music",
    description: "Spotify connection and saved playlists",
  },
];

interface SettingsShellProps {
  children: React.ReactNode;
  userEmail: string | null;
}

export function SettingsShell({ children, userEmail }: SettingsShellProps) {
  return (
    <div className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-primary/80">
              Settings
            </p>
            <h1 className="mt-3 font-brand text-4xl text-white">
              Your Festify setup
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
              Manage your account, connect Spotify, and keep a library of
              playlists you want to revisit.
            </p>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
              Signed in as
            </p>
            <p className="mt-1 max-w-[280px] truncate">{userEmail}</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="glass rounded-3xl border border-white/5 p-3">
            <nav className="space-y-2">
              {settingsLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block rounded-2xl border border-transparent px-4 py-3 transition-colors",
                    "hover:border-white/10 hover:bg-white/5"
                  )}
                >
                  <p className="text-sm font-medium text-white">{link.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {link.description}
                  </p>
                </Link>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
