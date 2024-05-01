import { TodoProps } from "@/types"
import { getTimeAgo } from "@/lib/time"
import { FaArrowUpZA, FaRegCircle, FaCircleCheck, FaTag, FaSitemap, FaList, FaRegCircleCheck } from "react-icons/fa6";
export const Detail = ({
    todo
}: {
    todo: TodoProps
}) => {
    if (!todo) return <></>
    const creationDate = todo["creationDate"]
    const creationDateLabel = creationDate ? getTimeAgo(new Date(creationDate)) : ""
    const compDate = todo["completionDate"]
    const compDateLabel = compDate ? getTimeAgo(new Date(compDate)) : ""
    return (
        <div className="p-4 w-full border rounded-md shadow-lg bg-white">
            <ul>
                <li className="flex font-bold items-center gap-2">{todo["isCompletion"] && <FaCircleCheck className="text-green-500 scale-125" />}{todo["text"]}</li>
                <li className="text-sm flex justify-between  text-gray-500" ><span>{creationDate && `${creationDateLabel}に作成`}</span><span> {compDate && `${compDateLabel}に完了`}</span></li>
            </ul>
        </div>
    )
}