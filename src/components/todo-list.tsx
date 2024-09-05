'use client'
import { Dispatch, MouseEvent, SetStateAction } from "react"
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
    const hcssMainHeight = "h-[calc(100%-85px)]"
    const tabHeight = "h-[30px]"
    const tableHeadHeight = "h-[35px]"
    const taskBarHeight = "h-[20px]"
    return (
        <>
            <div className="absolute top-0 left-1/2 h-[60px]" />
            <div className="h-full">
                <div className={`flex overflow-auto text-xs flex-nowrap text-nowrap ${tabHeight}`}>
                    <button onClick={_ => onClick(-1, 'projectTab')} className={`rounded-t-sm border-x border-t border-primary/90 text-xs px-2 p-1 ${!currentProject || !projects.length ? "bg-primary/90 text-primary-foreground" : "bg-card text-card-foreground hover:bg-sky-50"}`}><div className="flex gap-1 items-center"><FaList />All</div></button>
                    {projects.map((p, i) => {
                        return (
                            <button onClick={_ => onClick(i, 'projectTab')} key={p} className={`rounded-t-sm border-r border-t border-b-0 border-primary/90 text-xs px-2 p-1 ${currentProject === p ? "bg-primary/90 text-primary-foreground border-b-accent" : "bg-card text-card-foreground hover:bg-sky-50"}`}><div className="flex gap-1 items-center"><FaSitemap />{p}</div></button>
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
                        <div className="w-[62%]">タスク</div>
                        <div className="flex w-[14%] items-center">
                            <FaTag />
                            <div className="truncate">
                                ラベル
                            </div>
                            {sort === "context" && <FaArrowUpZA />}
                        </div>
                        <div className="flex w-[14%] items-center">
                            <FaSitemap />
                            <div className="truncate">
                                プロジェクト
                            </div>
                        </div>
                    </div>
                </div>
                <Table className={`w-full border border-primary/90 ${hcssMainHeight} bg-card border-b-0`} index={currentIndex}>
                    <TableBody className="border-b bg-card text-card-foreground leading-6">
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
                                        className={`p-1 w-full text-left truncate outline-none bg-transparent font-semibold`}
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
                                                    <TableRow key={t.id}
                                                        className={`
                                                            ${currentIndex === index ?
                                                                "bg-sky-100" :
                                                                index % 2 == 1 ?
                                                                    "bg-slate-50" :
                                                                    ""
                                                            }
                                                            ${searchResultIndex[index] ? "bg-yellow-50" : ""}
                                                            ${t.is_complete ? "bg-muted text-muted-foreground/50 focus-within:text-muted-foreground" : ""} 
                                                    `} onClick={_ => setCurrentIndex(index)}>
                                                        <TableCell className="w-[30px] px-2 text-right">{index + 1}</TableCell>
                                                        <TableCell onClick={_ => onClick(index, 'completion')} className="w-[30px] group hover:cursor-pointer">
                                                            <div className="flex w-ful justify-center">
                                                                {t.is_complete ? <FaCircleCheck className="text-green-500 scale-125 group-hover:text-gray-300" /> : <FaRegCircle className="text-gray-500 scale-125 group-hover:text-green-500" />}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="w-[30px] text-center h-[30px]">
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
                                                        <TableCell onClick={_ => onClick(currentIndex, "project")} className={`w-[13%] text-ex-project ${(t.is_complete && currentIndex !== index) && "text-ex-project/50"} font-light`}>
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
                <div className={`border border-t-gray-300 border-primary text-primary-foreground rounded-b-sm ${taskBarHeight}]`}>
                    <div className="flex justify-between text-2sm text-gray-600 h-full px-2">
                        <div className="text-3sm">表示：{viewCompletion ? "全て" : "未完了のみ"}</div>
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