import { Dialog, DialogPanel, DialogTitle, Description } from "@headlessui/react"
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

    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation()
    }

    return (
        <>
            <button
                onClick={onClickOpen}
                className={cn("truncate w-full", className)}
            >
                {buttonLabel}
            </button>
            {open && <div className="fixed top-0 left-0 bg-gray-400 bg-opacity-50 z-10 w-full h-full backdrop-blur-sm" />}
            <Dialog open={open} as="div" className="relative z-20 focus:outline-none " onClose={onClickClose} >
                <div className="fixed inset-0 z-20 w-screen overflow-y-auto" onMouseDown={handleMouseDown}>
                    <div className="flex min-h-full items-center justify-center p-4">
                        <DialogPanel
                            translate="yes"
                            className="w-full max-w-md rounded-xl bg-white border  p-6 duration-300 ease-out data-[closed]:transform-[scale(95%)] data-[closed]:opacity-0"
                        >
                            <DialogTitle as="h3" className="text-base/7 font-medium pb-2">
                                {dialogTitle}
                            </DialogTitle>
                            {children}
                        </DialogPanel>
                    </div>
                </div>
            </Dialog>
        </>
    )
}