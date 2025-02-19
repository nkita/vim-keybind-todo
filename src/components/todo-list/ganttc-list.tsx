'use client'
import React, { Dispatch, SetStateAction, useEffect, useState, useCallback, useRef } from "react"
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
    const MIN_WIDTH = 200;
    const [headerWidth, setHeaderWidth] = useState(400);
    const dragRef = useRef({
        isDragging: false,
        startX: 0,
        startWidth: 0
    });

    // useRefを使用して現在のヘッダー幅を追跡
    const headerWidthRef = useRef(headerWidth);

    // 画面幅の状態管理
    const [maxWidth, setMaxWidth] = useState(() => window.innerWidth * 0.8);

    // ヘッダー幅が最大幅を超えないように監視
    useEffect(() => {
        headerWidthRef.current = headerWidth;
    }, [headerWidth]);

    useEffect(() => {
        const handleResize = () => {
            const newMaxWidth = window.innerWidth * 0.8;
            setMaxWidth(newMaxWidth);

            // 現在のヘッダー幅が新しい最大幅を超えている場合は調整
            if (headerWidthRef.current > newMaxWidth) {
                setHeaderWidth(newMaxWidth);
            }
        };

        // 初期レンダリング時にも実行
        handleResize();

        // デバウンスを適用してパフォーマンスを改善
        let timeoutId: NodeJS.Timeout;
        const debouncedResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleResize, 100);
        };

        window.addEventListener('resize', debouncedResize);
        return () => {
            window.removeEventListener('resize', debouncedResize);
            clearTimeout(timeoutId);
        };
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        dragRef.current = {
            isDragging: true,
            startX: e.pageX,
            startWidth: headerWidth
        };
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!dragRef.current.isDragging) return;

        const diff = e.pageX - dragRef.current.startX;
        const newWidth = dragRef.current.startWidth + diff;
        const clampedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), maxWidth);
        setHeaderWidth(clampedWidth);
    }, [maxWidth]);

    const handleMouseUp = useCallback(() => {
        dragRef.current.isDragging = false;
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    // ウィンドウリサイズ時のハンドラーを修正
    const handleResize = React.useCallback(() => {
        if (containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const currentPixelPosition = containerRect.width * (dividerPosition / 100);
            const newPosition = (currentPixelPosition / containerRect.width) * 100;
            const clampedPosition = Math.min(Math.max(newPosition, 10), 80);

            // 現在の値と新しい値が異なる場合のみ更新
            if (Math.abs(clampedPosition - dividerPosition) > 0.1) {
                setDividerPosition(clampedPosition);
            }
        }
    }, [dividerPosition, setDividerPosition]);

    // リサイズイベントリスナーにデバウンスを追加
    useEffect(() => {
        let timeoutId: NodeJS.Timeout;
        const debouncedResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleResize, 100);
        };

        window.addEventListener('resize', debouncedResize);
        return () => {
            window.removeEventListener('resize', debouncedResize);
            clearTimeout(timeoutId);
        };
    }, [handleResize]);

    return (
        <>
            {loading ? (

                <div className={`flex justify-center items-center w-full ${hcssMainHeight} bg-muted border-y-0 `}>
                    <div className="flex text-sm items-center justify-center h-full w-full ">
                        <span className="flex justify-center items-center px-10 py-5 font-semibold rounded-md bg-card text-card-foreground shadow-lg">
                            <span className="animate-bounce">Loading...</span>
                        </span>
                    </div>
                </div>
            ) : (
                <div className="w-full h-full overflow-x-scroll table-scrollbar">
                    <Ganttc
                        filteredTodos={filteredTodos}
                        currentIndex={currentIndex}
                        prefix={prefix}
                        mode={mode}
                        exProjects={exProjects}
                        exLabels={exLabels}
                        currentProjectId={currentProjectId}
                        onChangePeriod={onChangePeriod}
                        TaskListHeader={() => {
                            return (
                                <div
                                    style={{ width: `${headerWidth}px` }}
                                    className="flex text-muted-foreground text-xs items-center justify-between h-[50px] border-b bg-card/80 backdrop-blur-sm z-20 shadow-sm sticky top-0"
                                >
                                    <span className="px-4 items-center gap-2 flex">
                                        <GanttChart className="w-4 h-4" />ガントチャートモード
                                    </span>
                                    <div
                                        className="absolute top-0 right-0 w-1 h-full cursor-col-resize"
                                        onMouseDown={handleMouseDown}
                                    />
                                </div>
                            )
                        }}
                        TaskListTable={() => {
                            return (
                                <>
                                    <div className="relative">
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
                                        <div
                                            className="absolute top-0 right-0 w-2 h-full cursor-col-resize"
                                            onMouseDown={handleMouseDown}
                                        />
                                    </div>
                                </>
                            )
                        }}
                    />
                </div >
            )}
        </>
    )
}