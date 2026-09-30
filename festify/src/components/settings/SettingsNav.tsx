"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/settings", label: "Overview" },
  { href: "/settings/account", label: "Account" },
  { href: "/settings/music", label: "Music" },
];

/** Underline tabs on a hairline, like the listing filters. Overview is exact-match only. */
export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Settings"
      className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line py-3"
    >
      {links.map((link) => {
        const active =
          link.href === "/settings"
            ? pathname === "/settings"
            : pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "border-b pb-0.5 text-sm transition-colors",
              active
                ? "border-paper text-paper"
                : "border-transparent text-smoke hover:border-line-strong hover:text-paper"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
