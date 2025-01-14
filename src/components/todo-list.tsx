'use client'
import React, { Dispatch, SetStateAction, useEffect, useState, useContext } from "react"
import { TodoProps, Sort, Mode, ProjectProps, LabelProps } from "@/types"
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { Table, TableRow, TableBody, TableCell } from "./ui/table"
import { FaRegCircle, FaCircleCheck } from "react-icons/fa6";
import { SelectModal } from "./select-modal"
import { Text } from "./todo-list-text"
import { Box, ChevronsUpDown, MessageCircleMore, Star, StickyNote, Tag } from "lucide-react"
import { find as lfind } from "lodash"
import { TodoContext } from "@/provider/todo";
import { postSaveLabels, postSaveProjects } from "@/lib/todo"
import { Button } from "./ui/button"

export const TodoList = (
    {
        filterdTodos,
        currentIndex,
        prefix,
        mode,
        exProjects,
        exLabels,
        currentProjectId,
        sort,
        loading,
        onClick,
        setCurrentIndex,
        setExProjects,
        setExLabels,
        register,
        rhfSetValue,
    }: {
        filterdTodos: TodoProps[]
        currentIndex: number
        prefix: string
        mode: Mode
        exProjects: ProjectProps[]
        exLabels: LabelProps[]
        currentProjectId: string
        sort: Sort
        loading: Boolean
        onClick: (id: number, prefix: string) => void
        setCurrentIndex: Dispatch<SetStateAction<number>>
        setExProjects: Dispatch<SetStateAction<ProjectProps[]>>
        setExLabels: Dispatch<SetStateAction<LabelProps[]>>
        register: UseFormRegister<FieldValues>
        rhfSetValue: UseFormSetValue<FieldValues>
    }
) => {

    const config = useContext(TodoContext)
    const [table_task_width, set_table_task_width] = useState("w-[calc(100%-90px)] sm:w-[calc(70%-90px)]")
    const [table_project_width, set_table_project_width] = useState("w-0 sm:w-[15%] max-w-[20%]")
    const hcssMainHeight = "h-[calc(100%-80px)] sm:h-full"
    const tableHeadHeight = "h-[40px]"
    const taskBarHeight = "h-[40px]"

    const table_idx_width = "w-[30px]"
    const table_completion_width = "w-[30px]"
    const table_priority_width = "w-[30px]"
    const table_label_width = "w-0 sm:w-[15%] max-w-[20%]"
    // const table_project_width = "w-0 sm:w-[15%] max-w-[20%]"

    const [touchMoveX, setTouchMoveX] = useState(0);
    const handleTouchMove = (event: React.TouchEvent) => setTouchMoveX(event.changedTouches[0].screenX);

    const handleTouchEnd = (index: number, prefix: string) => {
        // if (touchMoveX === 0) onClick(index, prefix)
        setTouchMoveX(0);
    };

    const saveNewProject = (id: string, name: string) => {
        const _project = { id: id, name: name, isPublic: false, isTabDisplay: true, sort: exProjects.length }
        if (config.list && config.token) {
            postSaveProjects(
                [...exProjects, _project],
                config.list,
                config.token
            )
        }
        setExProjects([...exProjects, _project])
    }

    const saveNewLabels = (id: string, name: string) => {
        const _labels = { id: id, name: name, isPublic: false, sort: exLabels.length }
        if (config.list && config.token) {
            postSaveLabels(
                [...exLabels, _labels],
                config.list,
                config.token
            )
        }
        setExLabels([...exLabels, _labels])
    }

    useEffect(() => {
        const hidden = "hidden"
        const wTaskALL = "w-[calc(100%-90px)] sm:w-[calc(70%-90px)]"
        const wTaskProject = "w-[calc(100%-90px)] sm:w-[calc(85%-90px)]"
        const wProject = "w-0 sm:w-[15%] max-w-[20%]"

        set_table_project_width(currentProjectId === "" ? wProject : hidden)
        set_table_task_width(currentProjectId === "" ? wTaskALL : wTaskProject)
    }, [currentProjectId])
    return (
        <>
            <div className="h-full ">
                {loading &&
                    <div className={`flex justify-center items-center w-full ${hcssMainHeight} bg-muted border-y-0 `}>
                        <div className="flex text-sm items-center justify-center h-full w-full ">
                            <span className="flex justify-center items-center px-10 py-5 font-semibold rounded-md bg-card text-card-foreground shadow-lg">
                                <span className="animate-bounce">Loading...</span>
                            </span>
                        </div>
                    </div>
                }
                <Table className={`w-full overflow-x-hidden sm:overflow-x-auto ${loading && "hidden"} ${hcssMainHeight} bg-muted table-scrollbar`} index={currentIndex}>
                    <TableBody className=" text-sm border-b">
                        {loading &&
                            <TableRow className={`bg-accent text-accent-foreground font-semibold text-center`}>
                                <TableCell className="h-full">Loading...</TableCell>
                            </TableRow>
                        }
                        {(sort !== undefined && mode === "editOnSort") &&
                            <TableRow className={`bg-accent text-accent-foreground`}>
                                <TableCell className={table_idx_width}></TableCell>
                                <TableCell className={table_completion_width}></TableCell>
                                <TableCell className={table_priority_width}></TableCell>
                                <TableCell className={table_task_width}>
                                    <input
                                        tabIndex={-1}
                                        className={`p-1 w-full text-left  outline-none bg-transparent font-semibold`}
                                        type="text"
                                        maxLength={prefix === 'priority' ? 1 : -1}
                                        {...register(`newtask`)}
                                    // onFocus={e => e.currentTarget.setSelectionRange(t[prefix].length, t.text.length)}
                                    />
                                </TableCell >
                                <TableCell className={table_project_width} ></TableCell>
                                <TableCell className={`${table_label_width} font-light text-lab text-ex-project`}>{currentProjectId}</TableCell>
                            </TableRow>
                        }
                        {!loading &&
                            <>
                                {filterdTodos.length === 0 ? (
                                    <TableRow className="text-center  text-muted-foreground text-xs">
                                        <TableCell className="p-2 border-none"><kbd>I</kbd>（ <kbd>Shift</kbd>+<kbd>i</kbd> ）で初めてのタスクを追加しましょう。</TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {
                                            filterdTodos.map((t, index) => {
                                                let nextTabIndent = 0
                                                const nextIndex = index + 1
                                                if (filterdTodos && filterdTodos.length > nextIndex && filterdTodos[nextIndex]) {
                                                    nextTabIndent = filterdTodos[nextIndex].indent ?? 0
                                                }
                                                const common_color_css = `
                                                    ${(mode !== "select" && mode !== "edit" && currentIndex === index) ? " bg-sky-100 text-todo-accent-foreground " : "bg-card"}
                                                    ${mode === "select" && currentIndex === index ? " font-semibold bg-todo-accent " : ""}
                                                    ${mode === "edit" && currentIndex === index ? " bg-card " : ""}
                                                    ${t.is_complete ? "bg-muted/10  text-muted-foreground/40 focus-within:text-muted-foreground/60" : ""} 
                                                `
                                                return (
                                                    <TableRow key={t.id}
                                                        className={`
                                                            h-[2.5rem]
                                                            ${common_color_css}
                                                    `} onClick={_ => setCurrentIndex(index)}>
                                                        <TableCell className={`
                                                             sticky left-0 
                                                             text-sm text-right 
                                                             z-10
                                                             p-0 m-0 ${table_idx_width}
                                                            `}>
                                                            <div className={` 
                                                                 pl-2 pr-1  h-[2.5rem] flex items-center
                                                                ${common_color_css}
                                                                `}>
                                                                {index + 1}
                                                            </div></TableCell>
                                                        <TableCell onClick={_ => onClick(index, 'completion')} className={`${table_completion_width} group hover:cursor-pointer`}>
                                                            <div className="flex w-ful justify-center">
                                                                {mode === "select" && currentIndex === index ? (
                                                                    <ChevronsUpDown className="text-primary h-3 w-3 group-hover:text-gray-300" />
                                                                ) : (
                                                                    <>
                                                                        {t.is_complete ? <FaCircleCheck className="text-primary group-hover:text-gray-300" /> : <FaRegCircle className="text-gray-500 group-hover:text-green-500" />}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell onDoubleClick={_ => onClick(index, 'text')} className={`${table_task_width} relative`}>
                                                            <div className="flex w-[calc(100%-20px)] sm:w-full h-full justify-between  items-center">
                                                                <span className="text-primary/90 flex text-md">
                                                                    {t.indent !== undefined &&
                                                                        <>
                                                                            {t.indent === 1 &&
                                                                                <>
                                                                                    {nextTabIndent === 0 && <span className="pl-2">└─</span>}
                                                                                    {nextTabIndent > 0 && <span className="pl-2">├─</span>}
                                                                                </>
                                                                            }
                                                                        </>
                                                                    }
                                                                </span>
                                                                {t.priority === "3" &&
                                                                    <>
                                                                        <Star className="w-3 h-3 text-destructive" strokeWidth={3} />
                                                                        <Star className="w-3 h-3 text-destructive" strokeWidth={3} />
                                                                    </>
                                                                }
                                                                {t.priority === "2" && <Star className="w-3 h-3 text-destructive" strokeWidth={3} />}
                                                                {t.priority === "1" && <Star className="w-3 h-3 text-primary" strokeWidth={3} />}
                                                                <div className=" w-full pr-2 sm:pr-0 flex items-center gap-1"
                                                                    onTouchMove={handleTouchMove}
                                                                    onTouchEnd={_ => handleTouchEnd(index, 'text')}>
                                                                    <Text
                                                                        t={t}
                                                                        index={index}
                                                                        currentIndex={currentIndex}
                                                                        currentPrefix={prefix}
                                                                        className={`
                                                                            ${t.priority === "1" && "text-primary"}
                                                                            ${t.priority === "2" && "text-destructive"}
                                                                            ${t.priority === "3" && "text-destructive font-semibold"}
                                                                            `}
                                                                        mode={mode}
                                                                        label={t.text}
                                                                        register={register} />
                                                                    {t.detail && !(mode === "edit" && currentIndex === index) &&
                                                                        <span className={`hidden sm:flex font-light  items-center text-5sm  text-primary p-1`}>
                                                                            <StickyNote className="h-3 w-3" />
                                                                        </span>
                                                                    }
                                                                    {t.labelId && !(mode === "edit" && currentIndex === index) &&
                                                                        <span className={`hidden sm:flex gap-1 font-light  items-center border border-ex-label rounded-full text-5sm px-2 text-ex-label`}>
                                                                            <Tag className="h-3 w-3" />
                                                                            {lfind(exLabels, { id: t.labelId })?.name}
                                                                        </span>
                                                                    }
                                                                    <SelectModal
                                                                        t={t}
                                                                        index={index}
                                                                        currentIndex={currentIndex}
                                                                        prefix={"labelId"}
                                                                        currentPrefix={prefix}
                                                                        mode={mode}
                                                                        className={`w-0`}
                                                                        register={register}
                                                                        rhfSetValue={rhfSetValue}
                                                                        item={lfind(exLabels, { id: t.labelId })}
                                                                        items={exLabels.map(l => { return { id: l.id, name: l.name } })}
                                                                        saveCloud={saveNewLabels}
                                                                        title={"ラベル"}
                                                                        onClick={onClick} />
                                                                    {!currentProjectId && t.projectId && !(mode === "edit" && currentIndex === index) &&
                                                                        <span className={`hidden sm:flex gap-1 font-light  items-center border border-ex-project rounded-full text-5sm px-2 text-ex-project`}>
                                                                            <Box className="h-3 w-3" />
                                                                            {lfind(exProjects, { id: t.projectId })?.name}
                                                                        </span>
                                                                    }
                                                                    <SelectModal
                                                                        t={t}
                                                                        index={index}
                                                                        currentIndex={currentIndex}
                                                                        prefix={"projectId"}
                                                                        currentPrefix={prefix}
                                                                        mode={mode}
                                                                        className={`w-0`}
                                                                        register={register}
                                                                        rhfSetValue={rhfSetValue}
                                                                        saveCloud={saveNewProject}
                                                                        item={lfind(exProjects, { id: t.projectId })}
                                                                        items={exProjects.map(p => { return { id: p.id, name: p.name } })}
                                                                        title={"プロジェクト"}
                                                                        onClick={onClick} />
                                                                </div>
                                                                <div className={`absolute right-0 flex sm:hidden items-center w-[90px] justify-end gap-1 px-2 h-full ${common_color_css}`}>
                                                                    {t.labelId && <span className="bg-ex-label text-ex-label rounded-full w-2 h-2" />}
                                                                    {t.projectId && <span className="bg-ex-project text-ex-project rounded-full w-2 h-2" />}
                                                                    <Button size={"sm"}
                                                                    className="text-xs h-7"
                                                                        onClick={e => {
                                                                            e.stopPropagation()
                                                                            e.preventDefault()
                                                                            onClick(index, 'editDetail')
                                                                        }}>編集</Button>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        }
                                    </>
                                )}
                            </>
                        }
                    </TableBody>
                </Table>
                <div className={`hidden sm:block  bg-card text-accent-foreground rounded-b-sm`} />
            </div >
        </>
    )
}