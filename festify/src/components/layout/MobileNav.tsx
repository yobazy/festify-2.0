"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed top-0 right-0 bottom-0 z-50 w-72",
              "bg-background/95 backdrop-blur-xl",
              "border-l border-white/10",
              "flex flex-col pt-20 px-6"
            )}
          >
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
