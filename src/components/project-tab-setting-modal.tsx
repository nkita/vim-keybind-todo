import { Modal } from "./ui/modal"
import { Button } from "./ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Input } from "./ui/input"
import { Mode, ProjectProps } from "@/types"
import { useEffect, useState, useContext } from "react"
import { TodoContext } from "@/provider/todo";
import { postSaveProjects } from "@/lib/todo"

const formSchema = z.object({
    project: z.string().min(1, { message: "空白では登録できません。" }),
})

export const ProjectTabSettingModal = (
    {
        buttonLabel,
        dialogTitle,
        className,
        mode,
        exProjects,
        setMode,
        setExProjects
    }: {
        buttonLabel?: any
        dialogTitle?: string
        className?: string
        mode: Mode
        exProjects: ProjectProps[]
        setMode: React.Dispatch<React.SetStateAction<Mode>>
        setExProjects: React.Dispatch<React.SetStateAction<ProjectProps[]>>
    }) => {

    const config = useContext(TodoContext)
    const [open, setOpen] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            project: ""
        }
    })
    useEffect(() => {
        if (mode === "editProjectTab" && !open) {
            form.reset()
            setOpen(true)
        }
    }, [mode, form, open])


    function onSubmit(values: z.infer<typeof formSchema>) {
        const _project = { id: self.crypto.randomUUID(), name: values.project, isPublic: false, isTabDisplay: true, sort: exProjects.length }
        if (config.list && config.token) {
            postSaveProjects(
                [...exProjects, _project],
                config.list,
                config.token
            )
        }

        setExProjects([...exProjects, _project])
        setMode("normal")
        setOpen(false)
    }
    const handleOpenProject = () => {
        form.reset()
        setMode("editProjectTab")
        setOpen(true)
    }
    const handleCloseProject = (flg: boolean) => {
        if (!flg) {
            setMode("normal")
            setOpen(false)
        }
    }
    return (
        <Modal
            buttonLabel={buttonLabel}
            dialogTitle={"プロジェクト管理"}
            className={className}
            open={open}
            onClickOpen={handleOpenProject}
            onClickChange={handleCloseProject}>
            <div className="h-[calc(100vh-200px)] overflow-auto p-3">

                {/* <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {exProjects && exProjects.map(p => {
                            return (
                                <FormField
                                    key={p.id}
                                    control={form.control}
                                    name={p.id}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input id="name" placeholder="プロジェクト名を入力" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )
                        })}
                        <div className="w-full flex justify-end">
                            <Button type="submit">追加</Button>
                        </div>
                    </form>
                </Form> */}
            </div>
        </Modal>
    )
}