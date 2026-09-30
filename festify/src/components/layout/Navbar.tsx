"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { GlobalSearch } from "./GlobalSearch";
import { MobileNav } from "./MobileNav";

const navLinks = [
  { href: "/events", label: "Shows" },
  { href: "/artists", label: "Artists" },
  { href: "/playlists", label: "Playlists" },
];

interface NavbarProps {
  userEmail?: string | null;
}

export function Navbar({ userEmail }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isSignedIn = Boolean(userEmail);
  const closeMobileNav = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-ink">
        {/* Three columns on desktop so the links sit on the page's true center,
            whatever width the logo or the account side (and open search) take. */}
        <div className="page flex h-14 items-center justify-between gap-6 md:grid md:grid-cols-[1fr_auto_1fr]">
          <Link href="/" aria-label="Front Left home" className="flex shrink-0 items-center justify-self-start">
            <Logo size="sm" />
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-sm font-medium transition-colors",
                    active ? "text-paper" : "text-smoke hover:text-paper"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-4 justify-self-end md:flex">
            <GlobalSearch />
            {isSignedIn ? (
              <Link
                href="/settings"
                className="meta-strong max-w-[200px] truncate underline-offset-4 hover:underline"
                title="Settings"
              >
                {userEmail}
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-smoke transition-colors hover:text-paper"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="flex h-9 items-center bg-paper px-4 text-sm font-medium text-ink transition-colors hover:bg-white"
                >
                  Join
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="-mr-2 p-2 text-paper md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls={mobileOpen ? "mobile-nav" : undefined}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <MobileNav
        isOpen={mobileOpen}
        onClose={closeMobileNav}
        links={navLinks}
        userEmail={userEmail}
      />
    </>
  );
}
