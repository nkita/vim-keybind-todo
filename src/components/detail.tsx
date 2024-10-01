import { TodoProps } from "@/types"
import { getTimeAgo } from "@/lib/time"
import { FaRegCircle, FaCircleCheck, FaTag, FaSitemap, FaReceipt, FaCircleInfo } from "react-icons/fa6";
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
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

    const handleClickDetail = () => {
        if (mode !== "normal") onClick('normal')
        onClick('detail')
    }

    return (
        <>
            <div className="w-full h-full border-none  bg-transparent text-card-foreground " onMouseDown={onMouseDownEvent}>
                <div className="flex flex-col h-[83%]">
                    <div className="flex max-h-[120px] font-bold items-center gap-2 px-5 py-5 border-t-4 border-t-primary border-x  rounded-t-md bg-card " onMouseDown={e => e.stopPropagation()} >
                        <span className=" flex items-center hover:cursor-pointer" onClick={_ => onClick("completion")}>
                            {
                                todo["is_complete"] ? <FaCircleCheck /> : <FaRegCircle />
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
                                    tabIndex={-1}
                                    className={_classNameText}>
                                    {todo.text}
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="bg-card max-h-[calc(100%-100px)] w-full border-x px-5">
                        <div className="relative h-full w-full border p-1 rounded-md focus-within:border-primary">
                            <div className="h-full overflow-auto rounded-md scrollbar bg-yellow-300 ">
                                {isHelp && <div className="absolute bottom-1 right-5 flex text-black/80 items-center justify-end text-3sm"><kbd className="opacity-80">Esc</kbd>でもどる</div>}
                                <div className={`flex w-full h-full text-sm font-light gap-1 hover:cursor-pointer`} onClick={handleClickDetail} onMouseDown={e => e.stopPropagation()}>
                                    <TextareaAutosize
                                        key={key}
                                        tabIndex={-1}
                                        minRows={5}
                                        maxLength={10000}
                                        className={`font-normal h-full w-full outline-none py-1 text-secondary-foreground px-2 resize-none overflow-hidden`}
                                        placeholder={jaJson.詳細のメモのplaceholder}
                                        {...register(`edit-content-detail-${todo.id}`)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="max-h-[70px] bg-card text-card-foreground py-3 px-5 border-x">
                        {todo.context &&
                            <div className={`flex items-center text-ex-label text-sm font-light gap-1 pb-1`}>
                                <FaTag /> {todo.context}
                            </div>
                        }
                        {todo.project &&
                            <div className={`flex items-center text-ex-project text-sm font-light gap-1`}>
                                <FaSitemap />{todo.project}
                            </div>
                        }
                    </div>
                    <div className="text-sm h-[30px] pb-8 flex justify-between  text-primary/80 px-5 py-3 bg-card border-x border-b rounded-b-md  shadow-lg" ><span>{creationDate && `${creationDateLabel} に作成`}</span><span> {compDate && `${compDateLabel}に完了`}</span></div>
                </div>
            </div >
        </>
    )
}