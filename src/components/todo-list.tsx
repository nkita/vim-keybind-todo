'use client'
import { Dispatch, MouseEvent, SetStateAction } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import { UseFormRegister, FieldValues } from "react-hook-form"
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell, TableFooter } from "./ui/table"
import { FaArrowUpZA, FaRegCircle, FaCircleCheck, FaTag, FaSitemap, FaList } from "react-icons/fa6";
import { keymap } from "@/components/config"
import { UsageView } from "./usage"

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
        setCurrentIndex,
        register

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
        setCurrentIndex: Dispatch<SetStateAction<number>>
        register: UseFormRegister<FieldValues>
    }
) => {
    const handleMainMouseDown = (e: MouseEvent<HTMLDivElement>) => e.preventDefault()
    const handleTodoAreaMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation();
    }
    return (
        <>
            <div>
                <div className="flex ">
                </div>
                <div onMouseDown={handleTodoAreaMouseDown} className="pt-4">
                    <button className={`border-x border-t rounded-t-sm text-sm px-2 p-1 ${!currentProject || !projects.length ? "bg-blue-100" : "bg-white"}`}><div className="flex gap-1 items-center"><FaList />All</div></button>
                    {projects.map(p => {
                        return (
                            <button key={p} className={`rounded-t-sm text-sm border-x border-t px-2 p-1 ${currentProject === p ? "bg-blue-100" : ""}`}><div className="flex gap-1 items-center"><FaSitemap className="text-blue-500" />{p}</div></button>
                        )
                    })}
                </div>
                <Table className="w-full h-[600px] border" index={currentIndex}>
                    <TableHeader className="top-0 sticky z-10 bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[3%]"></TableHead>
                            <TableHead className="w-[3%]"></TableHead>
                            <TableHead className="w-[4%] text-center">
                                <div className={`flex items-center ${sort === "priority" && "font-semibold"}`}>
                                    優
                                    {sort === "priority" && <FaArrowUpZA />}
                                </div>
                            </TableHead>
                            <TableHead className="w-[64%]">タスク</TableHead>
                            <TableHead className="w-[13%]">
                                <div className={`flex items-center ${sort === "context" && "font-semibold"}`}>
                                    <FaTag />
                                    ラベル
                                    {sort === "context" && <FaArrowUpZA className="text-xs" />}
                                </div>
                            </TableHead>
                            <TableHead className="w-[13%]">
                                <div className={`flex items-center`}>
                                    <FaSitemap />
                                    プロジェクト
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="border-b">
                        {(sort !== undefined && mode === "editOnSort") &&
                            <TableRow className={`bg-blue-100 `}>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell>
                                    <input
                                        tabIndex={-1}
                                        className={`p-1 text-left truncate outline-none bg-transparent font-semibold`}
                                        type="text"
                                        maxLength={prefix === 'priority' ? 1 : -1}
                                        {...register(`newtask`)}
                                    // onFocus={e => e.currentTarget.setSelectionRange(t[prefix].length, t.text.length)}
                                    />
                                </TableCell>
                                <TableCell></TableCell>
                                <TableCell className="p-1 font-light text-blue-500">{currentProject}</TableCell>
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
                                            <TableRow key={t.id} className={` focus-within:bg-blue-100 ${searchResultIndex[index] ? "bg-yellow-100" : ""} ${t.isCompletion ? "bg-gray-50 text-gray-300 focus-within:text-gray-500" : ""}`} onClick={_ => setCurrentIndex(index)}>
                                                <TableCell className="pl-1">{index + 1}</TableCell>
                                                <TableCell>
                                                    {t.isCompletion ? <FaCircleCheck className="text-green-500 scale-125" /> : <FaRegCircle className="text-gray-500 scale-125" />}
                                                </TableCell>
                                                <TableCell className="text-center">
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
                                                <TableCell>
                                                    <UsageView name={'up'} view={currentIndex === index && currentIndex > 0} />
                                                    <Item
                                                        t={t}
                                                        index={index}
                                                        currentIndex={currentIndex}
                                                        prefix={"text"}
                                                        currentPrefix={prefix}
                                                        mode={mode}
                                                        label={t.text}
                                                        register={register} />
                                                    <UsageView name={'down'} view={currentIndex === index && currentIndex !== filterdTodos.length - 1} />
                                                </TableCell>
                                                <TableCell className={`text-emerald-500 ${(t.isCompletion && currentIndex !== index) && "text-emerald-100"} font-light`}>
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
                                                <TableCell className={`text-blue-500 ${(t.isCompletion && currentIndex !== index) && "text-blue-100"} font-light`}>
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
                        <input {...register("search")} placeholder="キーワードを入力" className={`truncate outline-none bg-transparent focus:bg-blue-50 focus:text-black ${mode !== "search" && "placeholder:text-transparent"}`} type="text" />
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
    return (
        <>
            <div onMouseDown={handleMouseDown} className={`${isView && "hidden"} ${className}`}>
                <button
                    autoFocus={currentIndex === index}
                    className={_classNameCont}
                    {...register(`${prefix}-${t.id}`)}
                >
                    {label}
                </button>
            </div>
            <div onMouseDown={handleMouseDown} className={`${!isView && "hidden"} ${className} font-bold`}>
                <input
                    tabIndex={-1}
                    className={_classNameCont}
                    type="text"
                    maxLength={prefix === 'priority' ? 1 : -1}
                    onFocus={e => e.currentTarget.setSelectionRange(val.length, val.length)}
                    {...register(`edit-${prefix}-${t.id}`, { value: t[prefix] })}
                />
            </div >
        </>
    )
}