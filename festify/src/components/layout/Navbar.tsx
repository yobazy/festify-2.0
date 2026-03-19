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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#080808] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/images/icon.png"
                alt="Festify"
                width={26}
                height={26}
                className="rounded-none group-hover:opacity-70 transition-opacity"
              />
              <span className="font-brand text-[13px] text-white tracking-[0.2em] uppercase">
                Festify
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-5 py-4 text-[11px] font-brand tracking-[0.18em] uppercase",
                    "text-[#5a5a5a] hover:text-white",
                    "border-b-2 border-transparent hover:border-neon",
                    "transition-all duration-150"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Search + Auth */}
            <div className="hidden md:flex items-center gap-4">
              <GlobalSearch />
              <Link
                href="/auth/login"
                className={cn(
                  "px-4 py-1.5 text-[11px] font-brand tracking-[0.15em] uppercase",
                  "border border-white/15 text-white",
                  "hover:bg-white hover:text-black",
                  "transition-all duration-200"
                )}
              >
                Sign In
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[#5a5a5a] hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
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
