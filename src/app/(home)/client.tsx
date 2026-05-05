"use client"

import { trpc } from "@/trpc/client"

export const PageClient = () => {

    const [data] = trpc.hello.useSuspenseQuery({
        text: "NHTV"
    })
    return (
        <div>
            Page Client say: {data.greeting}
        </div>
    )
}