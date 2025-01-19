'use client'

import { useSortable } from "@dnd-kit/sortable"
import { TableRow, TableCell } from "./ui/table"
import { ChevronsUpDown } from "lucide-react"
import { FaCircleCheck, FaRegCircle } from "react-icons/fa6"
import { Star } from "lucide-react"
import { StickyNote, Tag } from "lucide-react"
import { Button } from "./ui/button"
import { Text } from "./todo-list-text"
import { find as lfind } from "lodash"
import { SelectModal } from "./select-modal"
import { LabelProps, Mode, ProjectProps, TodoProps } from "@/types"
import { Box } from "lucide-react"

export function TodoListRow({
    t,
    index,
    currentIndex,
    nextTabIndent,
    prefix,
    mode,
    currentProjectId,
    exLabels,
    exProjects,
    onClick,
    setCurrentIndex,
    common_color_css, register, rhfSetValue, saveNewLabels, saveNewProject, table_idx_width, table_completion_width, table_task_width }
    : {
        t: TodoProps
        index: number
        currentIndex: number
        nextTabIndent: number
        prefix: string
        mode: Mode
        currentProjectId: string
        exLabels: LabelProps[]
        exProjects: ProjectProps[]
        onClick: (id: number, prefix: string) => void
        setCurrentIndex: (index: number) => void
        common_color_css: string
        register: any
        rhfSetValue: (name: string, value: any) => void
        saveNewLabels: (id: string, name: string) => void
        saveNewProject: (id: string, name: string) => void
        table_idx_width: string
        table_completion_width: string
        table_task_width: string
    }

) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: t.id, data: { type: "todo", todoId: t.id, text: t.text } });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition
    };

    return (
        <TableRow key={t.id}
            ref={setNodeRef}
            style={style} {...attributes} {...listeners}
            className={`h-[2.5rem] ${common_color_css}`}
            onMouseDown={e => {
                setCurrentIndex(index)
                e.preventDefault()
                e.stopPropagation()
            }}>
            <TableCell className={`
                     sticky left-0 
                     text-sm text-right 
                     z-10
                     p-0 m-0 ${table_idx_width}
                    `}>
                <div className={` 
                         pl-2 pr-1  h-[2.5rem] flex items-center
                         ${common_color_css}
                         `}>
                    {index + 1}
                </div></TableCell>
            <TableCell onClick={_ => onClick(index, 'completion')} className={`${table_completion_width} group hover:cursor-pointer`}>
                <div className="flex w-ful justify-center">
                    {mode === "select" && currentIndex === index ? (
                        <ChevronsUpDown className="text-primary h-3 w-3 group-hover:text-gray-300" />
                    ) : (
                        <>
                            {t.is_complete ? <FaCircleCheck className="text-primary group-hover:text-gray-300" /> : <FaRegCircle className="text-gray-500 group-hover:text-green-500" />}
                        </>
                    )}
                </div>
            </TableCell>
            <TableCell onDoubleClick={_ => onClick(index, 'text')} className={`${table_task_width} relative`}>
                <div className="flex w-[calc(100%-20px)] sm:w-full h-full justify-between  items-center">
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
                        <>
                            <Star className="w-3 h-3 text-destructive" strokeWidth={3} />
                            <Star className="w-3 h-3 text-destructive" strokeWidth={3} />
                        </>
                    }
                    {t.priority === "2" && <Star className="w-3 h-3 text-destructive" strokeWidth={3} />}
                    {t.priority === "1" && <Star className="w-3 h-3 text-primary" strokeWidth={3} />}
                    <div className=" w-full pr-2 sm:pr-0 flex items-center gap-1">
                        <Text
                            t={t}
                            index={index}
                            currentIndex={currentIndex}
                            currentPrefix={prefix}
                            className={`
                               ${t.priority === "1" && "text-primary"}
                               ${t.priority === "2" && "text-destructive"}
                               ${t.priority === "3" && "text-destructive font-semibold"}
                            `}
                            mode={mode}
                            label={t.text}
                            register={register} />
                        {t.detail && !(mode === "edit" && currentIndex === index) &&
                            <span className={`hidden sm:flex font-light  items-center text-5sm  text-primary p-1`}>
                                <StickyNote className="h-3 w-3" />
                            </span>
                        }
                        {t.labelId && !(mode === "edit" && currentIndex === index) &&
                            <span className={`hidden sm:flex gap-1 font-light  items-center border border-ex-label rounded-full text-5sm px-2 text-ex-label`}>
                                <Tag className="h-3 w-3" />
                                {lfind(exLabels, { id: t.labelId })?.name}
                            </span>
                        }
                        <SelectModal
                            t={t}
                            index={index}
                            currentIndex={currentIndex}
                            prefix={"labelId"}
                            currentPrefix={prefix}
                            mode={mode}
                            className={`w-0`}
                            register={register}
                            rhfSetValue={rhfSetValue}
                            item={lfind(exLabels, { id: t.labelId })}
                            items={exLabels.map(l => { return { id: l.id, name: l.name } })}
                            saveCloud={saveNewLabels}
                            title={"ラベル"}
                            onClick={onClick} />
                        {!currentProjectId && t.projectId && !(mode === "edit" && currentIndex === index) &&
                            <span className={`hidden sm:flex gap-1 font-light  items-center border border-ex-project rounded-full text-5sm px-2 text-ex-project`}>
                                <Box className="h-3 w-3" />
                                {lfind(exProjects, { id: t.projectId })?.name}
                            </span>
                        }
                        <SelectModal
                            t={t}
                            index={index}
                            currentIndex={currentIndex}
                            prefix={"projectId"}
                            currentPrefix={prefix}
                            mode={mode}
                            className={`w-0`}
                            register={register}
                            rhfSetValue={rhfSetValue}
                            saveCloud={saveNewProject}
                            item={lfind(exProjects, { id: t.projectId })}
                            items={exProjects.map(p => { return { id: p.id, name: p.name } })}
                            title={"プロジェクト"}
                            onClick={onClick} />
                    </div>
                    <div className={`absolute right-0 flex sm:hidden items-center w-[90px] justify-end gap-1 px-2 h-full ${common_color_css}`}>
                        {t.labelId && <span className="bg-ex-label text-ex-label rounded-full w-2 h-2" />}
                        {t.projectId && <span className="bg-ex-project text-ex-project rounded-full w-2 h-2" />}
                        <Button size={"sm"}
                            className="text-xs h-7"
                            onClick={e => {
                                e.stopPropagation()
                                e.preventDefault()
                                onClick(index, 'editDetail')
                            }}>編集</Button>
                    </div>
                </div>
            </TableCell>
        </TableRow >
    );
}   