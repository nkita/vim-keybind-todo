'use client'
import { keymap, Keymap, KeymapItem, KeymapItemType } from '@/components/config'
import { Sort, Mode } from "@/types"
import { title } from 'process'
import { cn } from "@/lib/utils"

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
            <article className="flex h-[calc(100%-30px)] ">
                <Section title={"移動"} type='focus' sort={sort} mode={mode} isTodos={isTodos} />
                <Section title={"編集"} type='edit' sort={sort} mode={mode} isTodos={isTodos} />
                <Section title={"その他"} type='other' sort={sort} mode={mode} isTodos={isTodos} />
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
    title: string
    type: KeymapItemType,
    sort: Sort
    mode: Mode
    isTodos: boolean
    className?: string
}) => {
    return (
        <section className={cn("m-2 overflow-auto w-1/3 h-full", className)}>
            <h2 className='text-sm text-accent-foreground'>{title}</h2>
            <div className='p-4 bg-popover text-popover-foreground border rounded-md h-[calc(100%-35px)]'>
                <ul className='grid grid-cols-1 sm:grid-cols-2'>
                    {
                        Object.entries(keymap).map(([key, value]) => {
                            const enabled = value.enable?.mode.includes(mode)
                                && (value.enable.sort === undefined || value.enable.sort?.includes(sort))
                                && (isTodos ? true : (value.enable.withoutTask === undefined || value.enable.withoutTask))

                            if (value.type.includes(type) && enabled) {
                                return (
                                    <li key={key} className={`flex items-center gap-2 text-xs p-1`}>
                                        {value.keysDisp !== undefined ? (
                                            value.keysDisp.map((k, i) => <kbd key={`usage${k} ${i}`} className="flex items-center h-[25px] px-2 py-0.5 text-xs font-semibold border rounded-md">{k}</kbd>)
                                        ) : (
                                            value.keys.map(k => <kbd key={k} className="flex items-center h-[25px] px-2 py-0.5 text-xs font-semibold border rounded-md">{k}</kbd>)
                                        )}
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