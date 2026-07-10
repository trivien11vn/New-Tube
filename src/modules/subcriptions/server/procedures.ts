import { db } from "@/db";
import { subcriptions, users } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
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
    getMany: protectedProcedure
        .input(
            z.object({
                cursor: z.object({
                    creatorId: z.string().uuid(),
                    updatedAt: z.date()
                })
                    .nullish(),
                limit: z.number().min(1).max(100)
            })
        )
        .query(async ({ ctx, input }) => {
            const { cursor, limit } = input;
            const { id: userId } = ctx.user;

            const data = await db
                .select({
                    ...getTableColumns(subcriptions),
                    user: {
                        ...getTableColumns(users),
                        subscriberCount: db.$count(
                            subcriptions,
                            eq(subcriptions.creatorId, users.id)
                        )
                    }
                })
                .from(subcriptions)
                .innerJoin(users, eq(subcriptions.creatorId, users.id))
                .where(and(
                    eq(subcriptions.viewerId, userId),
                    cursor
                        ? or(
                            lt(subcriptions.updatedAt, cursor.updatedAt),
                            and(
                                eq(subcriptions.updatedAt, cursor.updatedAt),
                                lt(subcriptions.creatorId, cursor.creatorId)
                            )
                        )
                        : undefined
                ))
                .orderBy(
                    desc(subcriptions.updatedAt),
                    desc(subcriptions.creatorId)
                )
                // Add 1 to the limit to check if there is more data
                .limit(limit + 1)

            const hasMore = data.length > limit;

            const items = hasMore ? data.slice(0, -1) : data;

            // set the next cursor to the last item if there is more data
            const lastItem = items[items.length - 1];

            const nextCursor = hasMore ? {
                creatorId: lastItem.creatorId,
                updatedAt: lastItem.updatedAt
            } : null;

            return {
                items,
                nextCursor
            }
        }),
})