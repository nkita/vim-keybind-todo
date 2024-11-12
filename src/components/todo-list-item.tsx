import { TodoProps } from "@/types"
import { ArrowRight, ArrowRightCircle, StickyNote } from "lucide-react"
import { MouseEvent } from "react"
export const Item = (
    {
        t,
        index,
        mode,
        currentIndex,
        prefix,
        currentPrefix,
        label,
        className,
        register,
        position = "list",
    }: {
        t: TodoProps
        index: number
        currentIndex: number
        prefix: "text" | "priority" | "project" | "context" | "detail"
        currentPrefix: string
        mode: string
        label: any
        className?: string | undefined
        register: any
        position?: "list" | "content"
    }
) => {
    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation()
    const _classNameCont = `p-1 w-full text-left outline-none bg-transparent ${position === "list" ? "truncate" : "focus:outline-primary rounded hover:cursor-text"} ${t["is_complete"] ? "line-through" : ""} ${label ? "" : "text-gray-400 focus:text-gray-600"}`
    const isView = currentIndex === index
        && currentPrefix === prefix
        && ((mode === "edit" && position === "list") || (mode === "editDetail" && position === "content"))
    const val = t[prefix] ?? ""

    return (
        <>
            <div className={`${isView && "hidden"} ${className} border border-transparent`}>
                <button
                    tabIndex={-1}
                    autoFocus={currentIndex === index}
                    className={_classNameCont}
                    {...register(`${position}-${prefix}-${t.id}`)}>
                    <span className="flex items-center gap-1">
                        <span className="truncate">{label ? label : "入力してください..."}</span>
                        {t.detail && <span className="text-xs text-primary hidden sm:inline"><StickyNote className="inline w-3 h-3 scale-x-90" /></span>}
                    </span>
                </button>
            </div >
            <div className={`${!isView && "hidden"} ${className} border border-primary rounded-md h-full`} onMouseDown={e => e.stopPropagation()}>
                <input
                    tabIndex={-1}
                    className={_classNameCont}
                    type="text"
                    maxLength={prefix === 'priority' ? 1 : -1}
                    onFocus={e => e.currentTarget.setSelectionRange(val.length, val.length)}
                    {...register(`edit-${position}-${prefix}-${t.id}`, { value: t[prefix] })}
                />
            </div >
        </>
    )
}