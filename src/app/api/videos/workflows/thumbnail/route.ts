import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { serve } from "@upstash/workflow/nextjs"

import { db } from "@/db";
import { videos } from "@/db/schema";

interface InputType {
    userId: string;
    videoId: string;
    prompt: string;
};

export const { POST } = serve(
    async (context) => {
        const utapi = new UTApi();
        const input = context.requestPayload as InputType;
        const { videoId, userId, prompt } = input;

        const video = await context.run("get-video", async () => {
            const [existingVideo] = await db
                .select()
                .from(videos)
                .where(and(
                    eq(videos.id, videoId),
                    eq(videos.userId, userId),
                ));

            if (!existingVideo) {
                throw new Error("Not found");
            }

            return existingVideo;
        });

        await context.run("cleanup-thumbnail", async () => {
            if (video.thumbnailKey) {
                await utapi.deleteFiles(video.thumbnailKey);
                await db
                    .update(videos)
                    .set({ thumbnailKey: null, thumbnailUrl: null })
                    .where(and(
                        eq(videos.id, videoId),
                        eq(videos.userId, userId),
                    ));
            }
        });

        const uploadedThumbnail = await context.run("generate-and-upload-thumbnail", async () => {
            // Call OpenAI API directly via fetch to avoid Upstash message size limit
            const response = await fetch("https://api.openai.com/v1/images/generations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                    prompt,
                    n: 1,
                    model: "gpt-image-1",
                    size: "1536x1024",
                }),
            });

            const result = await response.json() as { data?: { b64_json: string }[] };

            if (!response.ok || !result?.data?.[0]?.b64_json) {
                throw new Error(
                    `Failed to generate thumbnail. Status: ${response.status}. Response: ${JSON.stringify(result)}`
                );
            }

            // Convert base64 to File and upload to UploadThing
            const buffer = Buffer.from(result.data[0].b64_json, "base64");
            const file = new File([buffer], `thumbnail-${videoId}.png`, {
                type: "image/png",
            });
            const { data } = await utapi.uploadFiles(file);

            if (!data) {
                throw new Error("Failed to upload thumbnail");
            }

            return data;
        });

        await context.run("update-video", async () => {
            await db
                .update(videos)
                .set({
                    thumbnailKey: uploadedThumbnail.key,
                    thumbnailUrl: uploadedThumbnail.url,
                })
                .where(and(
                    eq(videos.id, video.id),
                    eq(videos.userId, video.userId),
                ))
        })
    }
);