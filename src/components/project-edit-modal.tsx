import { Modal } from "./ui/modal"
import { Button } from "./ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { ImageUploader } from "./image-uploader"
import { Mode } from "@/types"

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

export const ProjectEditModal = (
    {
        buttonLabel,
        dialogTitle,
        className,
        setMode,
    }: {
        buttonLabel?: any
        dialogTitle?: string
        className?: string
        setMode: React.Dispatch<React.SetStateAction<Mode>>
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
    const handleOpenProject = () => {
        setMode("modal")
    }
    const handleCloseProject = (flg: boolean) => {
        if (!flg) setMode("normal")
    }
    return (
        <Modal
            buttonLabel={buttonLabel}
            dialogTitle={dialogTitle}
            className={className}
            onClickOpen={handleOpenProject}
            onClickChange={handleCloseProject}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="profile"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>新規プロジェクトの追加</FormLabel>
                                <FormControl>
                                    <Input id="project" placeholder="プロジェクト名を追加" {...field} />
                                </FormControl>
                                <FormDescription>
                                    プロフィールを入力します。最大100文字まで入力できます。
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="w-full flex justify-end">
                        <Button type="submit">追加</Button>
                    </div>
                </form>
            </Form>
        </Modal>
    )
}