'use client'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { Table, TableRow, TableBody, TableCell } from "./ui/table"
import { FaArrowUpZA, FaRegCircle, FaCircleCheck, FaTag, FaSitemap } from "react-icons/fa6";
import { SelectModal } from "./select-modal"
import { Item } from "./todo-list-item"
import { Check, Circle, CircleCheck, Dot, List, MessageCircleMore, Star } from "lucide-react"
import { completionTaskProjectName } from "./config"

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
    const hcssMainHeight = "h-[calc(100%-80px)] sm:h-[calc(100%-70px)]"
    const tableHeadHeight = "h-[40px]"
    const taskBarHeight = "h-[30px]"

    const table_idx_width = "w-[30px]"
    const table_completion_width = "w-[30px]"
    const table_priority_width = "w-[30px]"
    const table_task_width = "w-[calc(100%-90px)] sm:w-[calc(70%-90px)]"
    const table_label_width = "w-0 sm:w-[15%] max-w-[20%]"
    const table_project_width = "w-0 sm:w-[15%] max-w-[20%]"

    const [touchStartX, setTouchStartX] = useState(0);
    const [touchMoveX, setTouchMoveX] = useState(0);

    const handleTouchStart = (event: React.TouchEvent) => setTouchStartX(event.changedTouches[0].screenX);
    const handleTouchMove = (event: React.TouchEvent) => setTouchMoveX(event.changedTouches[0].screenX);

    const handleTouchEnd = (index: number, prefix: string) => {
        if (touchMoveX === 0) onClick(index, prefix)
        setTouchStartX(0);
        setTouchMoveX(0);
    };

    return (
        <>
            <div className="h-full">
                <div className={`flex text-xs font-semibold bg-primary/85 text-primary-foreground border-none rounded-t-none sm:rounded-t-md items-center ${tableHeadHeight}`}>
                    <div className={table_idx_width}></div>
                    <div className={table_completion_width}></div>
                    <div className={`${table_priority_width} text-center`}>
                        <span className={`flex justify-center items-center ${sort === "priority" && "font-semibold"}`}>
                            優
                            {sort === "priority" && <FaArrowUpZA />}
                        </span>
                    </div>
                    <div className={`${table_task_width} p-2 truncate`}>タスク</div>
                    <div className={`flex items-center ${table_label_width}`}>
                        <FaTag />
                        <span className="truncate">
                            ラベル
                        </span >
                        {sort === "context" && <FaArrowUpZA />}
                    </div>
                    <div className={`flex items-center ${table_project_width} pr-2`}>
                        <FaSitemap />
                        <span className="truncate">
                            プロジェクト
                        </span>
                    </div>
                </div>
                {loading &&
                    <div className={`flex justify-center items-center w-full ${hcssMainHeight} bg-muted border-y-0 border-x`}>
                        <div className="flex text-sm items-center justify-center h-full w-full ">
                            <span className="flex justify-center items-center px-10 py-5 font-semibold rounded-md bg-card text-card-foreground shadow-lg">
                                <span className="animate-bounce">Loading...</span>
                            </span>
                        </div>
                    </div>
                }
                <Table className={`w-full border ${loading && "hidden"} ${hcssMainHeight} bg-card border-b-0 table-scrollbar`} index={currentIndex}>
                    <TableBody className="border-b bg-card text-card-foreground leading-6">
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
                                    <TableRow className="text-center text-muted-foreground text-xs">
                                        <TableCell className="p-2"><kbd>I</kbd>（ <kbd>Shift</kbd>+<kbd>i</kbd> ）で初めてのタスクを追加しましょう。</TableCell>
                                    </TableRow>
                                ) : (
                                    <>
                                        {
                                            filterdTodos.map((t, index) => {
                                                return (
                                                    <TableRow key={t.id}
                                                        className={`
                                                            ${currentIndex === index ? "bg-accent" : ""}
                                                            ${searchResultIndex[index] ? "bg-yellow-50" : ""}
                                                            ${t.is_complete ? "bg-muted/40  text-muted-foreground/40 focus-within:text-muted-foreground/60" : ""} 
                                                    `} onClick={_ => setCurrentIndex(index)}>
                                                        <TableCell className={`
                                                            ${currentIndex === index ? "border-l-2 border-primary" : ""}
                                                            ${table_idx_width} px-2 text-sm text-right
                                                            `}>{index + 1}</TableCell>
                                                        <TableCell onClick={_ => onClick(index, 'completion')} className={`${table_completion_width} group hover:cursor-pointer`}>
                                                            <div className="flex w-ful justify-center">
                                                                {t.is_complete ? <FaCircleCheck className="text-primary scale-125 group-hover:text-gray-300" /> : <FaRegCircle className="text-gray-500 scale-125 group-hover:text-green-500" />}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className={`${table_priority_width} text-center h-[30px]`}>
                                                            {t.priority === "3" &&
                                                                <div className="relative h-full w-full">
                                                                    <Star className="absolute top-1/4 left-0 right-0 m-auto" size={9} />
                                                                    <Star className="absolute bottom-1 left-1/2" size={9} />
                                                                    <Star className="absolute bottom-1 right-1/2" size={9} />
                                                                </div>
                                                            }
                                                            {t.priority === "2" &&
                                                                <div className="relative h-full w-full">
                                                                    <Star className="absolute top-0 bottom-0 left-1/2 m-auto" size={9} />
                                                                    <Star className="absolute top-0 bottom-0 right-1/2 m-auto" size={9} />
                                                                </div>
                                                            }
                                                            {t.priority === "1" &&
                                                                <div className="relative h-full w-full">
                                                                    <Star className="absolute top-0 bottom-0 left-0 right-0 m-auto" size={9} />
                                                                </div>
                                                            }
                                                        </TableCell>
                                                        <TableCell onDoubleClick={_ => onClick(index, 'text')} className={table_task_width}>
                                                            <div className="flex w-full justify-between items-center">
                                                                <div className="truncate w-full pr-2 sm:pr-0"
                                                                    onTouchStart={handleTouchStart}
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
                                                        <TableCell onDoubleClick={_ => onClick(index, 'context')} className={`${table_label_width} text-ex-label ${(t.is_complete && currentIndex !== index) && "text-ex-label/50"} font-light`}>
                                                            <div className="flex">
                                                                <div className={`hidden sm:flex items-center h-full text-xs ${!t.context && currentIndex === index ? "opacity-1" : "opacity-0 w-0"} fade-out-5 transition-all text-muted-foreground`}><kbd className="text-6sm text-muted-foreground">L</kbd></div>
                                                                <SelectModal
                                                                    t={t}
                                                                    index={index}
                                                                    currentIndex={currentIndex}
                                                                    prefix={"context"}
                                                                    currentPrefix={prefix}
                                                                    mode={mode}
                                                                    className={`text-left`}
                                                                    label={t.context}
                                                                    register={register}
                                                                    rhfSetValue={rhfSetValue}
                                                                    items={labels}
                                                                    title={"ラベル"}
                                                                    onClick={onClick} />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell onClick={_ => onClick(currentIndex, "project")} className={`${table_project_width} text-ex-project ${(t.is_complete && currentIndex !== index) && "text-ex-project/50"} font-light pr-2`}>
                                                            <div className="flex">
                                                                <div className={`hidden sm:flex items-center h-full text-xs ${!t.project && currentIndex === index ? "opacity-1" : "opacity-0 w-0"} fade-out-5 transition-all text-muted-foreground`}><kbd className="text-6sm text-muted-foreground">P</kbd></div>
                                                                <SelectModal
                                                                    t={t}
                                                                    index={index}
                                                                    currentIndex={currentIndex}
                                                                    prefix={"project"}
                                                                    currentPrefix={prefix}
                                                                    mode={mode}
                                                                    className="text-left"
                                                                    label={t.project}
                                                                    register={register}
                                                                    rhfSetValue={rhfSetValue}
                                                                    items={projects}
                                                                    title={"プロジェクト"}
                                                                    onClick={onClick} />
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
                <div className={`hidden sm:block border bg-card text-primary rounded-b-sm ${taskBarHeight}`}>
                    <div className="flex justify-between items-center text-xs h-full px-2 truncate">
                        <div> {!completionOnly && <> 表示：{viewCompletion ? "全て" : "未完了のみ"}</>}</div>
                        <input tabIndex={-1} {...register("search")} placeholder="キーワードを入力" className={`truncate outline-none bg-transparent focus:bg-accent focus:text-accent-foreground focus:text-black ${mode !== "search" && "placeholder:text-transparent"}`} type="text" />
                        <div className="flex items-center">
                            {command ? (
                                <span>{command}</span>
                            ) : (
                                <span>--{mode}--</span>
                            )}
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}