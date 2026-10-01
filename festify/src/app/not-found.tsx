import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page flex min-h-[70svh] flex-col justify-center">
      <h1 className="display text-5xl text-paper sm:text-7xl">Wrong room.</h1>
      <p className="mt-4 max-w-md text-sm text-smoke">
        That page isn&apos;t on the bill. It moved, or someone gave you the wrong set times.
      </p>
      <div className="mt-8 flex items-center gap-6">
        <Link href="/events" className="meta-strong underline-offset-4 hover:underline">
          Shows
        </Link>
        <Link href="/" className="meta-strong underline-offset-4 hover:underline">
          Front page
        </Link>
      </div>
    </div>
  );
}
