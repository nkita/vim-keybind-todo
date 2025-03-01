'use client'
import React, { Dispatch, SetStateAction, useEffect, useState, useCallback, useRef } from "react"
import { TodoProps, Sort, Mode, ProjectProps, LabelProps } from "@/types"
import { UseFormRegister, FieldValues, UseFormSetValue } from "react-hook-form"
import { List } from "./list"
import Ganttc from "./ganttc"
import { useLocalStorage } from "@/hook/useLocalStrorage"
import { Edit, ArrowLeftRight, ArrowDown, GanttChart, Check, Plus, TentTree } from "lucide-react"
import { cn } from "@/lib/utils"
import { QuickUsage } from "../usage-quick"
interface GanttcListProps {
    filteredTodos: TodoProps[]
    currentIndex: number
    prefix: string
    mode: Mode
    exProjects: ProjectProps[]
    exLabels: LabelProps[]
    currentProjectId: string
    sort: Sort
    height: number
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
    height,
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
    const MIN_WIDTH = 200;
    const [headerWidth, setHeaderWidth] = useLocalStorage("ganttc-width", 400);
    const dragRef = useRef({
        isDragging: false,
        startX: 0,
        startWidth: 0
    });

    // useRefを使用して現在のヘッダー幅を追跡
    const headerWidthRef = useRef(headerWidth);

    // 画面幅の状態管理
    const [maxWidth, setMaxWidth] = useState(() => window.innerWidth * 0.8);

    // ガントチャートの高さを管理
    const [ganttcHeight, setGanttcHeight] = useState(height);

    // ヘッダー幅が最大幅を超えないように監視
    useEffect(() => {
        headerWidthRef.current = headerWidth;
    }, [headerWidth]);

    // ガントチャートの高さを管理
    useEffect(() => {
        const rowH = 35;
        const h = filteredTodos.length * rowH + 50;
        setGanttcHeight(height > h ? h : height);
    }, [height, filteredTodos]);

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
    }, [maxWidth, setHeaderWidth]);

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
    }, [maxWidth, setHeaderWidth]);

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

    const listRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [ganttcScrollTop, setGanttcScrollTop] = useState(0);

    useEffect(() => {
        if (listRef.current?.scrollTop !== ganttcScrollTop) {
            listRef.current?.scrollTo({
                top: ganttcScrollTop,
            });
        }
    }, [ganttcScrollTop]);
    if (!loading && filteredTodos.length === 0) {
        return (
            <div className="flex flex-col justify-center items-center h-full w-full text-muted-foreground bg-card">
                <TentTree className="w-7 h-7" />
                <span className="py-4">タスクを追加、または選択してください。</span>
                <QuickUsage className="" />
            </div>
        )
    }

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
                <div
                    style={{ height: `${height}px` }}
                    className={`w-full relative bg-muted`} >
                    <div
                        style={{ width: `${headerWidth}px`, height: `${height}px` }}
                        className="absolute left-0 overflow-hidden z-10">
                        <div className="relative overflow-hidden h-full z-10" ref={listRef} onScroll={e => setScrollTop(e.currentTarget.scrollTop)}>
                            <div
                                style={{ width: `${headerWidth}px` }}
                                className="flex text-muted-foreground text-xs items-center justify-between h-[50px] border-b  bg-card  z-20 sticky top-0 shadow-sm"
                            >
                                <span className="px-4 items-center gap-2 flex">
                                    <GanttChart className="w-4 h-4" />ガントチャートモード
                                </span>
                                <div
                                    className="absolute top-0 right-0 w-1 h-full cursor-col-resize"
                                    onMouseDown={handleMouseDown}
                                />
                            </div>
                            <div
                                className="absolute top-0 right-0 w-[1px]  hover:w-[2px] bg-muted  h-full cursor-col-resize z-20"
                                onMouseDown={handleMouseDown}
                            />
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
                    <Ganttc
                        scrollTop={scrollTop}
                        setGanttcScrollTop={setGanttcScrollTop}
                        filteredTodos={filteredTodos}
                        currentIndex={currentIndex}
                        prefix={prefix}
                        mode={mode}
                        exProjects={exProjects}
                        exLabels={exLabels}
                        currentProjectId={currentProjectId}
                        onChangePeriod={onChangePeriod}
                        height={ganttcHeight}
                        setCurrentIndex={setCurrentIndex}
                        TaskListHeader={() => {
                            return (
                                <div
                                    style={{ width: `${headerWidth}px` }}
                                    className="flex text-muted-foreground text-xs items-center justify-between h-[50px] border-b bg-card/80 backdrop-blur-sm z-20 shadow-sm "
                                >
                                </div>
                            )
                        }}
                        TaskListTable={() => {
                            return (
                                <div
                                    style={{ width: `${headerWidth}px` }}
                                />
                            )
                        }}
                    />
                </div>
            )}
        </>
    )
}