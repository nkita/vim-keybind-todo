'use client'
import React, { Dispatch, SetStateAction } from "react"
import { TodoProps, Sort, Mode, ProjectProps, LabelProps } from "@/types"
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { List } from "./list"

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
                <div className="w-full h-[50px] border-y bg-muted sticky top-0 z-20 shadow-sm"></div>
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
                    setIsComposing={setIsComposing}
                    setCurrentIndex={setCurrentIndex}
                    setExProjects={setExProjects}
                    setExLabels={setExLabels}
                    register={register}
                    rhfSetValue={rhfSetValue}
                />
                <div className={`hidden sm:block  bg-card text-accent-foreground rounded-b-sm`} />
            </div >
        </>
    )
}