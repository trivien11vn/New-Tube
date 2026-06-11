import { UserAvatar } from "@/components/user-avatar";
import { CommentsGetManyOutput } from "@/modules/comments/type";
import { trpc } from "@/trpc/client";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { MessageSquareIcon, MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { toast } from "sonner";

interface CommentItemProps {
    comment: CommentsGetManyOutput['items'][number]
}

export const CommentItem = ({ comment }: CommentItemProps) => {
    const { userId } = useAuth();
    const clerk = useClerk();
    const utils = trpc.useUtils();

    const remove = trpc.comments.remove.useMutation({
        onSuccess: () => {
            toast.success("Comment deleted");
            utils.comments.getMany.invalidate({
                videoId: comment.videoId
            })
        },
        onError: (error) => {
            toast.error("Something went wrong")

            if (error.data?.code === "UNAUTHORIZED") {
                clerk.openSignIn();
            }
        }
    });

    return (
        <div className="flex gap-4">
            <Link href={`/users/${comment.userId}`}>
                <UserAvatar
                    size="lg"
                    imageUrl={comment.user.imageUrl || "/user-placeholder.svg"}
                    name={comment.user.name || "user"}
                />
            </Link>
            <div className="flex-1 min-w-0">
                <Link href={`/users/${comment.userId}`}>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm pb-0.5">
                            {comment.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(comment.createdAt, {
                                addSuffix: true
                            })}
                        </span>
                    </div>
                </Link>
                <p className="text-sm">{comment.value}</p>
                {/* TODO: Reactions */}
            </div>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon" className="size-8">
                        <MoreVerticalIcon />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { }}>
                        <MessageSquareIcon className="size-4" />
                        Reply
                    </DropdownMenuItem>
                    {
                        comment.user.clerkId === userId && (
                            <DropdownMenuItem onClick={() => { remove.mutate({ id: comment.id }) }}>
                                <Trash2Icon className="size-4" />
                                Delete
                            </DropdownMenuItem>
                        )
                    }
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}