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
    const _classNameCont = `flex items-center gap-3 m-1 text-xs w-full text-left outline-none bg-transparent ${position === "list" ? "truncate" : "focus:outline-primary rounded hover:cursor-text"} ${t["is_complete"] ? "line-through" : ""} ${label ? "" : "text-gray-400 focus:text-gray-600"}`
    const isView = currentIndex === index
        && currentPrefix === "text"
        && ((mode === "edit" && position === "list") || (mode === "editDetail" && position === "content"))
    const val = t.text ?? ""
    const [isComp, setIsComp] = useState(false)
    return (
        <div className={cn(`relative w-[98%] ${isView && "bg-muted"}`, className)}>
            <div className={`${isView && "hidden"} w-full`}>
                <button
                    tabIndex={-1}
                    autoFocus={currentIndex === index}
                    className={_classNameCont}
                    {...register(`${position}-text-${t.id}`)}>
                    <span className="flex items-center gap-1 w-[98%]">
                        <span className="truncate">{label ? label : "入力してください..."}</span>
                    </span>
                </button>
            </div >
            <div className={`${!isView && "hidden"} w-full`} onMouseDown={e => e.stopPropagation()}>
                <input
                    tabIndex={-1}
                    className={cn(_classNameCont, "pr-4")}
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
            </div>
            <div className={`${isView ? "w-full" : "w-0"} absolute bottom-0 left-0 h-[1px] bg-primary transition-all duration-200`} />
        </div >
    )
}