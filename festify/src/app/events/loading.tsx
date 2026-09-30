import { Skeleton } from "@/components/ui/Skeleton";

export default function EventsLoading() {
  return (
    <div className="page pb-16 pt-10 sm:pt-14">
      <div className="border-b border-line pb-6">
        <Skeleton className="h-16 w-64 sm:h-24 sm:w-96" />
      </div>
      <Skeleton className="mt-6 h-11 w-full" />
      <div className="mt-8 space-y-px">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[4.75rem] w-full" />
        ))}
      </div>
    </div>
  );
}
