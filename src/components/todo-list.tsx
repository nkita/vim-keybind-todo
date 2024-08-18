'use client'
import { Dispatch, MouseEvent, SetStateAction } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import { UseFormRegister, FieldValues } from "react-hook-form"
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "./ui/table"
import { FaArrowUpZA, FaRegCircle, FaCircleCheck, FaTag, FaSitemap, FaList } from "react-icons/fa6";
import { Item } from "./todo"

export const TodoList = (
    {
        filterdTodos,
        currentIndex,
        prefix,
        mode,
        projects,
        currentProject,
        sort,
        searchResultIndex,
        command,
        loading,
        onClick,
        setCurrentIndex,
        register,
    }: {
        filterdTodos: TodoProps[]
        currentIndex: number
        prefix: string
        mode: Mode
        projects: string[]
        currentProject: string
        sort: Sort
        searchResultIndex: boolean[]
        command: string
        loading: Boolean
        onClick: (id: number, prefix: string) => void
        setCurrentIndex: Dispatch<SetStateAction<number>>
        register: UseFormRegister<FieldValues>
    }
) => {
    const hcssMainHeight = "h-[calc(100%-87px)]"
    const tabHeight = "h-[30px]"
    const tableHeadHeight = "h-[35px]"
    const taskBarHeight = "h-[20px]"
    return (
        <>
            <div className="absolute top-0 left-1/2 h-[60px]">
            </div>
            <div className="h-full">
                <div className={`flex overflow-auto flex-nowrap text-nowrap ${tabHeight}`}>
                    <button onClick={_ => onClick(-1, 'projectTab')} className={`rounded-t-sm border-x border-t border-primary/90 text-sm px-2 p-1 ${!currentProject || !projects.length ? "bg-primary/90 text-primary-foreground" : "bg-card text-card-foreground hover:bg-primary/10"}`}><div className="flex gap-1 items-center"><FaList />All</div></button>
                    {projects.map((p, i) => {
                        return (
                            <button onClick={_ => onClick(i, 'projectTab')} key={p} className={`rounded-t-sm border-r border-t border-b-0 border-primary/90 text-sm px-2 p-1 ${currentProject === p ? "bg-primary/90 text-primary-foreground border-b-accent" : "bg-card text-card-foreground hover:bg-primary/10"}`}><div className="flex gap-1 items-center"><FaSitemap />{p}</div></button>
                        )
                    })}
                </div>
                <div className={`text-xs bg-primary text-primary-foreground rounded-tr-sm p-1 py-2 ${tableHeadHeight}`}>
                    <div className="flex gap-1">
                        <div className="w-[30px]"></div>
                        <div className="w-[30px]"></div>
                        <div className="w-[30px] text-center">
                            <div className={`flex items-center ${sort === "priority" && "font-semibold"}`}>
                                優
                                {sort === "priority" && <FaArrowUpZA />}
                            </div>
                        </div>
                        <div className="w-[64%]">タスク</div>
                        <div className="flex w-[13%]">
                            <FaTag />
                            <div className="truncate">
                                ラベル
                            </div>
                            {sort === "context" && <FaArrowUpZA className="text-xs w-1" />}
                        </div>
                        <div className="flex w-[13%]">
                            <FaSitemap />
                            <div className="truncate">
                                プロジェクト
                            </div>
                        </div>
                    </div>
                </div>
                <Table className={`w-full border border-primary/90 ${hcssMainHeight} bg-card border-b-0`} index={currentIndex}>
                    <TableBody className="border-b bg-card text-card-foreground">
                        {loading &&
                            <TableRow className={`bg-accent text-accent-foreground font-semibold text-center`}>
                                <TableCell>Loading...</TableCell>
                            </TableRow>
                        }
                        {(sort !== undefined && mode === "editOnSort") &&
                            <TableRow className={`bg-accent text-accent-foreground`}>
                                <TableCell className="w-[30px]"></TableCell>
                                <TableCell className="w-[30px]"></TableCell>
                                <TableCell className="w-[30px]"></TableCell>
                                <TableCell className="w-[64%]">
                                    <input
                                        tabIndex={-1}
                                        className={`p-1 text-left truncate outline-none bg-transparent font-semibold`}
                                        type="text"
                                        maxLength={prefix === 'priority' ? 1 : -1}
                                        {...register(`newtask`)}
                                    // onFocus={e => e.currentTarget.setSelectionRange(t[prefix].length, t.text.length)}
                                    />
                                </TableCell >
                                <TableCell className="w-[13%]" ></TableCell>
                                <TableCell className="w-[13%] p-1 font-light text-lab text-ex-project">{currentProject}</TableCell>
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
                                                    <TableRow key={t.id} className={`focus-within:bg-sky-100 ${searchResultIndex[index] ? "bg-yellow-50" : ""} ${t.is_complete ? "bg-muted text-muted-foreground/50 focus-within:text-muted-foreground" : ""}`} onClick={_ => setCurrentIndex(index)}>
                                                        <TableCell className="w-[30px] px-2 text-right">{index + 1}</TableCell>
                                                        <TableCell onClick={_ => onClick(index, 'completion')} className="w-[30px] group hover:cursor-pointer">
                                                            {t.is_complete ? <FaCircleCheck className="text-green-500 scale-125 group-hover:text-gray-300" /> : <FaRegCircle className="text-gray-500 scale-125 group-hover:text-green-500" />}
                                                        </TableCell>
                                                        <TableCell className="w-[30px] text-center" onDoubleClick={_ => onClick(index, 'priority')}>
                                                            <Item
                                                                t={t}
                                                                index={index}
                                                                currentIndex={currentIndex}
                                                                prefix={"priority"}
                                                                currentPrefix={prefix}
                                                                mode={mode}
                                                                label={t.priority ? t.priority : ""}
                                                                className={"text-center text-xs"}
                                                                register={register} />
                                                        </TableCell>
                                                        <TableCell onDoubleClick={_ => onClick(index, 'text')} className="w-[64%]">
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
                                                        <TableCell onDoubleClick={_ => onClick(index, 'context')} className={`w-[13%] text-ex-label ${(t.is_complete && currentIndex !== index) && "text-ex-label/50"} font-light`}>
                                                            <Item
                                                                t={t}
                                                                index={index}
                                                                currentIndex={currentIndex}
                                                                prefix={"context"}
                                                                currentPrefix={prefix}
                                                                mode={mode}
                                                                className="text-xs"
                                                                label={t.context}
                                                                register={register} />
                                                        </TableCell>
                                                        <TableCell onDoubleClick={_ => onClick(index, 'project')} className={`w-[13%] text-ex-project ${(t.is_complete && currentIndex !== index) && "text-ex-project/50"} font-light`}>
                                                            <Item
                                                                t={t}
                                                                index={index}
                                                                currentIndex={currentIndex}
                                                                prefix={"project"}
                                                                currentPrefix={prefix}
                                                                mode={mode}
                                                                className="text-xs"
                                                                label={t.project}
                                                                register={register} />
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
                <div className={`border border-t-gray-300 border-primary text-primary-foreground rounded-b-sm ${taskBarHeight}]`}>
                    <div className="flex justify-between text-sm text-gray-600 h-full px-2">
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