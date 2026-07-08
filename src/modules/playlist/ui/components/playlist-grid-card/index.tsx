import { PlaylistGetManyOutput } from "@/modules/playlist/type";
import { PlaylistInfo, PlaylistInfoSkeleton } from "@/modules/playlist/ui/components/playlist-grid-card/playlist-info";
import { PlaylistThumbnail, PlaylistThumbnailSkeleton } from "@/modules/playlist/ui/components/playlist-grid-card/playlist-thumbnail";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import Link from "next/link";

interface PlaylistGridCardProps {
    data: PlaylistGetManyOutput["items"][number]
}

export const PlaylistGridCard = ({
    data
}: PlaylistGridCardProps) => {
    return (
        <Link href={`/playlists/${data.id}`}>
            <div className="flex flex-col gap-2 w-full group">
                <PlaylistThumbnail
                    imageUrl={data.thumbnailUrl || THUMBNAIL_FALLBACK}
                    title={data.name}
                    videoCount={data.videoCount}
                />
                <PlaylistInfo data={data} />
            </div>
        </Link>
    )
}

export const PlaylistGridCardSkeleton = () => {
    return (
        <div className="flex flex-col gap-2 w-full">
            <PlaylistThumbnailSkeleton />
            <PlaylistInfoSkeleton />
        </div>
    )
}