import { Skeleton } from "@/components/ui/Skeleton";

export default function EventDetailLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <Skeleton className="h-[60vh] w-full rounded-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Playlists skeleton */}
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="flex gap-4 overflow-hidden mb-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-44 h-44 rounded-xl shrink-0" />
          ))}
        </div>

        {/* Lineup skeleton */}
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-36 rounded-full" />
          ))}
        </div>
      </div>
    </>
  );
}
