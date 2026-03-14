import { Skeleton } from "@/components/ui/Skeleton";

export default function ArtistDetailLoading() {
  return (
    <div className="pt-32 pb-16 px-4">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <Skeleton className="w-56 h-56 rounded-full mb-6" />
        <Skeleton className="h-12 w-64 mb-4" />
        <div className="flex gap-2 mb-6">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>
    </div>
  );
}
