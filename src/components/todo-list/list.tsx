'use client'
import React, { Dispatch, SetStateAction, useEffect, useState, useContext } from "react"
import { TodoProps, Sort, Mode, ProjectProps, LabelProps } from "@/types"
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { TodoContext } from "@/provider/todo";
import { postSaveLabels, postSaveProjects } from "@/lib/todo"
import { TodoListRow } from "./list-row"
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TableView as Table, TableViewBody as TableBody, TableViewRow as TableRow, TableViewCell as TableCell } from "@/components/ui/table-view";

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
        displayMode,
        onClick,
        setIsComposing,
        setCurrentIndex,
        setExProjects,
        setExLabels,
        register,
        rhfSetValue,
        onChangePeriod,
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
        displayMode?: string
        onClick: (id: number, prefix: string) => void
        setIsComposing: Dispatch<SetStateAction<boolean>>
        setCurrentIndex: Dispatch<SetStateAction<number>>
        setExProjects: Dispatch<SetStateAction<ProjectProps[]>>
        setExLabels: Dispatch<SetStateAction<LabelProps[]>>
        register: UseFormRegister<FieldValues>
        rhfSetValue: UseFormSetValue<FieldValues>
        onChangePeriod?: (todoId: string, startDate: Date, endDate: Date) => void
    }
) => {

    const config = useContext(TodoContext)
    const [table_task_width, set_table_task_width] = useState("w-[calc(100%-90px)] sm:w-[calc(70%-90px)]")


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
        const wTaskALL = "w-[calc(100%-90px)] sm:w-[calc(70%-90px)]"
        const wTaskProject = "w-[calc(100%-90px)] sm:w-[calc(85%-90px)]"

        set_table_task_width(currentProjectId === "" ? wTaskALL : wTaskProject)
    }, [currentProjectId])
    return (
        <Table>
            <TableBody className="text-sm">
                {loading &&
                    <TableRow className={`bg-accent text-accent-foreground font-semibold text-center`}>
                        <TableCell className="h-full">Loading...</TableCell>
                    </TableRow>
                }
                {!loading &&
                    <>
                        {filteredTodos.length === 0 ? (
                            <>
                                <TableRow className="text-center text-muted-foreground text-xs border-none">
                                    <TableCell className="p-4 w-full"><kbd>I</kbd>（ <kbd>Shift</kbd>+<kbd>i</kbd> ）で初めてのタスクを追加しましょう。</TableCell>
                                </TableRow>
                            </>
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
                                                    onChangePeriod={onChangePeriod}
                                                    common_color_css={common_color_css}
                                                    register={register}
                                                    rhfSetValue={rhfSetValue}
                                                    saveNewLabels={saveNewLabels}
                                                    saveNewProject={saveNewProject}
                                                    setIsComposing={setIsComposing}
                                                    table_task_width={table_task_width}
                                                    displayMode={displayMode}
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