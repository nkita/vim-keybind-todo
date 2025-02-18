'use client'
import React, { Dispatch, SetStateAction, useEffect } from "react"
import { TodoProps, Sort, Mode, ProjectProps, LabelProps } from "@/types"
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { List } from "./list"
import Ganttc from "./ganttc"
import { useLocalStorage } from "@/hook/useLocalStrorage"
import { GanttChart } from "lucide-react"

interface GanttcListProps {
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
    onChangePeriod: (todoId: string, startDate: Date, endDate: Date) => void
}

export const GanttcList = ({
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
    onChangePeriod
}: GanttcListProps) => {
    const hcssMainHeight = "h-[calc(100%-80px)] sm:h-full"
    const [isDragging, setIsDragging] = React.useState(false);
    const [dividerPosition, setDividerPosition] = useLocalStorage("ganttc-divider-position", 50)
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
    }, [isDragging, setDividerPosition]);


    const handleMouseUp = React.useCallback(() => {
        setIsDragging(false);
    }, []);

    // ウィンドウリサイズ時のハンドラーを追加
    const handleResize = React.useCallback(() => {
        if (containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const currentPixelPosition = containerRect.width * (dividerPosition / 100);
            const newPosition = (currentPixelPosition / containerRect.width) * 100;
            const clampedPosition = Math.min(Math.max(newPosition, 10), 80);
            setDividerPosition(clampedPosition);
        }
    }, [dividerPosition, setDividerPosition]);

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

    // リサイズイベントリスナーを追加
    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [handleResize]);

    return (
        <>
            <div className="h-full">
                {loading ? (

                    <div className={`flex justify-center items-center w-full ${hcssMainHeight} bg-muted border-y-0 `}>
                        <div className="flex text-sm items-center justify-center h-full w-full ">
                            <span className="flex justify-center items-center px-10 py-5 font-semibold rounded-md bg-card text-card-foreground shadow-lg">
                                <span className="animate-bounce">Loading...</span>
                            </span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div ref={containerRef} className="h-full flex overflow-auto scrollbar relative">
                            <div
                                ref={innerContainerRef}
                                style={{ width: `${dividerPosition}%`, minWidth: `${dividerPosition}%` }}
                                className={`sticky left-0 z-10`}
                            >
                                <div className="flex text-muted-foreground text-xs items-center justify-between w-full h-[50px] border-b bg-card/80 backdrop-blur-sm sticky top-0 z-20 shadow-sm">
                                    <span className="px-4 items-center gap-2 flex"><GanttChart className="w-4 h-4" />ガントチャートモード</span>
                                    {/* <span className="px-4">タイトル / 期間</span> */}
                                </div>
                                <div className="overflow-x-scroll table-scrollbar">
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
                                        onChangePeriod={onChangePeriod}
                                        register={register}
                                        rhfSetValue={rhfSetValue}
                                    />
                                </div>
                            </div>
                            <div
                                className="fixed w-[1px] h-[calc(100%-125px)] cursor-col-resize z-20 border-r"
                                style={{
                                    left: containerRef.current
                                        ? containerRef.current.getBoundingClientRect().left + (containerRef.current.clientWidth * dividerPosition / 100)
                                        : 0,
                                }}
                                onMouseDown={handleMouseDown}
                            />
                            <Ganttc
                                filteredTodos={filteredTodos}
                                currentIndex={currentIndex}
                                prefix={prefix}
                                mode={mode}
                                exProjects={exProjects}
                                exLabels={exLabels}
                                currentProjectId={currentProjectId}
                                onChangePeriod={onChangePeriod}
                            />
                        </div>
                        <div className={`hidden sm:block bg-card text-accent-foreground rounded-b-sm`} />
                    </>
                )}
            </div>
        </>
    )
}