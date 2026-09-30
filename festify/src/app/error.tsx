"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page flex min-h-[70svh] flex-col justify-center">
      <h1 className="display text-5xl text-paper sm:text-7xl">Couldn&apos;t load that.</h1>
      <p className="mt-4 max-w-md text-sm text-smoke">
        Something on our side. Try again, or go back to the shows.
      </p>
      <div className="mt-8 flex items-center gap-6">
        <Button onClick={reset}>Try again</Button>
        <Link href="/events" className="meta-strong underline-offset-4 hover:underline">
          Shows
        </Link>
      </div>
    </div>
  );
}
