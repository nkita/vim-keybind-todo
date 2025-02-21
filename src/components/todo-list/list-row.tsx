'use client'

import { useSortable } from "@dnd-kit/sortable"
import { TableRow, TableCell } from "../ui/table"
import { CalendarDays, ChevronsUpDown, GripVertical, X } from "lucide-react"
import { FaCircleCheck, FaRegCircle } from "react-icons/fa6"
import { Star } from "lucide-react"
import { StickyNote, Tag } from "lucide-react"
import { Button } from "../ui/button"
import { ListRowText } from "./list-row-text"
import { find as lfind } from "lodash"
import { SelectModal } from "../select-modal"
import { LabelProps, Mode, ProjectProps, TodoProps } from "@/types"
import { Box } from "lucide-react"
import { SetStateAction, useEffect, useRef, useState } from "react"
import { Dispatch } from "react"
import dayjs from 'dayjs'
import 'dayjs/locale/ja'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { DateRange } from "react-day-picker"
import { Input } from "../ui/input"

dayjs.extend(relativeTime)
dayjs.locale('ja')

export function TodoListRow({
    t,
    index,
    currentIndex,
    nextTabIndent,
    prefix,
    mode,
    displayMode,
    currentProjectId,
    exLabels,
    exProjects,
    setIsComposing,
    onChangePeriod,
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
        displayMode?: string
        currentProjectId: string
        setIsComposing: Dispatch<SetStateAction<boolean>>
        onChangePeriod?: (todoId: string, startDate: Date, endDate: Date) => void
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
    } = useSortable({ id: t.id, data: { type: "todo", id: t.id } });

    const style = {
        transform: transform ? `translate3d(0px, ${transform.y}px, 0)` : undefined,
        transition
    };

    const rowH = "h-[35px]"
    return (
        <TableRow key={t.id}
            className={`${rowH} ${common_color_css} group outline-none`}
            {...attributes}
            style={style}
            ref={setNodeRef}
            onMouseDown={e => {
                setCurrentIndex(index)
                if (mode !== "normal") onClick(index, 'normal')
                e.stopPropagation()
                e.preventDefault()
            }}>
            <TableCell className={`sticky left-0 text-sm text-right z-10 ${rowH} p-0 m-0 ${table_idx_width}`} {...listeners}>
                <div className={`relative pl-2 pr-1 w-[2.0rem] flex items-center h-full ${common_color_css} hover:cursor-grab`}>
                    <span className="w-full h-full flex justify-center items-center absolute left-0 top-0 group-hover:opacity-100 opacity-0 transition-all duration-200 overflow-hidden">
                        <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </span>
                    <span className="w-full h-full flex justify-center items-center absolute left-0 top-0 group-hover:opacity-0 opacity-100 transition-all duration-200 overflow-hidden">
                        {index + 1}
                    </span>
                </div>
            </TableCell>
            <TableCell onClick={_ => onClick(index, 'completion')} className={` ${table_completion_width} group hover:cursor-pointer`}>
                <div className="flex w-ful justify-center">
                    {mode === "select" && currentIndex === index ? (
                        <ChevronsUpDown className="text-primary h-3 w-3 " />
                    ) : (
                        <>
                            {t.is_complete ? <FaCircleCheck className="text-primary" /> : <FaRegCircle className="text-gray-500" />}
                        </>
                    )}
                </div>
            </TableCell>
            <TableCell>
                <div className="flex w-full h-full justify-between  items-center relative">
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
                    <div className="relative w-full pr-2 sm:pr-0 flex items-center gap-3 ">
                        <ListRowText
                            t={t}
                            index={index}
                            currentIndex={currentIndex}
                            currentPrefix={prefix}
                            className={`
                               ${t.priority === "1" && "text-primary"}
                               ${t.priority === "2" && "text-destructive"}
                               ${t.priority === "3" && "text-destructive font-semibold"}`}
                            mode={mode}
                            setIsComposing={setIsComposing}
                            label={t.text}
                            register={register} />
                        {displayMode === "normal" &&
                            <>
                                {t.detail &&
                                    <span className={`whitespace-nowrap hidden sm:flex gap-1  items-center text-6sm px-2  text-muted-foreground border rounded-full`}>
                                        <StickyNote className="h-3 w-3" />メモ
                                    </span>
                                }
                                {(t.labelId || (!currentProjectId && t.projectId)) &&
                                    <div className="flex border rounded-full px-2 shadow-sm text-6sm">
                                        {t.labelId &&
                                            <span className={`whitespace-nowrap hidden sm:flex gap-1 pr-2  items-center  text-ex-label`}>
                                                <Tag className="h-3 w-3" />
                                                {lfind(exLabels, { id: t.labelId })?.name}
                                            </span>
                                        }
                                        {!currentProjectId && t.projectId &&
                                            <>
                                                <span className={`whitespace-nowrap hidden sm:flex gap-1  items-center  rounded-full text-ex-project`}>
                                                    <Box className="h-3 w-3" />
                                                    {lfind(exProjects, { id: t.projectId })?.name}
                                                </span>
                                            </>
                                        }
                                    </div>
                                }
                            </>
                        }
                        {onChangePeriod && (
                            <div className="absolute right-0  sm:block text-4sm text-muted-foreground">
                                <PopupCalendar t={t} onChangePeriod={onChangePeriod} />
                            </div>
                        )}
                    </div>
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
                        itemId={t.labelId}
                        items={exLabels.map(l => { return { id: l.id, name: l.name } })}
                        saveCloud={saveNewLabels}
                        title={"ラベル"}
                        onClick={onClick} />
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
                        itemId={t.projectId}
                        items={exProjects.map(p => { return { id: p.id, name: p.name } })}
                        title={"プロジェクト"}
                        onClick={onClick} />
                </div>
            </TableCell>
            {
                displayMode === "normal" &&
                <TableCell className="w-[100px] px-2">
                </TableCell>
            }
            <TableCell className="w-[90px] sm:hidden overflow-hidden">
                <div className={`flex px-2 items-center gap-2 justify-end`}>
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
            </TableCell>
        </TableRow >
    );
}

function formatDate(dateStr: string) {
    const date = dayjs(dateStr.split(' ')[0])
    const today = dayjs()

    if (date.isBefore(today, 'day')) return date.format('M/D')
    if (date.isSame(today, 'day')) return '今日'
    if (date.isSame(today.add(1, 'day'), 'day')) return '明日'
    if (date.isSame(today.add(2, 'day'), 'day')) return '明後日'
    if (date.diff(today, 'day') < 6) return date.format('dddd')
    return date.format('M/D')
}

function formatDateWithWarning(dateStr: string) {
    const date = dayjs(dateStr.split(' ')[0])
    const today = dayjs()
    const formattedDate = formatDate(dateStr)

    // 期限切れ
    if (date.isBefore(today, 'day')) {
        return <span className="text-destructive ">{formattedDate}</span>
    }
    // 期限が3日以内
    if (date.diff(today, 'day') <= 3) {
        return <span className="text-warning">{formattedDate}</span>
    }
    return formattedDate
}

const PopupCalendar = ({
    t,
    onChangePeriod,
}: {
    t: TodoProps
    onChangePeriod: (todoId: string, startDate: Date, endDate: Date) => void
}) => {
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(t.startDate),
        to: new Date(t.endDate)
    })

    const handleCancel = () => {
        setDate({
            from: new Date(t.startDate),
            to: new Date(t.endDate)
        })
        setOpen(false)
    }

    const handleSave = () => {
        const startDate = date?.from ?? new Date()
        const endDate = date?.to ?? new Date()
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        onChangePeriod(t.id, startDate, endDate)
        setOpen(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div className="flex items-center justify-center gap-1 rounded-md bg-card/50 px-2 backdrop-blur-xl hover:cursor-pointer border border-transparent hover:border-primary transition-all duration-200">
                    <CalendarDays className="w-3 h-3" />
                    <span className="w-8 text-center">{formatDate(t.startDate)}</span> - <span className="w-8 text-center">{formatDateWithWarning(t.endDate)}</span>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <div className="w-full h-full flex  gap-2 p-2">
                    <div>
                        <Calendar
                            mode="range"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border-none"
                        />
                        <div className="flex justify-between gap-2">
                            <Button size={"sm"} className="w-full" variant={"secondary"} onClick={handleCancel}>キャンセル</Button>
                            <Button size={"sm"} className="w-full" onClick={handleSave}>保存</Button>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}