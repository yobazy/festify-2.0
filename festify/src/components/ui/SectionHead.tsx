import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeadProps {
  title: string;
  /** One plain sentence under the title, when the title alone isn't enough. */
  note?: string;
  /** Link on the right, e.g. { href: "/events", label: "All listings" }. */
  aside?: { href: string; label: string };
  className?: string;
  as?: "h1" | "h2" | "h3";
}

/** Section heading on a hairline rule: title left, optional link right. */
export function SectionHead({
  title,
  note,
  aside,
  className,
  as: Heading = "h2",
}: SectionHeadProps) {
  return (
    <div className={cn("rule flex items-end justify-between gap-6 pt-3", className)}>
      <div>
        <Heading className="display text-2xl sm:text-3xl">{title}</Heading>
        {note && <p className="mt-2 max-w-xl text-sm text-smoke">{note}</p>}
      </div>
      {aside && (
        <Link
          href={aside.href}
          className="meta-strong shrink-0 underline-offset-4 hover:underline"
        >
          {aside.label}
        </Link>
      )}
    </div>
  );
}
