import { SectionHead } from "@/components/ui/SectionHead";
import { PosterBilling } from "./PosterBilling";
import type { Artist } from "@/types/artist";

interface TheBillProps {
  artists: Artist[];
}

/** The lineup typeset like the poster it came from. */
export function TheBill({ artists }: TheBillProps) {
  const count = artists.length;

  return (
    <section className="border-y border-line">
      <div className="page py-14">
        {count === 0 ? (
          <>
            <h2 className="display text-3xl text-paper">Lineup TBA</h2>
            <p className="mt-2 text-sm text-smoke">
              Nothing announced yet. Save the event and check back.
            </p>
          </>
        ) : (
          <>
            <SectionHead
              title="The bill"
              note={`${count} on the bill, biggest names first`}
            />
            <PosterBilling artists={artists} className="mt-12 sm:mt-16" />
          </>
        )}
      </div>
    </section>
  );
}
