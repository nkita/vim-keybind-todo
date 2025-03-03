import React, { useEffect, useRef, useState, useCallback } from "react";
import { Task, TaskType } from "./ganttc/common/types/public-types";
import { Gantt, ViewMode, GanttRef } from "@nkita/gantt-task-react";
import { Box, StickyNote, Tag } from "lucide-react";

import "@nkita/gantt-task-react/dist/index.css";
import { TodoProps } from "@/types";
import { ProjectProps } from "@/types";
import { LabelProps } from "@/types";
import { TentTree } from "lucide-react";
import { useLocalStorage } from "@/hook/useLocalStrorage";
import { ListTag } from "../ui/list-tag";

// Init
const App = ({
    filteredTodos,
    currentIndex,
    prefix,
    mode,
    exProjects,
    exLabels,
    currentProjectId,
    height,
    TaskListHeader,
    TaskListTable,
    taskListWidth,
    onChangePeriod,
    scrollTop,
    setGanttcScrollTop,
    setCurrentIndex
}: {
    filteredTodos: TodoProps[]
    currentIndex: number
    prefix: string
    mode: string
    exProjects: ProjectProps[]
    exLabels: LabelProps[]
    currentProjectId: string
    height: number
    scrollTop?: number
    taskListWidth: number
    setGanttcScrollTop?: (scrollTop: number) => void
    setCurrentIndex: (index: number) => void
    TaskListHeader?: React.FC<{
        rowHeight: number;
        rowWidth: string;
        fontFamily: string;
        fontSize: string;
        locale: string;
    }>
    TaskListTable?: React.FC<{
        rowHeight: number;
        rowWidth: string;
        fontFamily: string;
        fontSize: string;
        locale: string;
        tasks: Task[];
        selectedTaskId: string;
        setSelectedTask: (taskId: string) => void;
        onExpanderClick: (task: Task) => void;
    }>
    onChangePeriod: (todoId: string, startDate: Date, endDate: Date) => void
}) => {
    const [view, setView] = useLocalStorage<ViewMode>("ganttc_view", ViewMode.Month);
    const [viewDate, setViewDate] = useState(new Date());
    const ganttRef = useRef<GanttRef>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const PRE_STEPS_COUNT = 5;

    // currentIndexが変更されたときにviewDateを更新する
    useEffect(() => {
        if (filteredTodos.length > 0 && currentIndex >= 0 && currentIndex < filteredTodos.length) {
            const currentTodo = filteredTodos[currentIndex];
            if (currentTodo.startDate) {
                const date = new Date(currentTodo.startDate);
                date.setDate(date.getDate() - PRE_STEPS_COUNT);
                setViewDate(date);
            }
        }
    }, [currentIndex, filteredTodos]);

    useEffect(() => {
        const scrollY = ganttRef.current?.getScrollY();
        if (ganttRef.current
            && scrollTop !== undefined
            && scrollY !== scrollTop
        ) {
            // 既存のタイマーをクリア
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // 0.1秒後に実行するタイマーを設定
            debounceTimerRef.current = setTimeout(() => {
                ganttRef.current?.setScrollY(scrollTop);
            }, 100); // 0.1秒 = 100ミリ秒
        }

        // クリーンアップ関数
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [scrollTop]);


    const rowHeight = 40;

    let columnWidth = 25;
    if (view === ViewMode.Month) {
        columnWidth = 200;
    } else if (view === ViewMode.Week) {
        columnWidth = 150;
    }


    const tasks = filteredTodos.map((t) => ({
        id: t.id,
        name: t.text,
        start: new Date(t.startDate ?? new Date()),
        end: new Date(t.endDate ?? new Date()),
        type: "task" as TaskType,
        progress: t.is_complete ? 100 : 0,
    }));

    const handleTaskChange = (task: Task) => {
        onChangePeriod(task.id, task.start, task.end)
    };

    const end = new Date();
    end.setDate(end.getDate() + 1);

    if (tasks.length === 0 || !tasks) {
        return (
            <div className="flex flex-col justify-center items-center h-full w-full text-muted-foreground bg-card">
                <TentTree className="w-7 h-7" />
                タスクを追加、または選択してください。
            </div>
        )
    }

    const handleGanntcScrollChange = (scrollTop: number) => {
        if (setGanttcScrollTop) {
            setGanttcScrollTop(scrollTop);
        }
    }

    const handleViewModeChange = (mode: ViewMode) => {
        setView(mode);
    };


    return (
        <div className="relative">
            <Gantt
                ref={ganttRef}
                tasks={tasks}
                viewMode={view}
                TaskListHeader={({ headerHeight, rowWidth, fontFamily, fontSize }) =>
                    TaskListHeader ? (
                        <TaskListHeader
                            rowHeight={headerHeight}
                            rowWidth={rowWidth}
                            fontFamily={fontFamily}
                            fontSize={fontSize}
                            locale="ja-JP"
                        />
                    ) : null
                }
                TaskListTable={TaskListTable}
                preStepsCount={PRE_STEPS_COUNT}
                handleWidth={6}
                viewDate={viewDate}
                ganttHeight={height ? height - 50 : 0}
                columnWidth={columnWidth}
                locale={"ja-JP"}
                rowHeight={rowHeight}
                timeStep={86400000}
                fontSize={"12px"}
                fontFamily={"proxima-nova, 'Helvetica Neue', Helvetica, Arial, sans-serif,'proxima-nova','Helvetica Neue',Helvetica,Arial,sans-serif"}
                todayColor="rgba(255, 0, 0, 0.1)"
                holidayColor={view === ViewMode.Day ? "rgba(230, 230, 230, 0.5)" : "rgba(255, 0, 0, 0)"}
                currentLineColor="rgba(224, 242, 254, 0.7)"
                currentLineTaskId={filteredTodos[currentIndex] ? filteredTodos[currentIndex].id : ""}
                onDateChange={handleTaskChange}
                onScrollChange={handleGanntcScrollChange}
                TooltipContent={({ task }) => (
                    <TooltipContentCustom
                        task={task}
                        filteredTodos={filteredTodos}
                        exProjects={exProjects}
                        exLabels={exLabels}
                    />
                )}
                taskListWidth={taskListWidth}
            />
            <BottomButton
                viewDate={viewDate}
                setViewDate={setViewDate}
                handleViewModeChange={handleViewModeChange}
                view={view}
            />
        </div>
    );
};

const TooltipContentCustom = ({ task, filteredTodos, exProjects, exLabels }: { task: Task, filteredTodos: TodoProps[], exProjects: ProjectProps[], exLabels: LabelProps[] }) => {
    // タスクに対応するTodoを検索
    const todo = filteredTodos.find(t => t.id === task.id);
    // プロジェクト情報を取得
    const project = todo && todo.projectId ? exProjects.find(p => p.id === todo.projectId) : null;
    // ラベル情報を取得
    const labels = todo && todo.labelId ?
        [exLabels.find(l => l.id === todo.labelId)] : [];

    const detail = todo && todo.detail ? todo.detail : "";
    // 日付フォーマット関数
    const formatDateWithDay = (date: Date) => {
        return `${date.toLocaleDateString('ja-JP')} (${['日', '月', '火', '水', '木', '金', '土'][date.getDay()]})`;
    };

    return (
        <div className="p-3 bg-popover border rounded-md shadow-md max-w-xs">
            <h3 className="font-medium text-sm mb-2">{task.name}</h3>
            <div className="text-xs space-y-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                    {formatDateWithDay(task.start)} 〜 {formatDateWithDay(task.end)}
                </div>
                <div className="flex flex-wrap gap-1">
                    {detail && (
                        <ListTag>
                            <StickyNote className="h-3 w-3" />
                            メモ
                        </ListTag>
                    )}
                    {project && (
                        <ListTag className={`text-ex-project`}>
                            <Box className="h-3 w-3" />
                            {project.name}
                        </ListTag>
                    )}

                    {labels.length > 0 && labels.map((label, i) => label && (
                        <ListTag className={`text-ex-label`} key={`label-${label.id}-${i}`}>
                            <Tag className="h-3 w-3" />
                            {label.name}
                        </ListTag>
                    ))}
                </div>
            </div>
        </div>
    );
}

const BottomButton = ({
    viewDate,
    setViewDate,
    handleViewModeChange,
    view,
}: {
    viewDate: Date
    setViewDate: (date: Date) => void
    handleViewModeChange: (mode: ViewMode) => void
    view: ViewMode
}) => {
    return (
        <div className="absolute right-[10px] top-[50px] z-10 flex items-center gap-2">
            <div className="flex items-center p-1 bg-background border rounded-md shadow-md">
                <button
                    onClick={() => {
                        const prevDay = new Date();
                        prevDay.setDate(prevDay.getDate());
                        setViewDate(prevDay);
                    }}
                    className={`z-10 px-3 py-1 text-xs rounded-sm transition-all duration-200 hover:bg-accent `}
                >
                    今日
                </button>
            </div>
            <div className="flex items-center p-1 bg-background border rounded-md shadow-md">
                <div className="relative flex items-center">
                    <button
                        onClick={() => handleViewModeChange(ViewMode.Month)}
                        className={`z-10 px-3 py-1 text-xs rounded-md transition-all duration-200 ${view === ViewMode.Month ? 'text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-accent'}`}
                    >
                        月
                    </button>
                    <button
                        onClick={() => handleViewModeChange(ViewMode.Day)}
                        className={`z-10 px-3 py-1 text-xs rounded-md transition-all duration-200 ${view === ViewMode.Day ? 'text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-accent'}`}
                    >
                        日
                    </button>
                    <div
                        className="absolute top-0 left-0 h-full bg-primary rounded-sm transition-all duration-300 shadow-sm"
                        style={{
                            width: '50%',
                            transform: view === ViewMode.Month ? 'translateX(0)' : 'translateX(100%)'
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default App;
