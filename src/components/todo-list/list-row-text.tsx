import { cn } from "@/lib/utils"
import { TodoProps } from "@/types"
import { Dispatch, MouseEvent, SetStateAction, useState } from "react"
export const ListRowText = (
    {
        t,
        index,
        mode,
        currentIndex,
        currentPrefix,
        label,
        className,
        register,
        position = "list",
        setIsComposing,
    }: {
        t: TodoProps
        index: number
        currentIndex: number
        currentPrefix: string
        mode: string
        label: any
        className?: string | undefined
        register: any
        position?: "list" | "content"
        setIsComposing: Dispatch<SetStateAction<boolean>>
    }
) => {
    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation()
    const _classNameCont = `m-1 text-xs w-full text-left outline-none bg-transparent ${position === "list" ? "truncate" : "focus:outline-primary rounded hover:cursor-text"} ${t["is_complete"] ? "line-through" : ""} ${label ? "" : "text-gray-400 focus:text-gray-600"}`
    const isView = currentIndex === index
        && currentPrefix === "text"
        && ((mode === "edit" && position === "list") || (mode === "editDetail" && position === "content"))
    const val = t.text ?? ""
    const [isComp, setIsComp] = useState(false)
    return (
        <>
            <div className={cn(`${isView && "hidden"} border border-transparent `, className)}>
                <button
                    tabIndex={-1}
                    autoFocus={currentIndex === index}
                    className={_classNameCont}
                    {...register(`${position}-text-${t.id}`)}>
                    <span className="flex items-center gap-1">
                        <span className="truncate">{label ? label : "入力してください..."}</span>
                    </span>
                </button>
            </div >
            <div className={cn(`${!isView && "hidden"} border-2 border-primary rounded-md h-full w-[80%]`, className)} onMouseDown={e => e.stopPropagation()}>
                <input
                    tabIndex={-1}
                    className={_classNameCont}
                    onCompositionStart={() => {
                        setIsComp(true)
                        setIsComposing(true)
                    }}
                    onCompositionEnd={(e) => {
                        setTimeout(() => {
                            setIsComp(false)
                        }, 100)
                    }}
                    onKeyDown={e => {
                        if (e.key === "Enter" && !isComp) {
                            setIsComposing(false)
                        }
                    }}
                    type="text"
                    onFocus={e => e.currentTarget.setSelectionRange(val.length, val.length)}
                    {...register(`edit-${position}-text-${t.id}`, { value: t.text })}
                />
            </div >
        </>
    )
}