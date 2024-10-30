import { TodoProps, Mode } from "@/types"
import { Modal } from "./ui/modal"
import { DynamicSearchSelect } from "./ui/combobox-dynamic"
import { useEffect, useState } from "react"

export const SelectModal = (
    {
        t,
        index,
        currentIndex,
        prefix,
        currentPrefix,
        mode,
        className,
        label,
        register,
        rhfSetValue,
        position = "list",
        items,
        title = "",
        onClick
    }: {
        t: TodoProps
        index: number
        label: string | undefined
        currentIndex: number
        items: string[]
        mode: Mode
        prefix: "text" | "priority" | "project" | "context" | "detail"
        currentPrefix: string
        className?: string | undefined
        register: any
        rhfSetValue: any
        position?: "list" | "content"
        title?: string,
        onClick: (index: number, prefx: string) => void
    }) => {
    const [isView, setIsView] = useState(false)
    useEffect(() => {
        setIsView(
            currentIndex === index
            && currentPrefix === prefix
            && mode === "modal"
            && (position === "list" || position === "content")
        )
    }, [currentIndex, index, currentPrefix, prefix, mode, position])

    function open() {
        onClick(currentIndex, prefix)
    }

    function close(_: boolean) {
        onClick(currentIndex, "normal")
    }

    const handleAddItem = (val: string) => {
        rhfSetValue(`edit-${position}-${prefix}-${t.id}`, val)
        onClick(currentIndex, "normal")
    }
    return (
        <>
            <input type="hidden" {...register(`edit-${position}-${prefix}-${t.id}`, { value: label ?? "" })} />
            <Modal
                buttonLabel={label}
                dialogTitle={`${title}の選択`}
                className={className}
                open={isView}
                onClickOpen={open}
                onClickClose={close}>
                <div>
                    <div className="text-gray-500">
                        <p className="pt-3 hidden sm:block ">
                            <kbd>Enter</kbd>で確定　<kbd>Esc</kbd>でキャンセル
                            <br />
                            <br />
                            <kbd>↑</kbd> <kbd>↓</kbd>キーで選択
                        </p>
                        <p className="text-sm/10 pt-0 sm:pt-8">
                            <span>現在の{title}：<span className="text-primary font-medium underline">{label}</span>{!label && "-"}</span>
                        </p>
                    </div>
                    <DynamicSearchSelect
                        autoFocus={true}
                        tabIndex={0}
                        addItem={handleAddItem}
                        placeholder={`${title}を入力...`}
                        items={items}
                        onClose={close}
                        {...register(`${position}-${prefix}-${t.id}`)}
                    />
                </div>
            </Modal>
        </>
    )
}