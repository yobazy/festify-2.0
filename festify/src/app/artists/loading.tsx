import { Skeleton } from "@/components/ui/Skeleton";

export default function ArtistsLoading() {
  return (
    <div className="page pb-16 pt-10 sm:pt-14">
      <div className="border-b border-line pb-6">
        <Skeleton className="h-16 w-56 sm:h-24 sm:w-80" />
      </div>
      <Skeleton className="mt-6 h-11 w-full" />
      <div className="mt-8 tile-grid grid-cols-2  sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-ink">
            <Skeleton className="aspect-square w-full" />
            <div className="p-3 pb-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
