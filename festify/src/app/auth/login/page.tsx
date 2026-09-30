"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { signIn } from "./actions";

const inputClass =
  "h-11 w-full border-0 border-b border-line bg-transparent text-[15px] text-paper placeholder:text-smoke focus:border-paper focus:outline-none";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(signIn, null);
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");
  const signupMessage = searchParams.get("message");
  const nextPath = searchParams.get("next") ?? "/";
  const infoMessage =
    signupMessage === "check-email"
      ? "Check your email to confirm, then sign in."
      : callbackError === "auth_callback_failed"
        ? "Couldn't finish signing you in. Try again."
        : null;

  return (
    <div className="page pb-24 pt-16">
      <div className="mx-auto max-w-sm">
        <Link href="/" aria-label="Front Left home" className="inline-block">
          <Logo size="lg" />
        </Link>

        <h1 className="display mt-10 text-5xl text-paper">Sign in</h1>
        <p className="mt-3 text-sm text-smoke">Your saves, your bill.</p>

        <form action={action} className="mt-8 space-y-6">
          <input type="hidden" name="next" value={nextPath} />

          {infoMessage && (
            <div className="border border-line px-4 py-3 text-sm text-paper">{infoMessage}</div>
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
              autoComplete="current-password"
              required
              placeholder="Password"
              className={inputClass}
            />
          </div>

          <Button type="submit" variant="solid" size="lg" className="w-full" disabled={isPending}>
            {isPending && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            Sign in
          </Button>
        </form>

        <p className="mt-8 flex flex-wrap justify-between gap-x-6 gap-y-2">
          <Link href="/auth/signup" className="meta-strong underline-offset-4 hover:underline">
            New here? Create an account
          </Link>
          <Link href="/" className="meta-strong underline-offset-4 hover:underline">
            Back to Front Left
          </Link>
        </p>
      </div>
    </div>
  );
}
