"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/auth/login/actions";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  links: { href: string; label: string }[];
  userEmail?: string | null;
}

export function MobileNav({
  isOpen,
  onClose,
  links,
  userEmail,
}: MobileNavProps) {
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
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed top-0 right-0 bottom-0 z-[60] w-72",
              "bg-background/95 backdrop-blur-xl",
              "border-l border-white/10",
              "flex flex-col pt-20 px-6"
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="absolute right-4 top-4 p-2 text-muted-foreground transition-colors hover:text-white"
            >
              <X size={24} />
            </button>

            {links.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    "block py-3 text-lg font-medium",
                    "text-muted-foreground hover:text-white",
                    "border-b border-white/5 transition-colors"
                  )}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 space-y-3"
            >
              {isSignedIn ? (
                <>
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-white">
                    <p className="text-xs uppercase tracking-[0.2em] text-primary/80">
                      Signed in
                    </p>
                    <p className="mt-1 truncate">{userEmail}</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={onClose}
                    className={cn(
                      "block w-full text-center py-3 rounded-full text-sm font-medium",
                      "border border-white/10 text-white hover:bg-white/5 transition-colors"
                    )}
                  >
                    Settings
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      onClick={onClose}
                      className={cn(
                        "block w-full text-center py-3 rounded-full text-sm font-medium",
                        "border border-white/10 text-white hover:bg-white/5 transition-colors"
                      )}
                    >
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    onClick={onClose}
                    className={cn(
                      "block text-center py-3 rounded-full text-sm font-medium",
                      "border border-white/10 text-white hover:bg-white/5 transition-colors"
                    )}
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/auth/signup"
                    onClick={onClose}
                    className={cn(
                      "block text-center py-3 rounded-full text-sm font-medium",
                      "gradient-purple text-white",
                      "hover:opacity-90 transition-opacity"
                    )}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
