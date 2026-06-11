"use client";

import { DEFAULT_LIMIT } from "@/constants";
import { VideoRowCard } from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";

interface SuggestionsSectionProps {
    videoId: string;
}

export const SuggestionsSection = ({ videoId }: SuggestionsSectionProps) => {
    const [suggestions] = trpc.suggestions.getMany.useSuspenseInfiniteQuery({
        videoId,
        limit: DEFAULT_LIMIT
    }, {
        getNextPageParam: (lastPage) => lastPage.nextCursor
    })

    return (
        <div>
            {
                suggestions.pages.flatMap((page) => page.items.map((video) => (
                    <VideoRowCard
                        key={video.id}
                        data={video}
                        size="default"
                    />
                )))
            }
        </div>
    )
}