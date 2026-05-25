"use client";

import { cn } from "@/lib/utils";
import { VideoBanner } from "@/modules/videos/ui/components/video-banner";
import { VideoPlayer } from "@/modules/videos/ui/components/video-player";
import { VideoTopRow } from "@/modules/videos/ui/components/video-top-row";
import { trpc } from "@/trpc/client";
import { useAuth } from "@clerk/nextjs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface VideoSectionProps {
    videoId: string;
}

export const VideoSection = ({ videoId }: VideoSectionProps) => {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <VideoSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    )
}

const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
    console.log("check val videoId: ", videoId)

    const { isSignedIn } = useAuth();
    const utils = trpc.useUtils();

    const [video] = trpc.videos.getOne.useSuspenseQuery({
        id: videoId
    })

    const createView = trpc.videoViews.create.useMutation({
        onSuccess: () => {
            utils.videos.getOne.invalidate({
                id: videoId
            })
        }
    });

    const handlePlay = () => {
        if (!isSignedIn) return;

        createView.mutate({ videoId })
    }

    return (
        <>
            <div className={cn("aspect-video bg-black rounded-xl overflow-hidden relative",
                video.muxStatus !== 'ready' && "rounded-b-none"
            )}>
                <VideoPlayer
                    autoPlay
                    onPlay={handlePlay}
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                />
            </div>
            <VideoBanner
                status={video.muxStatus}
            />
            <VideoTopRow
                video={video}
            />
        </>
    )
}