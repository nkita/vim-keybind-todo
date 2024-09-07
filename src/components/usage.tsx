'use client'
import { keymap, Keymap, KeymapItem, KeymapItemType } from '@/components/config'
import { Sort, Mode } from "@/types"
import { title } from 'process'
import { cn } from "@/lib/utils"
import { ArrowDownAz, Bird, Keyboard, Monitor, Move, Pencil, Plus, SquarePlus } from 'lucide-react'
import { Button } from './ui/button'
import { Dispatch, SetStateAction } from 'react'

export const Usage = ({
    sort,
    mode,
    isHelp,
    setHelp,
    isTodos,
}: {
    sort: Sort
    mode: Mode
    isHelp: boolean
    setHelp: Dispatch<SetStateAction<boolean>>
    isTodos: boolean
}) => {

    return (
        <>
            <div className={`h-full w-full p-4 border bg-white/80 border-gray-950 rounded-sm  group`}>
                <div className="flex justify-between h-[40px] shadow-l">
                    <h1 className="flex gap-1 p-2 text-md  text-center items-end"><Keyboard />使い方 <span className='text-3sm text-gray-500'>※大文字・小文字は区別しています。</span></h1>
                    <Button variant={"link"} className="text-xs text-current" onClick={_ => setHelp(p => !p)}> 閉じる&nbsp;<kbd>?</kbd></Button>
                </div>
                <hr className='pt-1 shadow-2xl' />
                <article className="flex flex-wrap h-[calc(100%-48px)] overflow-auto hidden-scrollbar group-hover:visible-scrollbar">
                    <Section title={<><Move className='scale-75' />移動</>} type='focus' sort={sort} mode={mode} isTodos={isTodos} />
                    <Section title={<><Plus className='scale-75' /> 追加</>} type='add' sort={sort} mode={mode} isTodos={isTodos} />
                    <Section title={<><Pencil className='scale-75' />編集</>} type='edit' sort={sort} mode={mode} isTodos={isTodos} />
                    <Section title={<><Monitor className='scale-75' />表示</>} type='view' sort={sort} mode={mode} isTodos={isTodos} />
                    {/* <Section title={<><ArrowDownAz className='scale-75' /> ソート</>} type='sort' sort={sort} mode={mode} isTodos={isTodos} /> */}
                    <Section title={<><Bird className='scale-75' /> その他</>} type='other' sort={sort} mode={mode} isTodos={isTodos} />
                </article >
            </div>
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
        <section className={cn("m-2 py-1 flex-grow", className)}>
            <h2 className='flex text-sm  items-center font-semibold'>{title}</h2>
            <div className='p-3 border rounded-md'>
                <ul>
                    {
                        Object.entries(keymap).map(([key, value]) => {
                            const enabled = value.enable?.mode.includes(mode)
                                && (value.enable.sort === undefined || value.enable.sort?.includes(sort))
                                && (isTodos ? true : (value.enable.withoutTask === undefined || value.enable.withoutTask))

                            if (value.type.includes(type) && enabled) {
                                return (
                                    <li key={key} className={`flex items-center  justify-between gap-2 text-3sm py-2`}>
                                        <span>{value.description}</span>
                                        <div>
                                            {value.keysDisp !== undefined ? (
                                                value.keysDisp.map((k, i) => <kbd key={`usage${k} ${i}`}>{k}</kbd>)
                                            ) : (
                                                value.keys.map(k => <kbd key={k}>{k}</kbd>)
                                            )}
                                        </div>
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