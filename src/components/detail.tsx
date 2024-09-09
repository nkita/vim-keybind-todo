import { TodoProps } from "@/types"
import { getTimeAgo } from "@/lib/time"
import { FaRegCircle, FaCircleCheck, FaTag, FaSitemap, FaReceipt } from "react-icons/fa6";
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { Item } from "./todo";
import { useState, MouseEvent, useEffect, Dispatch, SetStateAction } from "react"

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
    useEffect(() => {
        if (todo) {
            setValue(`edit-content-detail-${todo.id}`, todo.detail)
            setValue(`edit-content-text-${todo.id}`, todo.text)
        }
    }, [todo, setValue]);

    if (!todo) return <></>
    const creationDate = todo["creationDate"]
    const creationDateLabel = creationDate ? getTimeAgo(new Date(creationDate)) : ""
    const compDate = todo["completionDate"]
    const compDateLabel = compDate ? getTimeAgo(new Date(compDate)) : ""

    const _classNameText = `p-1 w-full text-left outline-none bg-transparent focus:outline-sky-300 rounded hover:cursor-text`
    return (
        <>
            <div className="p-4 w-full h-full border rounded-sm bg-white border-primary/90 overflow-auto" onMouseDown={onMouseDownEvent}>
                <h2 className="text-primary/80 font-medium text-center pb-4">詳細</h2>
                <ul className="flex flex-col gap-3 h-[90%]">
                    <li className="flex font-bold items-center gap-2" onMouseDown={e => e.stopPropagation()} >
                        <span className="w-4 h-4 flex items-center hover:cursor-pointer" onClick={_ => onClick("completion")}>
                            {
                                todo["is_complete"] ? <FaCircleCheck className="text-green-500 w-4 h-4" /> : <FaRegCircle className="w-5 h-5" />
                            }
                        </span>
                        <div onClick={_ => onClick("text")} className="w-full">
                            {mode === "editDetail" ? (
                                <textarea
                                    tabIndex={-1}
                                    className={_classNameText}
                                    rows={2}
                                    placeholder="詳細を入力…"
                                    {...register(`edit-content-text-${todo.id}`)}
                                />
                            ) : (
                                <button
                                    className={_classNameText}>
                                    {todo.text}
                                </button>
                            )}

                            {/* <Item
                                t={todo}
                                index={0}
                                currentIndex={0}
                                prefix={"text"}
                                position="content"
                                currentPrefix={prefix}
                                mode={mode}
                                className={`${todo["is_complete"] ? "text-muted-foreground/50" : "text-primary"} break-words`}
                                label={todo.text}
                                register={register} /> */}
                        </div>
                    </li>
                    <li className="relative h-full w-full">
                        {isHelp && <div className="absolute bottom-1 right-5 flex text-black/80 items-center justify-end text-3sm"><kbd className="opacity-80">Esc</kbd>でもどる</div>}
                        <div className={`flex w-full text-sm font-light gap-1 hover:cursor-pointer h-full`} onClick={_ => onClick("detail")} onMouseDown={e => e.stopPropagation()}>
                            <textarea
                                tabIndex={-1}
                                className={"font-normal w-full outline-sky-300 bg-gray-50 rounded-sm p-1 resize-none h-full"}
                                rows={10}
                                placeholder="詳細を入力…"
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
                    <li className="text-sm flex justify-between  text-gray-500" ><span>{creationDate && `${creationDateLabel} に作成`}</span><span> {compDate && `${compDateLabel}に完了`}</span></li>
                </ul>
            </div >
        </>
    )
}