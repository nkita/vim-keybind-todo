import { TodoProps, Mode } from "@/types"
import { Modal } from "./ui/modal"
import { DynamicSearchSelect } from "./ui/combobox-dynamic"
import { MouseEventHandler, useEffect, useState } from "react"

export const ProfileEditModal = (
    {
        buttonLabel,
        dialogTitle,
        className,
        onClickClose,
        onClickOpen
    }: {
        buttonLabel?: string
        dialogTitle?: string
        className?: string
        onClickClose: (value: boolean) => void
        onClickOpen: MouseEventHandler<HTMLButtonElement>
    }) => {
    const [isView, setIsView] = useState(false)

    function open() {
        console.log("kokoi2")
        setIsView(true)
    }

    function close(_: boolean) {
        console.log("kokoi",_)
        setIsView(false)
    }
    return (
        <Modal
            buttonLabel={buttonLabel}
            dialogTitle={dialogTitle}
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
                </div>
            </div>
        </Modal>
    )
}