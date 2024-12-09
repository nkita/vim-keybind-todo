import { TodoProps, Mode } from "@/types"
import { Modal } from "./ui/modal"
import { DynamicSearchSelect } from "./ui/combobox-dynamic"
import { MouseEventHandler, useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { max } from "lodash"
import { ImageUploader } from "./image-uploader"

const formSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    userid: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    profile: z.string()
        .min(2, {
            message: "Username must be at least 2 characters.",
        })
        .max(100, {
            message: "100文字以上は入力できません。",
        }),
    link: z.string().min(2, {
        message: "Username must be at least 2 characters.",
    }),
    link2: z.string().min(2, {
        message: "",
    }),
})

export const ProfileEditModal = (
    {
        buttonLabel,
        dialogTitle,
        className,
    }: {
        buttonLabel?: string
        dialogTitle?: string
        className?: string
    }) => {

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
        },
    })
    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }
    return (
        <Modal
            buttonLabel={buttonLabel}
            dialogTitle={dialogTitle}
            className={className}
            onClickOpen={() => { }}
            onClickChange={() => { }}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <ImageUploader
                        onUpload={async (file) => { }}
                        maxSizeMB={1}
                    />
                    <FormField
                        control={form.control}
                        name="userid"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ユーザーID</FormLabel>
                                <FormControl>
                                    <Input id="username" placeholder="ユーザーIDを入力" {...field} />
                                </FormControl>
                                <FormDescription>
                                    あなたのユーザーIDを指定します。一度設定したら変更できません。
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ユーザー名</FormLabel>
                                <FormControl>
                                    <Input id="username" placeholder="ユーザー名を入力" {...field} />
                                </FormControl>
                                <FormDescription>
                                    あなたのユーザー表示名を指定します。いつでも変更可能です。
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="profile"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>プロフィール</FormLabel>
                                <FormControl>
                                    <Textarea id="profile" placeholder="プロフィールを入力" {...field} />
                                </FormControl>
                                <FormDescription>
                                    プロフィールを入力します。最大100文字まで入力できます。
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="w-full flex justify-end">
                        <Button type="submit">保存</Button>
                    </div>
                </form>
            </Form>
        </Modal>
    )
}