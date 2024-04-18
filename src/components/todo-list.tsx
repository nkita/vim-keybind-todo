'use client'
import { Dispatch, MouseEvent, SetStateAction } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import { UseFormRegister, FieldValues } from "react-hook-form"
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "./ui/table"
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
        <div className="flex flex-col justify-between text-sm" id="main" onMouseDown={handleMainMouseDown}>
            mode:{mode}, sort:{sort ?? "-"}, key:{!command ? "-" : command} , log:{log ?? "-"}
            <div className="flex">search keyword:<input {...register("search")} className={`text-left truncate outline-none bg-transparent focus:bg-gray-100 focus:text-black`} type="text" /></div>

            <div onMouseDown={e => e.preventDefault()} className="flex flex-col">
                <div onMouseDown={e => e.preventDefault()} className="flex justify-between">
                    <div onMouseDown={handleTodoAreaMouseDown} className="w-3/4 overflow-auto bg-gray-50">
                        <button className={`border-r-2 border-t-2 p-1 ${!currentProject || !projects.length ? "bg-blue-100" : "bg-white"}`}>All</button>
                        {projects.map(p => {
                            return (
                                <button key={p} className={`border-r-2 border-t-2 p-1 ${currentProject === p ? "bg-blue-100" : ""}`}>{p}</button>
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead></TableHead>
                                    <TableHead></TableHead>
                                    <TableHead>優先度</TableHead>
                                    <TableHead>タスク</TableHead>
                                    <TableHead>ラベル</TableHead>
                                    <TableHead>プロジェクト</TableHead>
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
                                                    <TableRow key={t.id} className={`focus-within:bg-blue-100 ${searchResultIndex[index] ? "bg-yellow-100" : ""}`} >
                                                        <TableCell>{index + 1}</TableCell>
                                                        <TableCell>{t.isCompletion ? "x" : ""}</TableCell>
                                                        <TableCell>
                                                            <Item
                                                                t={t}
                                                                index={index}
                                                                currentIndex={currentIndex}
                                                                prefix={"priority"}
                                                                currentPrefix={prefix}
                                                                mode={mode}
                                                                width="w-[25px]"
                                                                label={t.priority ? `(${t.priority})` : ""}
                                                                register={register} />
                                                        </TableCell>
                                                        <TableCell>
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
                                                                prefix={"project"}
                                                                currentPrefix={prefix}
                                                                mode={mode}
                                                                label={t.project ? ` :${t.project}` : ""}
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
                                                    </TableRow>
                                                )
                                            })
                                        }
                                    </>
                                )}
                            </TableBody>
                        </Table>

                        {/* {filterdTodos.map((t, index) => {
                            return (
                                <div key={t.id} className={`flex w - full border - b truncate focus - within:bg-blue-100 ${searchResultIndex[index] ? "bg-yellow-100" : "bg-white"} `} onClick={_ => setCurrentIndex(index)}>
                                    <span className="w-[15px] text-center text-xs text-gray-900 border-r border-r-blue-200"> {index + 1}</span>
                                    <div className="w-full">
                                        <div className="flex items-center w-full">
                                            <span className="w-[15px] text-center"> {t.isCompletion ? "x" : ""}</span>
                                            <Item
                                                t={t}
                                                index={index}
                                                currentIndex={currentIndex}
                                                prefix={"priority"}
                                                currentPrefix={prefix}
                                                mode={mode}
                                                width="w-[25px]"
                                                label={t.priority ? `(${t.priority})` : ""}
                                                register={register} />
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
                                        <div className="flex w-full gap-3 justify-between text-xs">
                                            <div className="flex gap-3 text-xs text-gray-400 pl-8">
                                                <Item
                                                    t={t}
                                                    index={index}
                                                    currentIndex={currentIndex}
                                                    prefix={"project"}
                                                    currentPrefix={prefix}
                                                    mode={mode}
                                                    label={t.project ? ` :${t.project}` : ""}
                                                    register={register} />
                                                <Item
                                                    t={t}
                                                    index={index}
                                                    currentIndex={currentIndex}
                                                    prefix={"context"}
                                                    currentPrefix={prefix}
                                                    mode={mode}
                                                    label={t.context ? ` @${t.context}` : ""}
                                                    register={register} />
                                            </div>
                                            {t.creationDate}
                                        </div>
                                    </div>
                                </div>
                            )
                        })} */}
                    </div>
                </div>
            </div >
        </div >
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
        register: any
    }
) => {
    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation()
    return (
        <>
            <div onMouseDown={handleMouseDown} className={`${!(currentIndex === index && currentPrefix === prefix && mode === "edit") ? width : "hidden"}`}>
                <button
                    className={`w-full text-left truncate outline-none`}
                    autoFocus={currentIndex === index}
                    {...register(`${prefix}-${t.id}`)}
                >
                    <span className={`${t.isCompletion ? "line-through text-gray-600" : ""}`}>
                        {label}
                    </span>
                </button>
            </div>
            <div onMouseDown={handleMouseDown} className={`focus-within:font-medium ${currentIndex === index && currentPrefix === prefix && mode === "edit" ? width : "hidden"}`}>
                <input
                    tabIndex={-1}
                    className={`w-full text-left truncate outline-none bg-transparent focus:bg-gray-100`}
                    type="text"
                    maxLength={prefix === 'priority' ? 1 : -1}
                    {...register(`edit-${prefix}-${t.id}`, { value: t[prefix] })}
                // onFocus={e => e.currentTarget.setSelectionRange(t[prefix].length, t.text.length)}
                />
            </div >
        </>
    )
}