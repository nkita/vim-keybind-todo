import { TodoProps } from "@/types"
import { getTimeAgo } from "@/lib/time"
import { FaRegCircle, FaCircleCheck, FaTag, FaSitemap, FaReceipt } from "react-icons/fa6";
import { UseFormRegister, FieldValues } from "react-hook-form"
import { Item } from "./todo";

export const Detail = ({
    todo,
    mode,
    prefix,
    onClick,
    register
}: {
    todo: TodoProps
    mode: string
    prefix: string
    onClick: (prefix: string) => void
    register: UseFormRegister<FieldValues>
}) => {
    if (!todo) return <></>
    const creationDate = todo["creationDate"]
    const creationDateLabel = creationDate ? getTimeAgo(new Date(creationDate)) : ""
    const compDate = todo["completionDate"]
    const compDateLabel = compDate ? getTimeAgo(new Date(compDate)) : ""
    return (
        <div className="p-4 w-full border rounded-md bg-white border-primary/90">
            <h2 className="text-primary/80 font-medium text-center pb-4">詳細</h2>
            <ul className="flex flex-col gap-3">
                <li className="flex font-bold items-center gap-2" >
                    <span className="w-4 h-4 flex items-center hover:cursor-pointer" onClick={_ => onClick("completion")}>
                        {
                            todo["is_complete"] ? <FaCircleCheck className="text-green-500 w-4 h-4" /> : <FaRegCircle className="w-5 h-5" />
                        }
                    </span>
                    <span className={`${todo["is_complete"] ? "text-muted-foreground/50" : "text-primary"}`}>
                        {todo["text"]}
                    </span>
                </li>
                <li>
                    <div className={`flex  text-sm font-light gap-1 hover:cursor-pointer`} onClick={_ => onClick("detail")}>
                        <FaReceipt className="mt-2" />
                        <Item
                            t={todo}
                            index={0}
                            currentIndex={0}
                            prefix={"detail"}
                            currentPrefix={prefix}
                            mode={mode}
                            className="text-sm w-full"
                            label={""}
                            register={register} />
                    </div>
                </li>
                {todo.context &&
                    <li>
                        <div className={`flex items-center text-ex-label text-sm font-light gap-1`}>
                            <FaTag /> {todo.context}
                        </div>
                    </li>
                }
                {todo.project &&
                    <li>
                        <div className={`flex items-center text-ex-project text-sm font-light gap-1`}>
                            <FaSitemap />{todo.project}
                        </div>
                    </li>
                }
                <li className="text-sm flex justify-between  text-gray-500" ><span>{creationDate && `${creationDateLabel} に作成`}</span><span> {compDate && `${compDateLabel}に完了`}</span></li>
            </ul>
        </div >
    )
}