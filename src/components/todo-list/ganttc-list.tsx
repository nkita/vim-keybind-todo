'use client'
import React, { Dispatch, SetStateAction, useEffect } from "react"
import { TodoProps, Sort, Mode, ProjectProps, LabelProps } from "@/types"
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { List } from "./list"
import Ganttc from "./ganttc"
import { ResizableHandle, ResizablePanel } from "../ui/resizable"
import { ResizablePanelGroup } from "../ui/resizable"

export const GanttcList = (
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
        todoMode,
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
        todoMode: string
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
    const [isDragging, setIsDragging] = React.useState(false);
    const [dividerPosition, setDividerPosition] = React.useState(50);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const innerContainerRef = React.useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
    };

    const handleMouseMove = React.useCallback((e: MouseEvent) => {
        if (!isDragging || !containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const newPosition = ((e.clientX - containerRect.left) / containerRect.width) * 100;

        // containerRefの幅に基づいて制限（10%から80%の間）
        const clampedPosition = Math.min(Math.max(newPosition, 10), 80);
        setDividerPosition(clampedPosition);
    }, [isDragging]);


    const handleMouseUp = React.useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return (
        <>
            <div className="h-full">
                {loading ? (

                    <div className={`flex justify-center items-center w-full ${todoMode === "List" ? hcssMainHeight : ""} bg-muted border-y-0 `}>
                        <div className="flex text-sm items-center justify-center h-full w-full ">
                            <span className="flex justify-center items-center px-10 py-5 font-semibold rounded-md bg-card text-card-foreground shadow-lg">
                                <span className="animate-bounce">Loading...</span>
                            </span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div ref={containerRef} className="h-full flex overflow-auto relative">
                            <div
                                ref={innerContainerRef}
                                style={{ width: `${dividerPosition}%`, minWidth: `${dividerPosition}%` }}
                                className="h-full sticky left-0 z-10 shadow-md"
                            >
                                <div className="w-full h-[50px] border-y bg-muted sticky top-0 z-20 shadow-md"></div>
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
                                    todoMode={todoMode}
                                    setIsComposing={setIsComposing}
                                    setCurrentIndex={setCurrentIndex}
                                    setExProjects={setExProjects}
                                    setExLabels={setExLabels}
                                    register={register}
                                    rhfSetValue={rhfSetValue}
                                />
                            </div>
                            <div
                                className="fixed w-[2px] h-[87%] bg-gray-200 cursor-col-resize hover:bg-gray-400 active:bg-primary z-30"
                                style={{ 
                                    left: containerRef.current 
                                        ? containerRef.current.getBoundingClientRect().left + (containerRef.current.clientWidth * dividerPosition / 100)
                                        : 0,
                                }}
                                onMouseDown={handleMouseDown}
                            />
                            <Ganttc />
                        </div>
                        <div className={`hidden sm:block bg-card text-accent-foreground rounded-b-sm`} />
                    </>
                )}
            </div>
        </>
    )
}