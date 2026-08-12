import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 relative min-h-[60vh]">
      
      {/* Grid of Skeletons for Layout Context */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 opacity-30 pointer-events-none">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="flex flex-col gap-3">
            <Skeleton className="aspect-square w-full rounded-md" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>

      {/* Centered Bouncing Balls */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-bounce rounded-full bg-primary-600 [animation-delay:-0.3s]"></div>
          <div className="h-4 w-4 animate-bounce rounded-full bg-primary-600 [animation-delay:-0.15s]"></div>
          <div className="h-4 w-4 animate-bounce rounded-full bg-primary-600"></div>
        </div>
        <p className="text-sm font-medium text-primary-900 animate-pulse bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm">
          Loading content...
        </p>
      </div>
    </div>
  );
}
