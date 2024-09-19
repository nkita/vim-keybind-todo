import { TodoProps } from "@/types"
import { getTimeAgo } from "@/lib/time"
import { FaRegCircle, FaCircleCheck, FaTag, FaSitemap, FaReceipt, FaCircleInfo } from "react-icons/fa6";
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { Item } from "./todo";
import { useState, MouseEvent, useEffect, Dispatch, SetStateAction } from "react"
import TextareaAutosize from 'react-textarea-autosize';
import jaJson from "@/dictionaries/ja.json"

export const Detail = ({
    todo,
    mode,
    prefix,
    isHelp,
    onClick,
    onMouseDownEvent,
    setValue,
    register
}: {
    todo: TodoProps
    mode: string
    prefix: string
    isHelp: boolean
    onClick: (prefix: string) => void
    onMouseDownEvent: (e: MouseEvent<HTMLDivElement>) => void
    setValue: UseFormSetValue<FieldValues>
    watch: UseFormRegister<FieldValues>
    register: UseFormRegister<FieldValues>
}) => {

    const [key, setKey] = useState("")
    useEffect(() => {
        if (todo) {
            setValue(`edit-content-detail-${todo.id}`, todo.detail)
            setValue(`edit-content-text-${todo.id}`, todo.text)
            setKey(todo.id) // タスク切替時にAutosizeが正しく行われないため強制的に行う
        }
    }, [todo, setValue]);

    if (!todo) return <></>
    const creationDate = todo["creationDate"]
    const creationDateLabel = creationDate ? getTimeAgo(new Date(creationDate)) : ""
    const compDate = todo["completionDate"]
    const compDateLabel = compDate ? getTimeAgo(new Date(compDate)) : ""

    const _classNameText = `w-full text-left outline-none bg-transparent focus:outline-primary rounded hover:cursor-text resize-none`
    return (
        <>
            <div className="p-4 w-full max-h-full border rounded-sm bg-card text-card-foreground scrollbar overflow-auto shadow-lg" onMouseDown={onMouseDownEvent}>
                <h2 className="flex gap-2 items-center text-primary/80 font-medium pb-4"><FaCircleInfo />詳細</h2>
                <ul className="flex flex-col gap-3 h-[90%]">
                    <li className="p-1 h-full flex font-bold items-center gap-2" onMouseDown={e => e.stopPropagation()} >
                        <span className=" flex items-center hover:cursor-pointer" onClick={_ => onClick("completion")}>
                            {
                                todo["is_complete"] ? <FaCircleCheck className="text-green-500 w-4 h-4" /> : <FaRegCircle className="w-5 h-5" />
                            }
                        </span>
                        <div onClick={_ => onClick("text")} className="flex items-center w-full" onBlur={_ => onClick("normal")}>
                            {(mode === "editDetail" && prefix === "text") ? (
                                <TextareaAutosize
                                    tabIndex={-1}
                                    maxRows={4}
                                    minRows={1}
                                    className={_classNameText}
                                    placeholder={jaJson.詳細のタスクのplaceholder}
                                    maxLength={200}
                                    {...register(`edit-content-text-${todo.id}`)}
                                />
                            ) : (
                                <button
                                    className={_classNameText}>
                                    {todo.text}
                                </button>
                            )}
                        </div>
                    </li>
                    <li className="relative h-full w-full">
                        {isHelp && <div className="absolute bottom-1 right-5 flex text-black/80 items-center justify-end text-3sm"><kbd className="opacity-80">Esc</kbd>でもどる</div>}
                        <div className={`flex w-full h-full text-sm font-light gap-1 hover:cursor-pointer`} onClick={_ => onClick("detail")} onMouseDown={e => e.stopPropagation()}>
                            <TextareaAutosize
                                key={key}
                                tabIndex={-1}
                                maxRows={15}
                                minRows={5}
                                maxLength={1000}
                                className={`font-normal h-full w-full outline-primary border text-secondary-foreground rounded-sm p-2 resize-none `}
                                placeholder={jaJson.詳細のメモのplaceholder}
                                {...register(`edit-content-detail-${todo.id}`)}
                            />
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
                    <li className="text-sm flex justify-between  text-primary/80" ><span>{creationDate && `${creationDateLabel} に作成`}</span><span> {compDate && `${compDateLabel}に完了`}</span></li>
                </ul>
            </div >
        </>
    )
}