"use client";

import { Separator } from "@/components/ui/separator";
import { UserPageBanner, UserPageBannerSkeleton } from "@/modules/users/ui/components/user-page-banner";
import { UserPageInfo, UserPageInfoSkeleton } from "@/modules/users/ui/components/user-page-info";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface UserSectionProps {
    userId: string;
}

export const UserSection = (props: UserSectionProps) => {
    return (
        <Suspense fallback={<UserSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <UserSectionSuspense {...props} />
            </ErrorBoundary>
        </Suspense>
    )
}

const UserSectionSuspense = ({ userId }: UserSectionProps) => {
    const [user] = trpc.users.getOne.useSuspenseQuery({ id: userId })

    return (
        <div className="flex flex-col">
            <UserPageBanner user={user} />
            <UserPageInfo user={user} />
            <Separator />
        </div>
    )
}

const UserSectionSkeleton = () => {
    return (
        <div className="flex flex-col">
            <UserPageBannerSkeleton />
            <UserPageInfoSkeleton />
            <Separator />
        </div>
    )
}