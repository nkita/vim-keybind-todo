'use client'
import React, { Dispatch, SetStateAction, useEffect, useState, useContext } from "react"
import { TodoProps, Sort, Mode, ProjectProps, LabelProps } from "@/types"
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { Table, TableRow, TableBody, TableCell } from "./ui/table"
import { TodoContext } from "@/provider/todo";
import { postSaveLabels, postSaveProjects } from "@/lib/todo"
import { TodoListRow } from "./todo-list-row"
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

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
        setIsComposing,
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
                                        <SortableContext items={filterdTodos.map(t => t.id)} strategy={verticalListSortingStrategy}>
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
                <div className={`hidden sm:block  bg-card text-accent-foreground rounded-b-sm`} />
            </div >
        </>
    )
}