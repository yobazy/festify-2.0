import { Skeleton } from "@/components/ui/Skeleton";

export default function EventDetailLoading() {
  return (
    <>
      <Skeleton className="h-[70svh] w-full" />

      <div className="page py-14">
        <Skeleton className="h-8 w-40" />
        <div className="mt-12 flex flex-col items-center gap-4">
          <Skeleton className="h-14 w-3/4 max-w-2xl" />
          <Skeleton className="h-8 w-2/3 max-w-xl" />
          <Skeleton className="h-4 w-1/2 max-w-md" />
        </div>
      </div>

      <div className="page py-14">
        <Skeleton className="h-8 w-32" />
        <div className="scrollbar-hide mt-8 tile-strip overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-36 shrink-0 sm:w-40" />
          ))}
        </div>
      </div>
    </>
  );
}
