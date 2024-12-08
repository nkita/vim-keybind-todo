import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { MouseEvent, MouseEventHandler, ReactNode } from "react"
import { cn } from "@/lib/utils"

export const Modal = (
    {
        buttonLabel,
        dialogTitle,
        children,
        className,
        open,
        onClickClose,
        onClickOpen
    }: {
        buttonLabel?: string
        dialogTitle?: string
        children: ReactNode
        className?: string
        open: boolean
        onClickClose: (value: boolean) => void
        onClickOpen: MouseEventHandler<HTMLButtonElement>
    }) => {

    return (
        <>
            <button
                tabIndex={-1}
                onClick={onClickOpen}
                className={cn(" w-full truncate", className)}
            >
                {buttonLabel}
            </button>

            {open && <div className="fixed top-0 left-0 bg-black/50 z-40 w-full h-full" />}
            <Dialog open={open} as="div" className="relative z-40 focus:outline-none " onClose={onClickClose} >
                <div className="fixed inset-0 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel>
                            <div
                                className="w-full max-w-md rounded-xl bg-white border p-6 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0">
                                <DialogTitle as="h3" className="text-base/7 font-medium pb-2">
                                    {dialogTitle}
                                </DialogTitle>
                                {children}
                            </div>
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}