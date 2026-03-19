"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MobileNav } from "./MobileNav";
import { GlobalSearch } from "./GlobalSearch";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/artists", label: "Artists" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <Image
                src="/images/icon.png"
                alt="Festify"
                width={32}
                height={32}
                className="rounded-lg group-hover:scale-110 transition-transform"
              />
              <span className="font-brand text-xl text-white tracking-wide">
                Festify
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium",
                    "text-muted-foreground hover:text-white",
                    "hover:bg-white/5 transition-all duration-200"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Search + Auth */}
            <div className="hidden md:flex items-center gap-2">
              <GlobalSearch />
              <Link
                href="/auth/login"
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium",
                  "gradient-purple text-white",
                  "hover:opacity-90 transition-opacity"
                )}
              >
                Sign In
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-muted-foreground hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <MobileNav
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={navLinks}
      />
    </>
  );
}
