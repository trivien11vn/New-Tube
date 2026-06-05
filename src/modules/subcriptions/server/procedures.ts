import { db } from "@/db";
import { subcriptions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";

export const subscriptionsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(z.object({ userId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
            const { userId } = input;

            if (userId === ctx.user.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST"
                })
            }

            const [createdSubscription] = await db
                .insert(subcriptions)
                .values({
                    viewerId: ctx.user.id,
                    creatorId: userId
                })
                .returning()

            return createdSubscription;
        }),

    remove: protectedProcedure
        .input(z.object({ userId: z.string().uuid() }))
        .mutation(async ({ input, ctx }) => {
            const { userId } = input;

            if (userId === ctx.user.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST"
                })
            }

            const [deletedSubscription] = await db
                .delete(subcriptions)
                .where(
                    and(
                        eq(subcriptions.viewerId, ctx.user.id),
                        eq(subcriptions.creatorId, userId)
                    )
                )
                .returning()

            return deletedSubscription;
        }),
})