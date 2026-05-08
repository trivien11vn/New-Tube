import { db } from "@/db";
import { videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const videosRouter = createTRPCRouter({
    create: protectedProcedure.mutation(async ({ ctx }) => {
        const { id: userId } = ctx.user;

        const upload = await mux.video.uploads.create({
            new_asset_settings: {
                passthrough: userId,
                playback_policy: ["public"]
            },
            cors_origin: "*" // TODO: In production, this should be the URL of your frontend application
        })

        const [video] = await db
            .insert(videos)
            .values({
                userId,
                title: "Untitled"
            })
            .returning();

        return {
            video: video,
            url: upload.url
        }
    })
})