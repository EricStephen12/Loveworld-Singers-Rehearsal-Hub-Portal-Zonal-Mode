export default function MediaCardSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {/* Thumbnail Skeleton */}
            <div className="relative w-full aspect-video rounded-xl bg-[#272727] animate-pulse overflow-hidden" />

            <div className="flex gap-3 px-1">
                {/* Avatar Skeleton */}
                <div className="w-9 h-9 rounded-full bg-[#272727] animate-pulse flex-shrink-0" />

                <div className="flex-1 flex flex-col gap-2">
                    {/* Title Skeleton */}
                    <div className="h-4 bg-[#272727] rounded animate-pulse w-[90%]" />
                    <div className="h-4 bg-[#272727] rounded animate-pulse w-[60%]" />

                    {/* Meta Skeleton */}
                    <div className="h-3 bg-[#272727] rounded animate-pulse w-[40%] mt-1" />
                </div>
            </div>
        </div>
    )
}
