'use client'
import React, { Dispatch, SetStateAction } from "react"
import { TodoProps, Sort, Mode, ProjectProps, LabelProps } from "@/types"
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { List } from "./list"
import { ListTodo } from "lucide-react"
import { QuickUsage } from "../usage-quick"

export const NormalList = (
    {
        filteredTodos,
        currentIndex,
        prefix,
        mode,
        rowHeight,
        exProjects,
        exLabels,
        currentProjectId,
        sort,
        loading,
        onClick,
        setIsComposing,
        setCurrentIndex,
        setExProjects,
        setExLabels,
        register,
        rhfSetValue,
    }: {
        filteredTodos: TodoProps[]
        currentIndex: number
        prefix: string
        mode: Mode
        rowHeight: number
        exProjects: ProjectProps[]
        exLabels: LabelProps[]
        currentProjectId: string
        sort: Sort
        loading: Boolean
        onClick: (id: number, prefix: string) => void
        setIsComposing: Dispatch<SetStateAction<boolean>>
        setCurrentIndex: Dispatch<SetStateAction<number>>
        setExProjects: Dispatch<SetStateAction<ProjectProps[]>>
        setExLabels: Dispatch<SetStateAction<LabelProps[]>>
        register: UseFormRegister<FieldValues>
        rhfSetValue: UseFormSetValue<FieldValues>
    }
) => {


    return (
        <>
            <div className="h-full ">
                {loading &&
                    <div className={`flex justify-center items-center w-full bg-muted border-y-0 `}>
                        <div className="flex text-sm items-center justify-center h-full w-full ">
                            <span className="flex justify-center items-center px-10 py-5 font-semibold rounded-md bg-card text-card-foreground shadow-lg">
                                <span className="animate-bounce">Loading...</span>
                            </span>
                        </div>
                    </div>
                }
                <div className={`relative w-full ${loading && "hidden"} h-full overflow-y-auto `} >
                    <div className="relative z-20 w-full h-full">
                        <div className="hidden sm:flex text-muted-foreground text-xs items-center justify-between w-full h-[50px] border-b bg-card sticky top-0 z-30 shadow-sm">
                            <span className="px-4 items-center gap-2 flex"><ListTodo className="w-4 h-4" />リストモード</span>
                            {/* <span className="px-4">タイトル</span> */}
                        </div>
                        <List
                            filteredTodos={filteredTodos}
                            currentIndex={currentIndex}
                            prefix={prefix}
                            mode={mode}
                            exProjects={exProjects}
                            exLabels={exLabels}
                            currentProjectId={currentProjectId}
                            sort={sort}
                            loading={loading}
                            onClick={onClick}
                            rowHeight={rowHeight}
                            displayMode={"normal"}
                            setIsComposing={setIsComposing}
                            setCurrentIndex={setCurrentIndex}
                            setExProjects={setExProjects}
                            setExLabels={setExLabels}
                            register={register}
                            rhfSetValue={rhfSetValue}
                        />
                    </div>
                    <QuickUsage className="absolute bottom-2 " />
                </div>
            </div >
        </>
    )
}