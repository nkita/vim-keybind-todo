'use client'
import { Dispatch, HTMLAttributes, MouseEvent, SetStateAction } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import { UseFormRegister, FieldValues } from "react-hook-form"
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "./ui/table"
import { ClassNameValue } from "tailwind-merge"
import { cn } from "@/lib/utils"
import { Badge } from "./ui/badge"
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
        log,
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
        log: string
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
            <div className="border w-[1200px] p-4 rounded-md">
                <Badge variant={mode === "normal" ? "default" : mode === "edit" ? "outline" : "destructive"}>{mode}</Badge>
                {!command ? "" : "press key:" + command}
                {log ?? ""}
                <input {...register("search")} className={`text-left truncate outline-none bg-transparent focus:bg-gray-100 focus:text-black`} type="text" />
                <div onMouseDown={handleTodoAreaMouseDown} className="pt-4">
                    <button className={`border rounded-t-sm text-sm px-2 border-t-2 p-1 ${!currentProject || !projects.length ? "bg-blue-100" : "bg-white"}`}>All</button>
                    {projects.map(p => {
                        return (
                            <button key={p} className={`rounded-t-sm text-sm border px-2 p-1 ${currentProject === p ? "bg-blue-100" : ""}`}>{p}</button>
                        )
                    })}
                    {sort !== undefined &&
                        <div className="flex items-center border-b truncate bg-white">
                            <div className="w-[45px]" />
                            <input
                                tabIndex={-1}
                                className={`text-left truncate outline-none bg-transparent focus:bg-gray-100 focus:h-auto h-0`}
                                type="text"
                                maxLength={prefix === 'priority' ? 1 : -1}
                                {...register(`newtask`)}
                            // onFocus={e => e.currentTarget.setSelectionRange(t[prefix].length, t.text.length)}
                            />
                        </div>
                    }
                </div>
                <Table className="h-[600px] border">
                    <TableHeader className="top-0 sticky bg-gray-50">
                        <TableRow>
                            <TableHead className="w-[20px]"></TableHead>
                            <TableHead className="w-[20px]"></TableHead>
                            <TableHead className="w-[80px] text-center">優先度</TableHead>
                            <TableHead>タスク</TableHead>
                            <TableHead className="w-[200px]">ラベル</TableHead>
                            <TableHead className="w-[200px]" >プロジェクト</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filterdTodos.length === 0 ? (
                            <TableRow>
                                <TableCell>No task. good!</TableCell>
                            </TableRow>
                        ) : (
                            <>
                                {
                                    filterdTodos.map((t, index) => {
                                        return (
                                            <TableRow key={t.id} className={` focus-within:bg-blue-100 ${searchResultIndex[index] ? "bg-yellow-100" : ""}`} onClick={_ => setCurrentIndex(index)}>
                                                <TableCell>{index + 1}</TableCell>
                                                <TableCell className="text-center">{t.isCompletion ? "x" : ""}</TableCell>
                                                <TableCell className="text-center">
                                                    <Item
                                                        t={t}
                                                        index={index}
                                                        currentIndex={currentIndex}
                                                        prefix={"priority"}
                                                        currentPrefix={prefix}
                                                        mode={mode}
                                                        label={t.priority ? `(${t.priority})` : ""}
                                                        className={"text-center"}
                                                        register={register} />
                                                </TableCell>
                                                <TableCell className="truncate whitespace-nowrap">
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
                                                <TableCell>
                                                    <Item
                                                        t={t}
                                                        index={index}
                                                        currentIndex={currentIndex}
                                                        prefix={"context"}
                                                        currentPrefix={prefix}
                                                        mode={mode}
                                                        label={t.context ? ` @${t.context}` : ""}
                                                        register={register} />
                                                </TableCell>
                                                <TableCell>
                                                    <Item
                                                        t={t}
                                                        index={index}
                                                        currentIndex={currentIndex}
                                                        prefix={"project"}
                                                        currentPrefix={prefix}
                                                        mode={mode}
                                                        label={t.project ? ` :${t.project}` : ""}
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
        width = '',
        height = '',
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
        width?: string
        height?: string
        label: string | undefined
        className?: string | undefined
        register: any
    }
) => {
    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation()
    const _className = cn("p-1 w-full text-left truncate outline-none bg-transparent", className)
    return (
        <>
            <div onMouseDown={handleMouseDown} className={`${!(currentIndex === index && currentPrefix === prefix && mode === "edit") ? width : "hidden"}`}>
                <button
                    className={_className}
                    autoFocus={currentIndex === index}
                    {...register(`${prefix}-${t.id}`)}
                >
                    <span className={`${t.isCompletion ? "line-through" : ""}`}>
                        {label}
                    </span>
                </button>
            </div>
            <div onMouseDown={handleMouseDown} className={`w-full focus-within:font-medium ${currentIndex === index && currentPrefix === prefix && mode === "edit" ? width : "hidden"}`}>
                <input
                    tabIndex={-1}
                    className={_className}
                    type="text"
                    maxLength={prefix === 'priority' ? 1 : -1}
                    {...register(`edit-${prefix}-${t.id}`, { value: t[prefix] })}
                />
            </div >
        </>
    )
}