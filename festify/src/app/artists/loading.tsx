import { Skeleton } from "@/components/ui/Skeleton";

export default function ArtistsLoading() {
  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <Skeleton className="h-12 w-40 mb-2" />
        <Skeleton className="h-5 w-64 mb-8" />
        <Skeleton className="h-16 w-full mb-8 rounded-2xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
