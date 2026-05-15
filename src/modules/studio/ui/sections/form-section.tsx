"use client"

import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { z } from "zod";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

import {
    Form,
    FormControl,
    FormField,
    FormLabel,
    FormMessage,
    FormItem
} from "@/components/ui/form"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

import { MoreVerticalIcon, TrashIcon } from "lucide-react";
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { videoUpdateSchema } from "@/db/schema";


interface FormSectionProps {
    videoId: string;
}

export const FormSection = ({ videoId }: FormSectionProps) => {
    return (
        <Suspense fallback={<FormSectionSkeleton />}>
            <ErrorBoundary fallback={<p>Error</p>}>
                <FormSectionSuspense videoId={videoId} />
            </ErrorBoundary>
        </Suspense>
    )
}

const FormSectionSkeleton = () => {
    return <p>Loading ...</p>;
}

export const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
    const [video] = trpc.studio.getOne.useSuspenseQuery({
        id: videoId
    })

    const form = useForm<z.infer<typeof videoUpdateSchema>>({
        resolver: zodResolver(videoUpdateSchema),
        defaultValues: video
    });

    const onSubmit = async (data: z.infer<typeof videoUpdateSchema>) => {
        console.log('check val data: ', data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Video details</h1>
                        <p className="text-xs text-muted-foreground">Manage your video details</p>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <Button type="submit" disabled={false} >
                            Save
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVerticalIcon />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <TrashIcon className="size-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="space-y-8 lg:col-span-3">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Title
                                        {/* TODO: add AI generate button */}
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Add a title to your video"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Description
                                        {/* TODO: add AI generate button */}
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            value={field.value ?? ""}
                                            rows={10}
                                            className="resize-none pr-10"
                                            placeholder="Add a description to your video"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Add thumbnail field here */}
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Category
                                    </FormLabel>
                                    <FormControl>

                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </form>
        </Form>
    )
} 