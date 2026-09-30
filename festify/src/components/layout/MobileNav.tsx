"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { signOut } from "@/app/auth/login/actions";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
  userEmail?: string | null;
}

export function MobileNav({ isOpen, onClose, links, userEmail }: MobileNavProps) {
  const isSignedIn = Boolean(userEmail);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Dialog behavior: lock page scroll, close on Escape, keep Tab inside the
  // drawer, and hand focus back to whatever opened it.
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const getFocusable = () =>
      Array.from(
        drawerRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []
      );
    getFocusable()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={drawerRef}
          id="mobile-nav"
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed inset-0 z-[60] flex flex-col bg-ink"
        >
          <div className="page flex h-14 items-center justify-between border-b border-line">
            <Link href="/" onClick={onClose} aria-label="Front Left home" className="flex items-center">
              <Logo size="sm" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="-mr-2 p-2 text-paper"
            >
              <X size={22} />
            </button>
          </div>

          <nav className="page flex flex-1 flex-col justify-center" aria-label="Primary">
            {links.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.05, duration: 0.25, ease: "easeOut" }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className="display block border-b border-line py-5 text-5xl text-paper transition-colors hover:text-signal"
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
          </nav>

          <div className="page border-t border-line py-6">
            {isSignedIn ? (
              <div className="flex items-center justify-between gap-4">
                <Link
                  href="/settings"
                  onClick={onClose}
                  className="meta-strong min-w-0 truncate underline-offset-4 hover:underline"
                >
                  {userEmail}
                </Link>
                <form action={signOut}>
                  <button
                    type="submit"
                    onClick={onClose}
                    className="text-sm font-medium text-smoke hover:text-paper"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/auth/login"
                  onClick={onClose}
                  className="flex h-11 items-center justify-center border border-line-strong text-sm font-medium text-paper"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={onClose}
                  className="flex h-11 items-center justify-center bg-paper text-sm font-medium text-ink"
                >
                  Join
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
