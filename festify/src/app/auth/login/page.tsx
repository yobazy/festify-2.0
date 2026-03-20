"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { signIn } from "./actions";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(signIn, null);
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  const signupMessage = searchParams.get("message");
  const infoMessage =
    signupMessage === "check-email"
      ? "Check your email to confirm your account, then sign in."
      : callbackError === "auth_callback_failed"
        ? "We couldn't finish signing you in. Please try again."
        : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 group mb-6">
            <Image
              src="/images/icon.png"
              alt="Festify"
              width={40}
              height={40}
              className="rounded-xl group-hover:scale-110 transition-transform"
            />
            <span className="font-brand text-2xl text-white tracking-wide">
              Festify
            </span>
          </Link>
          <h1 className="text-2xl font-brand text-white">Welcome back</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="glass p-8 rounded-2xl">
          <form action={action} className="space-y-5">
            {infoMessage && (
              <div className="px-4 py-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
                {infoMessage}
              </div>
            )}

            {/* Error message */}
            {state?.error && (
              <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {state.error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                className={cn(
                  "w-full px-4 py-2.5 rounded-lg text-sm",
                  "bg-white/5 border border-white/10",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:border-primary/60 focus:bg-white/8",
                  "transition-colors"
                )}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className={cn(
                  "w-full px-4 py-2.5 rounded-lg text-sm",
                  "bg-white/5 border border-white/10",
                  "text-foreground placeholder:text-muted-foreground",
                  "focus:outline-none focus:border-primary/60 focus:bg-white/8",
                  "transition-colors"
                )}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "w-full py-2.5 rounded-full text-sm font-medium",
                "gradient-purple text-white",
                "hover:opacity-90 transition-opacity",
                "flex items-center justify-center gap-2",
                "disabled:opacity-60 disabled:cursor-not-allowed"
              )}
            >
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {isPending ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            New here?{" "}
            <Link href="/auth/signup" className="text-white hover:text-primary transition-colors">
              Create an account
            </Link>
          </p>
        </div>

        {/* Back link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link href="/" className="hover:text-white transition-colors">
            ← Back to Festify
          </Link>
        </p>
      </div>
    </div>
  );
}
