import React, { useEffect, useState } from "react";
import { Task, Configuration, MessageType, GanttList } from "./ganttc/common/types/public-types";
import { Gantt, ViewMode } from "@nkita/gantt-task-react";
// import { PeriodSwitch } from "./ganttc/components/period-switch";
// import { AddTaskForm } from "./ganttc/components/add-task-form";
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


// Init
const App = ({
    filteredTodos,
    currentIndex,
    prefix,
    mode,
    exProjects,
    exLabels,
    currentProjectId,
}: {
    filteredTodos: TodoProps[]
    currentIndex: number
    prefix: string
    mode: string
    exProjects: ProjectProps[]
    exLabels: LabelProps[]
    currentProjectId: string
}) => {
    const [view, setView] = useState<ViewMode>(ViewMode.Day);
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

    // ガントチャート切り替え対応
    const [glist, setGList] = useState<GanttList[]>([]);
    const [currentG, setCurrentG] = useState<GanttList | null>(null);

    const windowHeight = useWindowHeight();
    const rowHeight = 35;
    const headerHeight = 210;
    const date = new Date();
    const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDay());

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
        start: new Date(t.creationDate ?? new Date()),
        end: new Date(t.completionDate ?? new Date()),
        type: "task",
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
    };

    const handleTaskAdd = (task: Task) => {
    };

    const handleGCDelete = () => {
    };

    const handleChangeGC = (localStorageGanttChartKey: string) => {

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
            <div className="flex justify-center items-center h-full w-full text-muted-foreground">
                <TentTree /> <span className="ml-2 ">No Data </span>
            </div>
        )
    }
    return (
        <>
            <Gantt
                tasks={tasks}
                viewMode={view}
                TaskListHeader={TaskListHeader}
                TaskListTable={TaskListColumn}
                onDateChange={handleTaskChange}
                onDelete={handleTaskDelete}
                onDoubleClick={handleDblClick}
                onSelect={handleSelect}
                onExpanderClick={handleExpanderClick}
                preStepsCount={2}
                handleWidth={5}
                viewDate={currentDate}
                // viewTask={12}
                listCellWidth={convertToggle2Flag({
                    title: viewTitle,
                    icon: viewTitle,
                    period: viewPeriod,
                    progress: viewProgress
                })}
                // ganttHeight={((rowHeight * tasks.length + headerHeight) > windowHeight) ? (windowHeight - headerHeight) : 0}
                columnWidth={columnWidth}
                locale={"ja-JP"}
                rowHeight={rowHeight}
                timeStep={86400000}
                fontFamily={"proxima-nova, 'Helvetica Neue', Helvetica, Arial, sans-serif,'proxima-nova','Helvetica Neue',Helvetica,Arial,sans-serif"}
            />
        </>
    );
};


export default App;
