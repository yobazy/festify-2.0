"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { signUp } from "../login/actions";

const inputClass =
  "h-11 w-full border-0 border-b border-line bg-transparent text-[15px] text-paper placeholder:text-smoke focus:border-paper focus:outline-none";

export default function SignupPage() {
  const [state, action, isPending] = useActionState(signUp, null);

  return (
    <div className="page pb-24 pt-16">
      <div className="mx-auto max-w-sm">
        <Link href="/" aria-label="Front Left home" className="inline-block">
          <Logo size="lg" />
        </Link>

        <h1 className="display mt-10 text-5xl text-paper">Join</h1>
        <p className="mt-3 text-sm text-smoke">
          Keep artists, events and playlists across devices.
        </p>

        <form action={action} className="mt-8 space-y-6">
          {state?.success && (
            <div className="border border-line px-4 py-3 text-sm text-paper">
              Check your email to confirm, then sign in.
            </div>
          )}

          {state?.error && (
            <div role="alert" className="border border-line px-4 py-3 text-sm text-paper">
              {state.error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="meta block">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className="meta block">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              placeholder="At least 6 characters"
              className={inputClass}
            />
          </div>

          <Button type="submit" variant="solid" size="lg" className="w-full" disabled={isPending}>
            {isPending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            Create account
          </Button>
        </form>

        <p className="mt-8 flex flex-wrap justify-between gap-x-6 gap-y-2">
          <Link href="/auth/login" className="meta-strong underline-offset-4 hover:underline">
            Already in? Sign in
          </Link>
          <Link href="/" className="meta-strong underline-offset-4 hover:underline">
            Back to Front Left
          </Link>
        </p>
      </div>
    </div>
  );
}
