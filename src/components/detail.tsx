import { TodoProps, ProjectProps, LabelProps } from "@/types"
import { getTimeAgo } from "@/lib/time"
import { FaRegCircle, FaCircleCheck, FaTag, FaSitemap, FaReceipt, FaCircleInfo } from "react-icons/fa6";
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { useState, MouseEvent, useEffect, Dispatch, SetStateAction } from "react"
import TextareaAutosize from 'react-textarea-autosize';
import jaJson from "@/dictionaries/ja.json"
import { Box, CircleX, Plus, SquareXIcon, Tag, X } from "lucide-react";
import { find as lfind } from "lodash"
import { ExTextarea } from "./ui/ex-textarea";

const zIndex = "z-20"
export const Detail = ({
    todo,
    exProjects,
    exLabels,
    mode,
    prefix,
    onClick,
    onMouseDownEvent,
    setValue,
    register
}: {
    todo: TodoProps
    exProjects: ProjectProps[]
    exLabels: LabelProps[]
    mode: string
    prefix: string
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

    const _classNameText = `w-full text-left outline-none  focus:outline-primary rounded hover:cursor-text resize-none p-1`

    const handleClickDetail = () => {
        if (mode !== "normal") onClick('normal')
        onClick('detail')
    }

    const handleClickDelete = (prefix: 'labelId' | 'projectId') => {
        setValue(`edit-list-${prefix}-${todo.id}`, '')
        onClick('normal')
    }

    return (
        <>
            <div className="w-full h-full text-card-foreground relative" onMouseDown={onMouseDownEvent}>
                <div className="w-full h-full overflow-auto scroll-bar">
                    <div className={`flex sticky top-0 w-full text-default border-b-2 border-muted font-bold items-center gap-2 bg-card px-5 z-30 h-[50px] `} onMouseDown={e => e.stopPropagation()} >
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
                    <div className={`w-full p-5 bg-background relative`} >
                        <div className="relative h-full w-full border pt-1 mt-2  rounded-md focus-within:border-primary bg-card">
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
                                <div className="w-full h-full overflow-hidden pb-6">
                                    <ExTextarea
                                        t={todo}
                                        mode={mode}
                                        prefix={prefix}
                                        register={register}
                                        setValue={setValue}
                                    />
                                    {/* <TextareaAutosize
                                        key={key}
                                        tabIndex={-1}
                                        minRows={5}
                                        maxLength={10000}
                                        className={`font-normal h-full w-full outline-none py-1 text-secondary-foreground px-2 resize-none overflow-hidden bg-card`}
                                        placeholder={jaJson.詳細のメモのplaceholder}
                                        {...register(`edit-content-detail-${todo.id}`)}
                                    /> */}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pb-4 text-3sm text-muted-foreground">※URLは自動的にリンクへ変換します。</div>
                        <div className="flex flex-wrap gap-2">
                            {todo.labelId ? (
                                <BottomLabel type={"labelId"} onClick={_ => onClick("labelId")} handleClick={handleClickDelete}>
                                    <Tag className="h-4 w-4" />{lfind(exLabels, { id: todo.labelId })?.name}
                                </BottomLabel>
                            ) : (
                                <BottomButton handleClick={_ => onClick("labelId")} type={"labelId"}>
                                    <Tag className="h-4 w-4" />ラベルを追加
                                </BottomButton>
                            )}
                            {todo.projectId ? (
                                <BottomLabel type={"projectId"} onClick={_ => onClick("projectId")} handleClick={handleClickDelete}>
                                    <Box className="h-4 w-4" /> {lfind(exProjects, { id: todo.projectId })?.name}
                                </BottomLabel>
                            ) : (
                                <BottomButton handleClick={_ => onClick("projectId")} type={"projectId"}>
                                    <Box className="h-4" />プロジェクトを追加
                                </BottomButton>
                            )}
                        </div>
                    </div>
                    <div className="h-16 sm:h-0"></div>
                </div>
                <div
                    className={`absolute bottom-0 border-muted border-x-0 w-full text-xs px-5 py-2 flex justify-between text-muted-foreground bg-card ${zIndex}`} >
                    <span>{creationDate && `${creationDateLabel} に作成`}</span><span> {compDate && `${compDateLabel}に完了`}</span>
                </div>
            </div >
        </>
    )
}

interface BottomProps {
    type: "labelId" | "projectId";
    children: React.ReactNode;
    handleClick: (type: "labelId" | "projectId") => void;
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
}
const BottomButton = ({ type, children, handleClick }: BottomProps) => {
    return (
        <button className="bg-card text-card-foreground border rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            onClick={_ => handleClick(type)}>
            <span className="flex items-center text-xs text-nowrap">{children}</span>
        </button>
    )
}
const BottomLabel = ({ children, type, onClick, handleClick }: BottomProps) => {
    const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
        handleClick(type)
        e.stopPropagation()
        e.preventDefault()
    }
    return (
        <div className="h-full my-auto">
            <div className={`flex items-center px-2 bg-card py-1 border ${type === "projectId" ? "text-ex-project" : "text-ex-label"} rounded-sm`}>
                <button onClick={onClick} className={`flex gap-1 font-light  items-center text-2sm`}>
                    {children}
                </button>
                <button className="ml-3 text-destructive hover:bg-accent hover:text-accent-foreground" onClick={handleDelete}><X className="w-4 h-4" /></button>
            </div>
        </div>
    )
} 