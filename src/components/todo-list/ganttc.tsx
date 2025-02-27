import React, { useEffect, useRef, useState } from "react";
import { Task, Configuration, MessageType, GanttList, TaskType } from "./ganttc/common/types/public-types";
import { Gantt, ViewMode, GanttRef } from "@nkita/gantt-task-react";
// import { PeriodSwitch } from "./ganttc/components/period-switch";
// import { AddTaskForm } from "./ganttc/components/add-task-form";
import { yyyymmddhhmmss } from "@/lib/time";
import { convertToggle2Flag, getStartEndDateForProject, initTasks, removeLocalStorageData, useWindowHeight } from "./ganttc/helper";
import { TaskListHeader } from "./ganttc/components/task-list-header";
import { TaskListColumn } from "./ganttc/components/task-list-table";
// import { seedDates, ganttDateRange } from "./helpers/date-helper";
import styles from "./ganttc/index.module.css";
import commonStyles from "./ganttc/css/index.module.css";

import "@nkita/gantt-task-react/dist/index.css";
import { TodoProps } from "@/types";
import { ProjectProps } from "@/types";
import { LabelProps } from "@/types";
import { TentTree } from "lucide-react";
import { Button } from "../ui/button";
import { useLocalStorage } from "@/hook/useLocalStrorage";

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
    onChangePeriod,
    scrollTop,
    setGanttcScrollTop
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
    setGanttcScrollTop?: (scrollTop: number) => void
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
    // const [tasks, setTasks] = useState<Task[]>(initTasks());
    // const [notifyType, setNotifyType] = useState("info");
    // const [notifyMessage, setNotifyMessage] = useState("");
    const [title, setTitle] = useState("");
    const [viewTask, setViewTask] = useState(0);
    const [viewTitle, setViewTitle] = useState(true);
    const [viewPeriod, setViewPeriod] = useState(true);
    const [viewProgress, setViewProgress] = useState(true);
    const [saveButtonFlg, setSaveButtonDisable] = useState(true);
    const [saveHistory, setSaveHistory] = useState<Configuration[]>([]);

    const ganttRef = useRef<GanttRef>(null);

    useEffect(() => {
        if (ganttRef.current
            && scrollTop !== undefined
            && ganttRef.current.getScrollY() !== scrollTop
        ) {
            ganttRef.current.setScrollY(scrollTop);
        }
    }, [scrollTop]);

    // ガントチャート切り替え対応
    const [glist, setGList] = useState<GanttList[]>([]);
    const [currentG, setCurrentG] = useState<GanttList | null>(null);

    const windowHeight = useWindowHeight();
    const rowHeight = 35;
    const headerHeight = 210;

    // キー名
    const localStorageGanttListKey = 'ganttc_list';
    const localStorageInformationKey = 'information';

    //   const message = (message: string, type: MessageType) => <Message showIcon type={type}>{message}</Message>;
    //   const info = (msg: string) => {
    //     if (msg !== "") toaster.push(message(msg, "success"));
    //   }

    // const [scrollX, setScrollX] = useState(-1);
    let columnWidth = 23;
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

    //  First process. 
    const handleSave = (createNewGC: boolean = false) => {
    }
    // const escFunction = React.useCallback((event:any) => {
    //   if (event.keyCode === 27) {
    //     // キーコードを判定して何かする。
    //     console.log("Esc Key is pressed!");
    //   }
    // }, []);

    // useEffect(() => {
    //   document.addEventListener("keydown", escFunction, false);
    // }, []);

    const handleTaskChange = (task: Task) => {
        onChangePeriod(task.id, task.start, task.end)
    };

    const handleTaskAdd = (task: Task) => {
    };


    const handleTaskDelete = (task: Task) => {
    };

    // const handleProgressChange = async (task: Task) => {
    //   setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    //   console.log("On progress change Id:" + task.id);
    // };

    const handleDblClick = (task: Task) => {
        // alert("On Double Click event Id:" + task.id);
    };

    // タスクの削除、入れ替え処理をこの関数で行う。
    const handleSelect = (task: Task, isSelected: boolean) => {
    };

    const handleExpanderClick = (task: Task) => {
        // setTasks(tasks.map((t) => (t.id === task.id ? task : t)));
        // console.log("On expander click Id:" + task.id);
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
                onScrollChange={handleGanntcScrollChange}
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
                onDateChange={handleTaskChange}
                onDelete={handleTaskDelete}
                onDoubleClick={handleDblClick}
                onSelect={handleSelect}
                onExpanderClick={handleExpanderClick}
                preStepsCount={2}
                handleWidth={5}
                viewDate={viewDate}
                // viewTask={12}
                listCellWidth={convertToggle2Flag({
                    title: viewTitle,
                    icon: viewTitle,
                    period: viewPeriod,
                    progress: viewProgress
                })}
                // ganttHeight={windowHeight - headerHeight}
                ganttHeight={height ? height - 50 : 0}
                columnWidth={columnWidth}
                locale={"ja-JP"}
                rowHeight={rowHeight}
                timeStep={86400000}
                fontFamily={"proxima-nova, 'Helvetica Neue', Helvetica, Arial, sans-serif,'proxima-nova','Helvetica Neue',Helvetica,Arial,sans-serif"}
                todayColor="rgba(255, 0, 0, 0.1)" // 透過の赤で薄い感じに変更
                holidayColor={view === ViewMode.Day ? "rgba(230, 230, 230, 0.5)" : "rgba(255, 0, 0, 0)"}
                currentLineColor="rgba(224, 242, 254, 0.7)"
                currentLineTaskId={filteredTodos[currentIndex] ? filteredTodos[currentIndex].id : ""}
            />
            <div
                className="absolute right-[10px] bottom-[20px] z-10 flex items-center gap-2">
                <div className="flex items-center p-1 bg-background border rounded-md shadow-md">
                    <button
                        onClick={() => {
                            const prevDay = new Date();
                            prevDay.setDate(prevDay.getDate() - 2);
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
        </div>
    );
};


export default App;
