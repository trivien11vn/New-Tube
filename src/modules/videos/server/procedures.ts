import { db } from "@/db";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const videosRouter = createTRPCRouter({
    create: protectedProcedure.mutation(async ({ ctx }) => {
        const { id: userId } = ctx.user;

        throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Not implemented"
        })
        const [video] = await db
            .insert(videos)
            .values({
                userId,
                title: "Untitled"
            })
            .returning();

        return {
            video: video
        }
    })
})