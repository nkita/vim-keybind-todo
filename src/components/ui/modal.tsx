import { MouseEvent, MouseEventHandler, ReactNode } from "react"
import { cn } from "@/lib/utils"
import { DialogContent, Dialog, DialogTitle, DialogTrigger, DialogHeader } from "./dialog"

export const Modal = (
    {
        buttonLabel,
        dialogTitle,
        children,
        className,
        open,
        onClickChange,
        onClickOpen
    }: {
        buttonLabel?: any
        dialogTitle?: string
        children: ReactNode
        className?: string
        open?: boolean
        onClickChange: (value: boolean) => void
        onClickOpen: MouseEventHandler<HTMLButtonElement>
    }) => {

    return (
        <Dialog open={open} onOpenChange={onClickChange}>
            <DialogTrigger asChild>
                <button
                    tabIndex={-1}
                    onClick={onClickOpen}
                    className={cn(" w-full truncate", className)}
                >
                    {buttonLabel}
                </button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}