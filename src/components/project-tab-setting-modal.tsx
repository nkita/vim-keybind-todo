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
import { Switch } from "./ui/switch"
import { get } from "lodash"


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

    const [open, setOpen] = useState(false)

    const form = useForm();

    useEffect(() => {
        if (mode === "editProjectTab" && !open) {
            form.reset({
                projects: exProjects.reduce((acc: Record<string, { name: string; isTabDisplay: boolean }>, project) => {
                    acc[project.id] = { name: project.name, isTabDisplay: project.isTabDisplay };
                    return acc;
                }, {}),
            });
            setOpen(true);
        }
    }, [mode, exProjects, form, open]);


    const handleSubmitButton = () => {
        setExProjects(prevProjects => prevProjects.map(project => {
            return {
                ...project,
                name: form.getValues(`projects-${project.id}-name`),
                isTabDisplay: form.getValues(`projects-${project.id}-isTabDisplay`) === "on"
            };
        }));
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
            dialogDescription="プロジェクトの名称の編集、画面上部のプロジェクトタブへの表示・非表示を切り替えます。"
            className={className}
            open={open}
            onClickOpen={handleOpenProject}
            onClickChange={handleCloseProject}>
            <div className="max-h-[calc(100vh-200px)]">
                <div className="h-[calc(100%-60px)] overflow-auto scroll-bar">
                    <div className="flex justify-end text-xs pb-2"><span>タブへ表示</span></div>
                    {exProjects && exProjects.map(p => {
                        return (
                            <div key={p.id} className="flex items-center justify-between gap-3 p-1">
                                <div className="flex items-center ">
                                    {p.sort + 1}
                                </div>
                                <Input
                                    className="w-full border-none hover:bg-muted"
                                    {...form.register(`projects-${p.id}-name`, { value: p.name })}
                                />
                                <Switch
                                    defaultChecked={p.isTabDisplay}
                                    onCheckedChange={(checked) => form.setValue(`projects-${p.id}-isTabDisplay`, checked ? "on" : "off")}
                                    {...form.register(`projects-${p.id}-isTabDisplay`)}
                                />
                            </div>
                        )
                    })}
                </div>
                <div className="flex justify-end items-end pt-2 h-[60px]">
                    <Button onClick={_ => handleSubmitButton()} >保存する</Button>
                </div>
            </div>
        </Modal >
    )
}