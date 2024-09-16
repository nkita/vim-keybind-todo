'use client'
import { Dispatch, MouseEvent, SetStateAction, useEffect, useRef } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "./ui/table"
import { FaArrowUpZA, FaRegCircle, FaCircleCheck, FaTag, FaSitemap, FaList } from "react-icons/fa6";
import { Item, ModalSelect } from "./todo"
import { Star } from "lucide-react"

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
        onClick: (id: number, prefix: string) => void
        setCurrentIndex: Dispatch<SetStateAction<number>>
        register: UseFormRegister<FieldValues>
        rhfSetValue: UseFormSetValue<FieldValues>
    }
) => {
    const hcssMainHeight = "h-[calc(100%-100px)]"
    const tabHeight = "h-[30px]"
    const tableHeadHeight = "h-[40px]"
    const taskBarHeight = "h-[30px]"

    const table_idx_width = "w-[30px]"
    const table_completion_width = "w-[30px]"
    const table_priority_width = "w-[30px]"
    const table_task_width = "w-[calc(72%-90px)]"
    const table_label_width = "w-[14%]"
    const table_project_width = "w-[14%]"

    const Project = (
        {
            currentProject, index, project, onClick

        }: {
            currentProject: string, index: number, project: string, onClick: (index: number, prefix: string) => void
        }
    ) => {
        const ref = useRef<HTMLButtonElement>(null)
        useEffect(() => {
            if (currentProject === project) {
                ref.current?.scrollIntoView({ behavior: "smooth" })
            }
        }, [currentProject, project])
        return (
            <button ref={ref} onClick={_ => onClick(index, 'projectTab')}
                className={`text-sm ${currentProject === project ? "border-b-2 font-semibold border-primary " : " text-secondary-foreground/50"}`}>
                <span className="flex gap-1 items-center"><FaSitemap />{project ? project : "All"}</span>
            </button>
        )
    }

    return (
        <>
            <div className="absolute top-0 left-1/2 h-[60px]" />
            <div className="h-full">
                <div className={`flex overflow-auto flex-nowrap text-nowrap gap-4 hidden-scrollbar ${tabHeight} bg-background text-foreground`}  >
                    <Project currentProject={currentProject} index={-1} project={""} onClick={onClick} />
                    {projects.map((p, i) => {
                        return (
                            <Project key={p} currentProject={currentProject} index={i} project={p} onClick={onClick} />
                        )
                    })}
                </div>
                <div className={`flex text-sm bg-primary text-primary-foreground border-b-0 border rounded-t-md items-center ${tableHeadHeight}`}>
                    <div className={table_idx_width}></div>
                    <div className={table_completion_width}></div>
                    <div className={`${table_priority_width} text-center`}>
                        <div className={`flex justify-center items-center ${sort === "priority" && "font-semibold"}`}>
                            優
                            {sort === "priority" && <FaArrowUpZA />}
                        </div>
                    </div>
                    <div className={`${table_task_width} p-2`}>タスク</div>
                    <div className={`flex items-center ${table_label_width}`}>
                        <FaTag />
                        <div className="truncate">
                            ラベル
                        </div>
                        {sort === "context" && <FaArrowUpZA />}
                    </div>
                    <div className={`flex items-center ${table_project_width}`}>
                        <FaSitemap />
                        <div className="truncate">
                            プロジェクト
                        </div>
                    </div>
                </div>
                <Table className={`w-full border  ${hcssMainHeight} bg-card border-b-0 table-scrollbar`} index={currentIndex}>
                    <TableBody className="border-b bg-card text-card-foreground leading-6">
                        {loading &&
                            <TableRow className={`bg-accent text-accent-foreground font-semibold text-center`}>
                                <TableCell>Loading...</TableCell>
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
                                                            ${currentIndex === index ? "bg-secondary" : ""}
                                                            ${searchResultIndex[index] ? "bg-yellow-50" : ""}
                                                            ${t.is_complete ? "bg-muted/40  text-muted-foreground/40 focus-within:text-muted-foreground" : ""} 
                                                    `} onClick={_ => setCurrentIndex(index)}>
                                                        <TableCell className={`
                                                            ${currentIndex === index ? "border-l-2 border-primary" : ""}
                                                            ${table_idx_width} px-2 text-right
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
                                                            <Item
                                                                t={t}
                                                                index={index}
                                                                currentIndex={currentIndex}
                                                                prefix={"text"}
                                                                currentPrefix={prefix}
                                                                mode={mode}
                                                                label={t.text}
                                                                register={register} />
                                                        </TableCell>
                                                        <TableCell onDoubleClick={_ => onClick(index, 'context')} className={`${table_label_width} text-ex-label ${(t.is_complete && currentIndex !== index) && "text-ex-label/50"} font-light`}>
                                                            <ModalSelect
                                                                t={t}
                                                                index={index}
                                                                currentIndex={currentIndex}
                                                                prefix={"context"}
                                                                currentPrefix={prefix}
                                                                mode={mode}
                                                                className={`text-left `}
                                                                label={t.context}
                                                                register={register}
                                                                rhfSetValue={rhfSetValue}
                                                                items={labels}
                                                                onClick={onClick} />
                                                        </TableCell>
                                                        <TableCell onClick={_ => onClick(currentIndex, "project")} className={`${table_project_width} text-ex-project ${(t.is_complete && currentIndex !== index) && "text-ex-project/50"} font-light`}>
                                                            <ModalSelect
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
                                                                onClick={onClick} />
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
                <div className={`border bg-secondary text-secondary-foreground rounded-b-sm ${taskBarHeight}`}>
                    <div className="flex justify-between items-center text-xs h-full px-2">
                        <div>表示：{viewCompletion ? "全て" : "未完了のみ"}</div>
                        <input {...register("search")} placeholder="キーワードを入力" className={`truncate outline-none bg-transparent focus:bg-accent focus:text-accent-foreground focus:text-black ${mode !== "search" && "placeholder:text-transparent"}`} type="text" />
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