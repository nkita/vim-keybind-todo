import { TodoProps } from "@/types"
import { getTimeAgo } from "@/lib/time"
import { FaRegCircle, FaCircleCheck, FaTag, FaSitemap, FaReceipt, FaCircleInfo } from "react-icons/fa6";
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { useState, MouseEvent, useEffect, Dispatch, SetStateAction } from "react"
import TextareaAutosize from 'react-textarea-autosize';
import jaJson from "@/dictionaries/ja.json"
import { Box, CircleX, Plus, SquareXIcon, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

    const zIndex = "z-20"

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
            <div className="w-full h-full bg-transparent text-card-foreground " onMouseDown={onMouseDownEvent}>
                <div className="w-full flex flex-col h-[83%]">
                    <div className={`flex max-h-[120px] w-full  font-bold items-center gap-2 px-5 py-5 border-x border-t rounded-t-md bg-card ${zIndex} `} onMouseDown={e => e.stopPropagation()} >
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
                    <div className={`bg-card max-h-[calc(100%-150px)] w-full border-x px-5 ${zIndex}`} onMouseDown={e => e.stopPropagation()} >
                        <div className="relative h-full w-full border p-1 rounded-md focus-within:border-primary">
                            <div className="h-full overflow-auto rounded-md scrollbar">
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
                        </div>
                    </div>
                    <div className={`w-full max-h-[150px] bg-card text-card-foreground py-5 px-5 border-x ${zIndex}`} onMouseDown={e => e.stopPropagation()} >
                        {todo.context ? (
                            <div className={`flex items-center text-ex-label text-sm font-light gap-1 pb-1 py-2`}>
                                <Tag className="h-4" /> {todo.context}
                                <Button variant="ghost" size="icon" className="w-4 h-4 text-destructive rounded-full" onClick={_ => handleClickDelete("context")}><X className="w-4 h-4" /></Button>
                            </div>
                        ) : (
                            <button className="flex my-2 gap-2 items-center text-xs text-muted-foreground rounded-md" onClick={_ => onClick("context")}>
                                <span className="flex items-center gap-1"><Tag className="h-4" />ラベルを追加</span>
                            </button>
                        )}
                        {todo.project ? (
                            <div className={`flex items-center text-ex-project text-sm font-light gap-1 pt-3`}>
                                <span className="flex items-center gap-1"><Box className="h-4" />{todo.project} </span>
                                <Button variant="ghost" size="icon" className="w-4 h-4 text-destructive rounded-full" onClick={_ => handleClickDelete('project')}><X className="w-4 h-4" /></Button>
                            </div>
                        ) : (
                            <button  className="flex my-2 gap-3 items-center text-xs text-muted-foreground rounded-md" onClick={_ => onClick("project")}>
                                <span className="flex items-center"><Box className="h-4" />プロジェクトを追加 </span>
                            </button>
                        )}
                    </div>
                    <div
                        onMouseDown={e => e.stopPropagation()}
                        className={`w-full text-sm h-[45px] pt-4 pb-12  px-5 flex justify-between  text-primary/80  bg-card border-x border-b rounded-b-md  shadow-md ${zIndex}`} ><span>{creationDate && `${creationDateLabel} に作成`}</span><span> {compDate && `${compDateLabel}に完了`}</span></div>
                </div>
            </div >
        </>
    )
}