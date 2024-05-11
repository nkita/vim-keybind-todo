import { TodoProps } from "@/types"
import { getTimeAgo } from "@/lib/time"
import { FaRegCircle, FaCircleCheck } from "react-icons/fa6";
export const Detail = ({
    todo,
    onClick
}: {
    todo: TodoProps
    onClick: (prefix: string) => void
}) => {
    if (!todo) return <></>
    const creationDate = todo["creationDate"]
    const creationDateLabel = creationDate ? getTimeAgo(new Date(creationDate)) : ""
    const compDate = todo["completionDate"]
    const compDateLabel = compDate ? getTimeAgo(new Date(compDate)) : ""
    return (
        <div className="p-4 w-full border rounded-md bg-white border-primary/90">
            <h2 className="text-primary/80 font-medium text-center py-4">詳細</h2>
            <ul className="flex flex-col gap-2">
                <li className="flex font-bold items-center gap-2" >
                    <span className="w-5 h-5 flex items-center hover:cursor-pointer" onClick={_ => onClick("completion")}>
                        {
                            todo["isCompletion"] ? <FaCircleCheck className="text-green-500 w-5 h-5" /> : <FaRegCircle className="w-5 h-5" />
                        }
                    </span>
                    <span className={`${todo["isCompletion"] ? "text-muted-foreground/50" : "text-primary"}`}>
                        {todo["text"]}
                    </span>
                </li>
                <li className="text-sm flex justify-between  text-gray-500" ><span>{creationDate && `${creationDateLabel} に作成`}</span><span> {compDate && `${compDateLabel}に完了`}</span></li>
            </ul>
        </div >
    )
}