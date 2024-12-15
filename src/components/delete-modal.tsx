import { Mode, TodoEnablesProps, TodoProps } from "@/types"
import { Modal } from "./ui/modal"
import { DialogFooter } from "./ui/dialog"
import { Button } from "./ui/button"
export const DeleteModal = (
    {
        currentIndex,
        currentPrefix,
        filterdTodos,
        prevTodos,
        mode,
        onClick,
        onDelete
    }: {
        currentIndex: number
        prevTodos: TodoProps[]
        mode: Mode
        currentPrefix: string
        filterdTodos: TodoProps[]
        onClick: (prefx: string) => void
        onDelete: (currentIndex: number, filterdTodos: TodoProps[], prevTodos: TodoProps[]) => void
    }) => {
    const isView = currentPrefix === "delete"
        && mode === "modal"

    const open = () => { }

    const close = () => {
        onClick("normal")
    }

    return (
        <>
            <Modal
                buttonLabel={""}
                dialogTitle={"タスクの削除"}
                className={"hidden"}
                open={isView}
                onClickOpen={open}
                onClickChange={e => close()}>
                <div className="pb-4 text-sm text-muted-foreground">
                    本当に削除しますか？<br />
                    削除したタスクは二度と復旧できません。
                </div>
                <DialogFooter>
                    <Button variant='outline' onClick={close}><span className="flex items-center gap-2">キャンセル <kbd className="py-0">Esc</kbd></span></Button>
                    <Button onClick={_ => onDelete(currentIndex, filterdTodos, prevTodos)}><span className="flex items-center gap-2">削除する<kbd className="text-primary-foreground py-0">Enter</kbd></span></Button>
                </DialogFooter>
            </Modal>
        </>
    )
}