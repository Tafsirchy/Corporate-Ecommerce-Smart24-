import { Skeleton } from "@/components/ui/skeleton";

export const ProductSkeleton = ({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) => {
  return (
    <div className={`group relative flex bg-white rounded-xl border border-border overflow-hidden h-full ${viewMode === 'list' ? 'flex-row items-stretch' : 'flex-col'}`}>
      
      {/* Image Skeleton */}
      <Skeleton className={`rounded-none ${viewMode === 'list' ? 'w-48 md:w-64 shrink-0' : 'aspect-[5/4] w-full'}`} />
      
      {/* Details Skeleton */}
      <div className={`p-2.5 flex flex-col flex-1 gap-3 ${viewMode === 'list' ? 'p-4 sm:p-6' : ''}`}>
        
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[60%]" />
        </div>
        
        {/* Spacer */}
        <div className="mt-auto flex flex-col gap-3">
          
          {/* Price & Button */}
          <div className="flex justify-between items-end">
            <div className="flex flex-col gap-1.5 w-[50%]">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-3 w-[70%]" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>

          {/* Stats Row */}
          <div className="flex justify-between items-center border-t border-gray-50 pt-2">
            <Skeleton className="h-3 w-[40%]" />
            <Skeleton className="h-3 w-[30%]" />
          </div>

        </div>
      </div>
    </div>
  );
};

export const OfferSliderSkeleton = () => {
  return (
    <section className="py-6 bg-muted overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[350px] items-stretch">
          {/* Left Side: Carousel */}
          <Skeleton className="w-full lg:w-[78%] h-[300px] lg:h-full rounded-none" />
          
          {/* Right Side: Sidebar */}
          <Skeleton className="w-full lg:w-[22%] h-full rounded-none" />
        </div>
      </div>
    </section>
  );
};
