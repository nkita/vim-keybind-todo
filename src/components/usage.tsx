'use client'
import { keymap, Keymap, KeymapItem, KeymapItemType } from '@/components/config'
import { Sort, Mode } from "@/types"
import { title } from 'process'
import { cn } from "@/lib/utils"
import { ArrowDownAz, Bird, Monitor, Move, Pencil, Plus, SquarePlus } from 'lucide-react'

export const Usage = ({
    sort,
    mode,
    isTodos,
}: {
    sort: Sort
    mode: Mode
    isTodos: boolean
}) => {

    return (
        <>
            <article className="grid grid-cols-2 md:grid-cols-3 h-[calc(100%-40px)] ">
                <Section title={<><Move className='scale-75' />移動</>} type='focus' sort={sort} mode={mode} isTodos={isTodos} />
                <Section title={<><Plus className='scale-75' /> 追加</>} type='add' sort={sort} mode={mode} isTodos={isTodos} />
                <Section title={<><Pencil className='scale-75' />編集</>} type='edit' sort={sort} mode={mode} isTodos={isTodos} />
                <Section title={<><Monitor className='scale-75' />表示</>} type='view' sort={sort} mode={mode} isTodos={isTodos} />
                <Section title={<><ArrowDownAz className='scale-75' /> ソート</>} type='sort' sort={sort} mode={mode} isTodos={isTodos} />
                <Section title={<><Bird className='scale-75' /> その他</>} type='other' sort={sort} mode={mode} isTodos={isTodos} />
            </article >
        </>
    )
}

const Section = ({
    title,
    type,
    sort,
    mode,
    isTodos,
    className,
}: {
    title: any,
    type: KeymapItemType,
    sort: Sort
    mode: Mode
    isTodos: boolean
    className?: string
}) => {
    return (
        <section className={cn("m-2 overflow-auto h-full", className)}>
            <h2 className='flex text-sm text-accent-foreground items-center font-semibold'>{title}</h2>
            <div className='p-4 bg-popover text-popover-foreground border rounded-md h-[calc(100%-35px)] overflow-auto'>
                <ul className='grid md:grid-cols-2 sm:grid-cols-1'>
                    {
                        Object.entries(keymap).map(([key, value]) => {
                            const enabled = value.enable?.mode.includes(mode)
                                && (value.enable.sort === undefined || value.enable.sort?.includes(sort))
                                && (isTodos ? true : (value.enable.withoutTask === undefined || value.enable.withoutTask))

                            if (value.type.includes(type) && enabled) {
                                return (
                                    <li key={key} className={`flex items-center gap-2 text-xs p-1`}>
                                        <div>
                                            {value.keysDisp !== undefined ? (
                                                value.keysDisp.map((k, i) => <kbd key={`usage${k} ${i}`} className="flex items-center h-[25px] px-2 py-0.5 text-xs font-semibold border rounded-md">{k}</kbd>)
                                            ) : (
                                                value.keys.map(k => <kbd key={k} className="flex items-center h-[25px] px-2 py-0.5 text-xs font-semibold border rounded-md">{k}</kbd>)
                                            )}
                                        </div>
                                        :
                                        <span>{value.description}</span>
                                    </li>
                                )
                            } else {
                                return
                            }
                        })
                    }
                </ul>
            </div>
        </section>
    )
}