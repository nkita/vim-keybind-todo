import { TodoProps, Mode, ComboboxDynamicItemProps } from "@/types"
import { Modal } from "./ui/modal"
import { DynamicSearchSelect } from "./ui/combobox-dynamic"
import { useEffect, useState } from "react"
import { find } from "lodash"

export const SelectModal = (
    {
        t,
        index,
        currentIndex,
        prefix,
        currentPrefix,
        mode,
        className,
        register,
        rhfSetValue,
        position = "list",
        itemId,
        items,
        title = "",
        onClick,
        saveCloud,
    }: {
        t: TodoProps
        index: number
        currentIndex: number
        itemId: string | undefined
        items: ComboboxDynamicItemProps[]
        mode: Mode
        prefix: "text" | "priority" | "detail" | "projectId" | "labelId"
        currentPrefix: string
        className?: string | undefined
        register: any
        rhfSetValue: any
        position?: "list" | "content"
        title?: string,
        onClick: (index: number, prefx: string) => void
        saveCloud?: (id: string, name: string) => void
    }) => {
    const [isView, setIsView] = useState(false)
    const [isNewItem, setIsNewItem] = useState(false)

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
        if (!_) onClick(currentIndex, "normal")
    }

    const handleAddItem = (val: ComboboxDynamicItemProps) => {
        if (val) {
            let id = !val.id ? self.crypto.randomUUID() : val.id
            if (val.id === "" && val.name && saveCloud) saveCloud(id, val.name)
            rhfSetValue(`edit-${position}-${prefix}-${t.id}`, id === "delete" ? "" : id)
        }
        onClick(currentIndex, "normal")
    }
    const itemLabel = find(items, { id: itemId ?? "" })?.name ?? ""

    return (
        <>
            <input type="hidden" {...register(`edit-${position}-${prefix}-${t.id}`, { value: itemId })} />

            <Modal
                buttonLabel={itemLabel}
                dialogTitle={`${title}の選択`}
                className={className}
                open={isView}
                onClickOpen={open}
                onClickChange={close}>
                <div className="h-full">
                    <div className="text-gray-500">
                        <p className="pt-3 hidden sm:block ">
                            <kbd>Enter</kbd>で確定　<kbd>Esc</kbd>でキャンセル
                            <br />
                            <br />
                            <kbd>↑</kbd> <kbd>↓</kbd>キーで選択
                        </p>
                        <p className="text-sm/10 pt-0 sm:pt-8">
                            <span>現在の{title}：<span className="text-primary font-medium underline">{itemLabel}</span>{!itemLabel && "-"}</span>
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