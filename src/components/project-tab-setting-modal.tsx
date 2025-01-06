import { Modal } from "./ui/modal"
import { Button } from "./ui/button"
import { useForm } from 'react-hook-form'
import { Input } from "./ui/input"
import { Mode, ProjectProps } from "@/types"
import { useEffect, useState, useContext } from "react"
import { TodoContext } from "@/provider/todo";
import { postSaveProjects } from "@/lib/todo"
import { Switch } from "./ui/switch"


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

    const form = useForm();

    useEffect(() => {
        if (mode === "editProjectTab" && open) {
            exProjects.forEach(project => {
                form.setValue(`projects-${project.id}-name`, project.name);
                form.setValue(`projects-${project.id}-isTabDisplay`, project.isTabDisplay);
            })
        }
    }, [mode, exProjects, form, open]);


    const handleSubmitButton = () => {
        if (!exProjects) return
        let _projects = exProjects.map((p: ProjectProps, i: number) => {
            p.name = form.getValues(`projects-${p.id}-name`)
            p.isTabDisplay = form.getValues(`projects-${p.id}-isTabDisplay`)
            p.sort = i
            return p
        })
        console.log(_projects)
        if (config.list && config.token) {
            postSaveProjects(
                _projects,
                config.list,
                config.token
            )
        }
        setExProjects(_projects)
        setMode("normal")
        setOpen(false)
    }

    const handleOpenProject = () => {
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
                                    onCheckedChange={(checked) => form.setValue(`projects-${p.id}-isTabDisplay`, checked)}
                                    {...form.register(`projects-${p.id}-isTabDisplay`, { value: p.isTabDisplay })}
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