'use client'
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { Table, TableRow, TableBody, TableCell } from "./ui/table"
import { FaArrowUpZA, FaRegCircle, FaCircleCheck, FaTag } from "react-icons/fa6";
import { SelectModal } from "./select-modal"
import { Item } from "./todo-list-item"
import { Box, ChevronsUpDown, CircleCheck, MessageCircleMore, Move, MoveVertical, Star, StickyNote, Tag } from "lucide-react"

export const TodoList = (
    {
        filterdTodos,
        currentIndex,
        prefix,
        mode,
        viewCompletion,
        projects,
        labels,
        currentProject,
        sort,
        searchResultIndex,
        command,
        loading,
        completionOnly,
        onClick,
        setCurrentIndex,
        register,
        rhfSetValue,
    }: {
        filterdTodos: TodoProps[]
        currentIndex: number
        prefix: string
        mode: Mode
        viewCompletion: boolean
        projects: string[]
        labels: string[]
        currentProject: string
        sort: Sort
        searchResultIndex: boolean[]
        command: string
        loading: Boolean
        completionOnly?: boolean
        onClick: (id: number, prefix: string) => void
        setCurrentIndex: Dispatch<SetStateAction<number>>
        register: UseFormRegister<FieldValues>
        rhfSetValue: UseFormSetValue<FieldValues>
    }
) => {

    const [table_task_width, set_table_task_width] = useState("w-[calc(100%-90px)] sm:w-[calc(70%-90px)]")
    const [table_project_width, set_table_project_width] = useState("w-0 sm:w-[15%] max-w-[20%]")
    const hcssMainHeight = "h-[calc(100%-80px)] sm:h-[calc(100%-40px)]"
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
        if (touchMoveX === 0) onClick(index, prefix)
        setTouchMoveX(0);
    };

    useEffect(() => {
        const hidden = "hidden"
        const wTaskALL = "w-[calc(100%-90px)] sm:w-[calc(70%-90px)]"
        const wTaskProject = "w-[calc(100%-90px)] sm:w-[calc(85%-90px)]"
        const wProject = "w-0 sm:w-[15%] max-w-[20%]"

        set_table_project_width(currentProject === "" ? wProject : hidden)
        set_table_task_width(currentProject === "" ? wTaskALL : wTaskProject)
    }, [currentProject])
    return (
        <>
            <div className="h-full ">
                <div className={`flex text-xs truncate font-semibold gap-2 px-2 text-emerald-700 bg-emerald-300 border-b items-center ${tableHeadHeight}`}>
                    <span>No.</span>
                    <span>/</span>
                    <span><CircleCheck className="h-4 w-4" /></span>
                    <span>/</span>
                    <span>タスク</span>
                    <span>/</span>
                    <span className="flex items-center"><Tag className="h-3" />ラベル</span>
                    <span>/</span>
                    <span className="flex items-center"><Box className="h-3" />プロジェクト</span>
                </div>
                {loading &&
                    <div className={`flex justify-center items-center w-full ${hcssMainHeight} bg-muted border-y-0 `}>
                        <div className="flex text-sm items-center justify-center h-full w-full ">
                            <span className="flex justify-center items-center px-10 py-5 font-semibold rounded-md bg-card text-card-foreground shadow-lg">
                                <span className="animate-bounce">Loading...</span>
                            </span>
                        </div>
                    </div>
                }
                <Table className={`w-full  ${loading && "hidden"} ${hcssMainHeight} bg-transparent  table-scrollbar`} index={currentIndex}>
                    <TableBody className="bg-transparent text-card-foreground text-sm">
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
                                        className={`p-1 w-full text-left truncate outline-none bg-transparent font-semibold`}
                                        type="text"
                                        maxLength={prefix === 'priority' ? 1 : -1}
                                        {...register(`newtask`)}
                                    // onFocus={e => e.currentTarget.setSelectionRange(t[prefix].length, t.text.length)}
                                    />
                                </TableCell >
                                <TableCell className={table_project_width} ></TableCell>
                                <TableCell className={`${table_label_width} truncate font-light text-lab text-ex-project`}>{currentProject}</TableCell>
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
                                                return (
                                                    <TableRow key={t.id}
                                                        className={`
                                                            h-[3rem]
                                                            ${(mode !== "select" && currentIndex === index) ? " bg-secondary text-secondary-foreground " : "bg-card"}
                                                            ${mode === "select" && currentIndex === index ? " font-semibold bg-primary/10 " : ""}
                                                            ${t.is_complete ? "bg-muted/10  text-muted-foreground/40 focus-within:text-muted-foreground/60" : ""} 
                                                    `} onClick={_ => setCurrentIndex(index)}>
                                                        <TableCell className={`
                                                            ${currentIndex === index ? "border-l-2 border-primary" : ""}
                                                            ${table_idx_width} px-2 text-sm text-right
                                                            `}>{index + 1}</TableCell>
                                                        <TableCell onClick={_ => onClick(index, 'completion')} className={`${table_completion_width} group hover:cursor-pointer`}>
                                                            <div className="flex w-ful justify-center">
                                                                {mode === "select" && currentIndex === index ? (
                                                                    <ChevronsUpDown className="text-primary h-4 group-hover:text-gray-300" />
                                                                ) : (
                                                                    <>
                                                                        {t.is_complete ? <FaCircleCheck className="text-primary group-hover:text-gray-300" /> : <FaRegCircle className="text-gray-500 group-hover:text-green-500" />}
                                                                    </>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell onDoubleClick={_ => onClick(index, 'text')} className={table_task_width}>
                                                            <div className="flex w-full h-full justify-between  items-center">
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
                                                                    <div className="relative h-full w-[20px]">
                                                                        <Star className="absolute top-1/4 left-0 right-0 m-auto" size={9} />
                                                                        <Star className="absolute bottom-1 left-1/2" size={9} />
                                                                        <Star className="absolute bottom-1 right-1/2" size={9} />
                                                                    </div>
                                                                }
                                                                {t.priority === "2" &&
                                                                    <div className="relative h-full w-[20px]">
                                                                        <Star className="absolute top-0 bottom-0 left-1/2 m-auto" size={9} />
                                                                        <Star className="absolute top-0 bottom-0 right-1/2 m-auto" size={9} />
                                                                    </div>
                                                                }
                                                                {t.priority === "1" &&
                                                                    <div className="relative h-full w-[20px]">
                                                                        <Star className="absolute top-0 bottom-0 left-0 right-0 m-auto" size={9} />
                                                                    </div>
                                                                }
                                                                <div className="truncate w-full pr-2 sm:pr-0 flex items-center gap-1"
                                                                    onTouchMove={handleTouchMove}
                                                                    onTouchEnd={_ => handleTouchEnd(index, 'text')}>
                                                                    <Item
                                                                        t={t}
                                                                        index={index}
                                                                        currentIndex={currentIndex}
                                                                        prefix={"text"}
                                                                        currentPrefix={prefix}
                                                                        mode={mode}
                                                                        label={t.text}
                                                                        register={register} />
                                                                    {t.detail && !(mode === "edit" && currentIndex === index) &&
                                                                        <span className={`hidden sm:flex font-light  items-center text-5sm  text-primary p-1 ${!t.context ? "opacity-0 w-0" : "opacity-1"}`}>
                                                                            <StickyNote className="h-3 w-3" />
                                                                        </span>
                                                                    }
                                                                    {t.context && !(mode === "edit" && currentIndex === index) &&
                                                                        <span className={`hidden sm:flex gap-1 font-light  items-center border border-ex-label rounded-full text-5sm px-1 text-ex-label ${!t.context ? "opacity-0 w-0" : "opacity-1"}`}>
                                                                            <Tag className="h-3" />
                                                                            <SelectModal
                                                                                t={t}
                                                                                index={index}
                                                                                currentIndex={currentIndex}
                                                                                prefix={"context"}
                                                                                currentPrefix={prefix}
                                                                                mode={mode}
                                                                                className={`text-left ${!t.context && "w-0"}`}
                                                                                label={t.context}
                                                                                register={register}
                                                                                rhfSetValue={rhfSetValue}
                                                                                items={labels}
                                                                                title={"ラベル"}
                                                                                onClick={onClick} />
                                                                        </span>
                                                                    }
                                                                    {!currentProject && !(mode === "edit" && currentIndex === index) &&
                                                                        <span className={`hidden sm:flex gap-1 font-light  items-center border border-ex-project rounded-full text-5sm px-1 text-ex-project ${!t.project ? "opacity-0 w-0" : "opacity-1"}`}>
                                                                            <Box className="h-3" />
                                                                            <SelectModal
                                                                                t={t}
                                                                                index={index}
                                                                                currentIndex={currentIndex}
                                                                                prefix={"project"}
                                                                                currentPrefix={prefix}
                                                                                mode={mode}
                                                                                className={`text-left ${!t.project && "w-0"}`}
                                                                                label={t.project}
                                                                                register={register}
                                                                                rhfSetValue={rhfSetValue}
                                                                                items={projects}
                                                                                title={"プロジェクト"}
                                                                                onClick={onClick} />
                                                                        </span>
                                                                    }
                                                                </div>
                                                                <div className="flex sm:hidden items-center gap-1 ">
                                                                    {t.context && <span className="bg-ex-label text-ex-label rounded-full w-2 h-2" />}
                                                                    {t.project && <span className="bg-ex-project text-ex-project rounded-full w-2 h-2" />}
                                                                    <button onClick={e => {
                                                                        e.stopPropagation()
                                                                        e.preventDefault()
                                                                        onClick(index, 'editDetail')
                                                                    }} className=" text-muted-foreground ">
                                                                        <MessageCircleMore className="h-5 w-5" />
                                                                    </button>
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
                        <TableRow>
                            <TableCell className="h-16"></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <div className={`hidden sm:block border bg-card text-accent-foreground rounded-b-sm`} />
            </div >
        </>
    )
}