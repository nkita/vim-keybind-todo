'use client'
import { Dispatch, MouseEvent, SetStateAction } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import { UseFormRegister, FieldValues } from "react-hook-form"
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "./ui/table"
import { FaArrowUpZA, FaRegCircle, FaCircleCheck, FaTag, FaSitemap, FaList } from "react-icons/fa6";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select"
import { DynamicSearchSelect } from "./ui/combobox-dynamic"
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
        onClick: (id: number, prefix: string) => void
        setCurrentIndex: Dispatch<SetStateAction<number>>
        register: UseFormRegister<FieldValues>
    }
) => {
    return (
        <>
            <div className="h-full">
                <div className="pt-4 flex overflow-auto flex-nowrap text-nowrap">
                    <button onClick={_ => onClick(-1, 'projectTab')} className={`rounded-t-sm border-x border-t border-primary/90 text-sm px-2 p-1 ${!currentProject || !projects.length ? "bg-primary/90 text-primary-foreground" : "bg-card text-card-foreground hover:bg-primary/10"}`}><div className="flex gap-1 items-center"><FaList />All</div></button>
                    {projects.map((p, i) => {
                        return (
                            <button onClick={_ => onClick(i, 'projectTab')} key={p} className={`rounded-t-sm border-r border-t border-b-0 border-primary/90 text-sm px-2 p-1 ${currentProject === p ? "bg-primary/90 text-primary-foreground border-b-accent" : "bg-card text-card-foreground hover:bg-primary/10"}`}><div className="flex gap-1 items-center"><FaSitemap />{p}</div></button>
                        )
                    })}
                </div>
                <div className="text-xs bg-primary text-primary-foreground rounded-tr-md p-1 py-2">
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
                        <div className="w-[13%]">
                            <div className={`flex items-center ${sort === "context" && "font-semibold"}`}>
                                <FaTag />
                                ラベル
                                {sort === "context" && <FaArrowUpZA className="text-xs w-1" />}
                            </div>
                        </div>
                        <div className="w-[13%]">
                            <div className={`flex items-center`}>
                                <FaSitemap className="w-4" />
                                プロジェクト
                            </div>
                        </div>
                    </div>
                </div>
                <Table className="pl-2 w-full border border-primary/90 h-[calc(100%-110px)] bg-card rounded-b-md" index={currentIndex}>
                    <TableBody className="border-b bg-card text-card-foreground">
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
                        {filterdTodos.length === 0 ? (
                            <TableRow>
                                <TableCell>No task. good!</TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {
                                    filterdTodos.map((t, index) => {
                                        return (
                                            <TableRow key={t.id} className={`focus-within:bg-sky-100 ${searchResultIndex[index] ? "bg-yellow-50" : ""} ${t.isCompletion ? "bg-muted text-muted-foreground/50 focus-within:text-muted-foreground" : ""}`} onClick={_ => setCurrentIndex(index)}>
                                                <TableCell className="w-[30px] px-2 text-right">{index + 1}</TableCell>
                                                <TableCell onClick={_ => onClick(index, 'completion')} className="w-[30px] group hover:cursor-pointer">
                                                    {t.isCompletion ? <FaCircleCheck className="text-green-500 scale-125 group-hover:text-gray-300" /> : <FaRegCircle className="text-gray-500 scale-125 group-hover:text-green-500" />}
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
                                                        className={"text-center"}
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
                                                <TableCell onDoubleClick={_ => onClick(index, 'context')} className={`w-[13%] text-ex-label ${(t.isCompletion && currentIndex !== index) && "text-ex-label/50"} font-light`}>
                                                    <Item
                                                        t={t}
                                                        index={index}
                                                        currentIndex={currentIndex}
                                                        prefix={"context"}
                                                        currentPrefix={prefix}
                                                        mode={mode}
                                                        label={t.context}
                                                        register={register} />
                                                </TableCell>
                                                <TableCell onDoubleClick={_ => onClick(index, 'project')} className={`w-[13%] text-ex-project ${(t.isCompletion && currentIndex !== index) && "text-ex-project/50"} font-light`}>
                                                    <Item
                                                        t={t}
                                                        index={index}
                                                        currentIndex={currentIndex}
                                                        prefix={"project"}
                                                        currentPrefix={prefix}
                                                        mode={mode}
                                                        label={t.project}
                                                        register={register} />
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                }
                            </>
                        )}
                    </TableBody>
                </Table>
                <div className="flex justify-between text-sm">
                    <div>
                        {command ? (
                            <span>{command}</span>
                        ) : (
                            <span>--{mode}--</span>
                        )}
                    </div>
                    <div>
                        <input {...register("search")} placeholder="キーワードを入力" className={`truncate outline-none bg-transparent focus:bg-accent focus:text-accent-foreground focus:text-black ${mode !== "search" && "placeholder:text-transparent"}`} type="text" />
                    </div>
                </div>
            </div >
        </>
    )
}

const Item = (
    {
        t,
        index,
        mode,
        currentIndex,
        prefix,
        currentPrefix,
        label,
        className,
        register
    }: {
        t: TodoProps
        index: number
        currentIndex: number
        prefix: "text" | "priority" | "project" | "context"
        currentPrefix: string
        mode: string
        label: any
        className?: string | undefined
        register: any
    }
) => {
    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation()
    const _classNameCont = "p-1 w-full text-left truncate outline-none bg-transparent"
    const isView = currentIndex === index && currentPrefix === prefix && mode === "edit"
    const val = t[prefix] ?? ""


    const addItem = (val: string) => {
        console.log(val)
    }
    return (
        <>
            <div className={`${isView && "hidden"} ${className}`}>
                <button
                    autoFocus={currentIndex === index}
                    className={_classNameCont}
                    {...register(`${prefix}-${t.id}`)}
                >
                    {label}
                </button>
            </div>
            <div className={`${!isView && "hidden"} ${className} font-bold`}>
                {/* {(prefix === "project" || prefix === "context") ? (
                    <DynamicSearchSelect tabIndex={-1} items={["project", "hobby"]} placeholder={"選択"} {...register(`edit-${prefix}-${t.id}`, { value: t[prefix] })} addItem={addItem} autoSave={false} />
                ) : ( */}
                <input
                    tabIndex={-1}
                    className={_classNameCont}
                    type="text"
                    maxLength={prefix === 'priority' ? 1 : -1}
                    onFocus={e => e.currentTarget.setSelectionRange(val.length, val.length)}
                    {...register(`edit-${prefix}-${t.id}`, { value: t[prefix] })}
                />
                {/* )} */}
            </div >
        </>
    )
}