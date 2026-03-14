import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-brand text-sm text-muted-foreground">
              Festify
            </span>
            <span className="text-muted-foreground/50 text-xs">
              Powered by Spotify & EDMtrain
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/events"
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Events
            </Link>
            <Link
              href="/artists"
              className="text-sm text-muted-foreground hover:text-white transition-colors"
            >
              Artists
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
