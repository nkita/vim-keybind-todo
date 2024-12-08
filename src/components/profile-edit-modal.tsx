import { TodoProps, Mode } from "@/types"
import { Modal } from "./ui/modal"
import { DynamicSearchSelect } from "./ui/combobox-dynamic"
import { MouseEventHandler, useEffect, useState } from "react"

export const ProfileEditModal = (
    {
        buttonLabel,
        dialogTitle,
        className,
    }: {
        buttonLabel?: string
        dialogTitle?: string
        className?: string
    }) => {
    const [isView, setIsView] = useState(false)

    function open() {
        setIsView(true)
    }

    function close(_: boolean) {
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
                        ここに入力
                    </p>
                </div>
            </div>
        </Modal>
    )
}