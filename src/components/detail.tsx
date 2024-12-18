import { TodoProps } from "@/types"
import { getTimeAgo } from "@/lib/time"
import { FaRegCircle, FaCircleCheck, FaTag, FaSitemap, FaReceipt, FaCircleInfo } from "react-icons/fa6";
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { useState, MouseEvent, useEffect, Dispatch, SetStateAction } from "react"
import TextareaAutosize from 'react-textarea-autosize';
import jaJson from "@/dictionaries/ja.json"
import { Box, CircleX, Plus, SquareXIcon, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const zIndex = "z-20"
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
    const compDateLabel = compDate ? getTimeAgo(new Date(compDate.split('.')[0])) : ""

    const _classNameText = `w-full text-left outline-none bg-transparent focus:outline-primary rounded hover:cursor-text resize-none p-1`


    const handleClickDetail = () => {
        if (mode !== "normal") onClick('normal')
        onClick('detail')
    }

    const handleClickDelete = (prefix: 'context' | 'project') => {
        setValue(`edit-list-${prefix}-${todo.id}`, '')
        onClick('normal')
    }

    return (
        <>
            <div className="w-full h-full text-card-foreground bg-secondary/60" onMouseDown={onMouseDownEvent}>
                <div className="w-full h-full overflow-auto scroll-bar">
                    <div className={`flex sticky top-0  w-full border-b border-secondary font-bold items-center gap-2 bg-card px-5 py-5 z-30 rounded-b-lg `} onMouseDown={e => e.stopPropagation()} >
                        <span className=" flex items-center hover:cursor-pointer" onClick={_ => onClick("completion")}>
                            {
                                todo["is_complete"] ? <FaCircleCheck /> : <FaRegCircle />
                            }
                        </span>
                        <div onClick={_ => onClick("text")} className="flex  items-center w-full">
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
                            <button onClick={e => {
                                e.stopPropagation()
                                e.preventDefault()
                                onClick("normal")
                            }} className="text-muted-foreground w-5 sm:w-0 h-5 sm:h-0 block sm:hidden">
                                <X className="h-5 w-5 m-1" />
                            </button>

                        </div>
                    </div>
                    <div className={`w-full p-5 `} onMouseDown={e => e.stopPropagation()} >
                        <div className="relative h-full w-full border py-2 my-4 bg-card rounded-md focus-within:border-primary">
                            <div className="absolute bottom-2 right-5 flex text-black/80 items-center justify-end text-3sm">
                                {mode === "editDetail" ? (
                                    <span><kbd className="opacity-80">Esc</kbd>でもどる</span>
                                ) : (
                                    <span><kbd className="opacity-80">D</kbd>で編集</span>
                                )}
                            </div>
                            <div className={`flex w-full h-full text-sm font-light gap-1 hover:cursor-pointer`} onMouseDown={e => {
                                handleClickDetail()
                                e.stopPropagation()
                            }}>
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
                        <div className="flex flex-wrap gap-2">
                            {todo.context ? (
                                <BottomLabel type={"context"} handleClick={handleClickDelete}>
                                    <Tag className="h-4 w-4" />{todo.context}
                                </BottomLabel>
                            ) : (
                                <BottomButton handleClick={onClick} type={"context"}>
                                    <Tag className="h-4 w-4" />ラベルを追加
                                </BottomButton>
                            )}
                            {todo.project ? (
                                <BottomLabel type={"project"} handleClick={handleClickDelete}>
                                    <Box className="h-4 w-4" />{todo.project}
                                </BottomLabel>
                            ) : (
                                <BottomButton handleClick={onClick} type={"project"}>
                                    <Box className="h-4" />プロジェクトを追加
                                </BottomButton>
                            )}
                        </div>
                        <div className="h-[3rem]" />
                    </div>
                    <div
                        onMouseDown={e => e.stopPropagation()}
                        className={`absolute h-[3rem] bottom-0 border-t border-secondary border-x-0 w-full text-xs py-4 px-5 flex justify-between text-muted-foreground bg-card ${zIndex}`} >
                        <span>{creationDate && `${creationDateLabel} に作成`}</span><span> {compDate && `${compDateLabel}に完了`}</span>
                    </div>
                    <div className="h-16 sm:h-0"></div>
                </div>
            </div >
        </>
    )
}

interface BottomProps {
    type: "context" | "project";
    children: React.ReactNode;
    handleClick: (type: "context" | "project") => void;
}
const BottomButton = ({ children, handleClick }: BottomProps) => {
    return (
        <button className="bg-card text-card-foreground border rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            onClick={_ => handleClick("context")}>
            <span className="flex items-center text-xs text-nowrap">{children}</span>
        </button>
    )
}
const BottomLabel = ({ children, type, handleClick }: BottomProps) => {
    return (
        <div className={`flex items-center gap-2`}>
            <span className={`flex gap-1 font-light px-2 py-1 bg-card items-center border ${type === "project" ? "border-ex-project text-ex-project" : "border-ex-label text-ex-label"}  rounded-full text-xs`}>
                {children}
                <button className="ml-3 text-destructive hover:bg-accent hover:text-accent-foreground" onClick={_ => handleClick(type)}><X className="w-4 h-4" /></button>
            </span>
        </div>
    )
} 