import { Skeleton } from "@/components/ui/Skeleton";

export default function ArtistDetailLoading() {
  return (
    <>
      <div className="relative min-h-[72svh] border-b border-line bg-ink-2">
        <div className="page absolute inset-x-0 bottom-0 pb-10 sm:pb-14">
          <Skeleton className="h-3 w-48" />
          <Skeleton className="mt-6 h-16 w-72 sm:h-28 sm:w-[32rem]" />
          <Skeleton className="mt-8 h-10 w-28" />
        </div>
      </div>

      <div className="page">
        <section className="py-14">
          <div className="rule pt-3">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="mt-3 h-3 w-72" />
          </div>
          <div className="mt-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-b border-line py-3">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        </section>

        <section className="py-14">
          <div className="rule pt-3">
            <Skeleton className="h-8 w-40" />
          </div>
          <div className="mt-6 tile-grid grid-cols-2  md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-ink">
                <Skeleton className="aspect-square w-full" />
                <div className="p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
