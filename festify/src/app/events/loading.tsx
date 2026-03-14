import { Skeleton } from "@/components/ui/Skeleton";

export default function EventsLoading() {
  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <Skeleton className="h-12 w-48 mb-2" />
        <Skeleton className="h-5 w-80 mb-8" />

        {/* Filter bar skeleton */}
        <Skeleton className="h-16 w-full mb-8 rounded-2xl" />

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
