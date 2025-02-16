'use client'
import React, { Dispatch, SetStateAction } from "react"
import { TodoProps, Sort, Mode, ProjectProps, LabelProps } from "@/types"
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { List } from "./list"
import { ArrowUpDown } from "lucide-react"
import { Plus } from "lucide-react"
import { ArrowLeftRight } from "lucide-react"
import { Check } from "lucide-react"
import { Edit } from "lucide-react"

export const NormalList = (
    {
        filteredTodos,
        currentIndex,
        prefix,
        mode,
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

    const hcssMainHeight = "h-[calc(100%-80px)] sm:h-full"

    return (
        <>
            <div className="h-full ">
                {loading &&
                    <div className={`flex justify-center items-center w-full ${hcssMainHeight} bg-muted border-y-0 `}>
                        <div className="flex text-sm items-center justify-center h-full w-full ">
                            <span className="flex justify-center items-center px-10 py-5 font-semibold rounded-md bg-card text-card-foreground shadow-lg">
                                <span className="animate-bounce">Loading...</span>
                            </span>
                        </div>
                    </div>
                }
                <div className={`w-full overflow-x-hidden sm:overflow-x-auto ${loading && "hidden"}  ${hcssMainHeight} table-scrollbar`} >
                    <div className="w-full h-[50px] border-b bg-card/80 backdrop-blur-md sticky top-0 z-20 shadow-sm"></div>
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
                        displayMode={"normal"}
                        setIsComposing={setIsComposing}
                        setCurrentIndex={setCurrentIndex}
                        setExProjects={setExProjects}
                        setExLabels={setExLabels}
                        register={register}
                        rhfSetValue={rhfSetValue}
                    />
                    <section className="w-full h-[150px] hidden sm:flex gap-8 md:gap-4 text-4sm text-muted-foreground truncate justify-center items-center">
                        <div className="flex flex-col h-full justify-center items-center gap-2">
                            <kbd>k</kbd>
                            <span className="flex flex-col items-center"><ArrowUpDown className="h-4" /><span className="hidden md:inline">タスクの移動</span></span>
                            <kbd>j</kbd>
                        </div>
                        <div className="flex flex-col justify-center items-center gap-2 h-full">
                            <div className="flex gap-2 items-center">
                                <kbd>h</kbd>
                                <ArrowLeftRight className="h-4" />
                                <kbd>l</kbd>
                            </div>
                            <span className="hidden md:inline">プロジェクトの移動</span>
                        </div>
                        <div className="flex flex-col justify-center items-start gap-2 h-full">
                            <div className="flex gap-2 items-center">
                                <Edit className="h-4" />
                                <kbd>Enter</kbd>
                                <span className="hidden md:inline">タスクの編集</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <Check className="h-4" />
                                <kbd>Space</kbd>
                                <span className="hidden md:inline">タスクの完了</span>
                            </div>
                            <div className="flex gap-2 items-center">
                                <Plus className="h-4" />
                                <kbd>I</kbd>
                                <span className="hidden md:inline">タスクの追加（先頭へ）</span>
                            </div>
                        </div>
                    </section>
                </div>
                <div className={`hidden sm:block  bg-card text-accent-foreground rounded-b-sm`} />
            </div >
        </>
    )
}