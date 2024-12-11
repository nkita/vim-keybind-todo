'use client'

import Header from "@/components/header";
import { Cross1Icon, CrossCircledIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUploader } from "@/components/image-uploader"
import AppPageTemplate from "@/components/app-page-template";

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

export default function Setting() {

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
    <>
      <AppPageTemplate>
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
      </AppPageTemplate>
    </>
  );
}
