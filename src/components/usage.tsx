'use client'
import { keymap } from './config'
import { Sort, Mode } from "@/types"

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
        <div className="bg-sky-300 py-2 px-2">
            Usage space
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8  gap-4 b">
                {
                    Object.entries(keymap).map(([key, value]) => {
                        if (
                            value.enable?.mode.includes(mode)
                            && (value.enable.sort === undefined || value.enable.sort?.includes(sort))
                            && (isTodos ? true : (value.enable.withoutTask === undefined || value.enable.withoutTask))
                        ) {
                            return (
                                <div key={key} className="flex items-center gap-2">
                                    {value.keysDisp !== undefined ? (
                                        value.keysDisp.map((k, i) => <kbd key={`usage${k}${i}`} className="flex items-center h-[25px] px-2 py-0.5 text-xs font-semibold bg-sky-100 shadow-lg rounded-md">{k}</kbd>)
                                    ) : (
                                        value.keys.map(k => <kbd key={k} className="flex items-center h-[25px] px-2 py-0.5 text-xs font-semibold bg-sky-100 shadow-lg rounded-md">{k}</kbd>)
                                    )}
                                    :{value.description}
                                </div>
                            )
                        }
                    })
                }
            </div>
        </div>
    )
}
