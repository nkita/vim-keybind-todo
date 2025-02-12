'use client'
import React, { Dispatch, SetStateAction, useEffect, useState, useContext } from "react"
import { TodoProps, Sort, Mode, ProjectProps, LabelProps } from "@/types"
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { Table, TableRow, TableBody, TableCell } from "../ui/table"
import { TodoContext } from "@/provider/todo";
import { postSaveLabels, postSaveProjects } from "@/lib/todo"
import { TodoListRow } from "./list-row"
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export const List = (
    {
        filteredTodos,
        currentIndex,
        prefix,
        mode,
        exProjects,
        exLabels,
        currentProjectId,
        sort,
        loading,
        onClick,
        setIsComposing,
        setCurrentIndex,
        setExProjects,
        setExLabels,
        register,
        rhfSetValue,
    }: {
        filteredTodos: TodoProps[]
        currentIndex: number
        prefix: string
        mode: Mode
        exProjects: ProjectProps[]
        exLabels: LabelProps[]
        currentProjectId: string
        sort: Sort
        loading: Boolean
        onClick: (id: number, prefix: string) => void
        setIsComposing: Dispatch<SetStateAction<boolean>>
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

    const table_idx_width = "w-[30px]"
    const table_completion_width = "w-[30px]"
    const table_priority_width = "w-[30px]"
    const table_label_width = "w-0 sm:w-[15%] max-w-[20%]"
    // const table_project_width = "w-0 sm:w-[15%] max-w-[20%]"


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
        <Table className={`w-full overflow-x-hidden sm:overflow-x-auto ${loading && "hidden"}  ${hcssMainHeight} table-scrollbar`} index={currentIndex}>
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
                        {filteredTodos.length === 0 ? (
                            <TableRow className="text-center  text-muted-foreground text-xs">
                                <TableCell className="p-2 border-none"><kbd>I</kbd>（ <kbd>Shift</kbd>+<kbd>i</kbd> ）で初めてのタスクを追加しましょう。</TableCell>
                            </TableRow>
                        ) : (
                            <>
                                <SortableContext items={filteredTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
                                    {
                                        filteredTodos.map((t, index) => {
                                            let nextTabIndent = 0
                                            const nextIndex = index + 1
                                            if (filteredTodos && filteredTodos.length > nextIndex && filteredTodos[nextIndex]) {
                                                nextTabIndent = filteredTodos[nextIndex].indent ?? 0
                                            }
                                            const common_color_css = `
                                                        ${t.is_complete
                                                    ? "bg-muted text-muted-foreground/40 focus-within:text-muted-foreground/60"
                                                    : mode === "select" && currentIndex === index
                                                        ? "bg-todo-accent font-semibold"
                                                        : mode === "edit" && currentIndex === index
                                                            ? "bg-card"
                                                            : mode !== "select" && mode !== "edit" && currentIndex === index
                                                                ? "bg-sky-100 text-todo-accent-foreground"
                                                                : "bg-card"
                                                }
                                                    `
                                            return (
                                                <TodoListRow
                                                    key={t.id}
                                                    t={t}
                                                    index={index}
                                                    currentIndex={currentIndex}
                                                    nextTabIndent={nextTabIndent}
                                                    prefix={prefix}
                                                    mode={mode}
                                                    currentProjectId={currentProjectId}
                                                    exLabels={exLabels}
                                                    exProjects={exProjects}
                                                    onClick={onClick}
                                                    setCurrentIndex={setCurrentIndex}
                                                    common_color_css={common_color_css}
                                                    register={register}
                                                    rhfSetValue={rhfSetValue}
                                                    saveNewLabels={saveNewLabels}
                                                    saveNewProject={saveNewProject}
                                                    table_idx_width={table_idx_width}
                                                    setIsComposing={setIsComposing}
                                                    table_completion_width={table_completion_width}
                                                    table_task_width={table_task_width}
                                                />
                                            )
                                        })
                                    }
                                </SortableContext>
                            </>
                        )}
                    </>
                }
            </TableBody>
        </Table>
    )
}