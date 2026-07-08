import { HistoryVideosSection } from "@/modules/playlist/ui/sections/history-videos-section";
import { PlaylistHeaderSection } from "@/modules/playlist/ui/sections/playlist-header-section";

interface VideosViewProps {
    playlistId: string;
}

export const VideosView = ({ playlistId }: VideosViewProps) => {
    return (
        <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
            <PlaylistHeaderSection playlistId={playlistId} />
            <HistoryVideosSection />
        </div>
    )
}