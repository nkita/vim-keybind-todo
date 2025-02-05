import React, { useEffect, useState } from "react";
import { Task, Configuration, GanttList } from "./ganttc/common/types/public-types";
import { Gantt, ViewMode } from "@nkita/gantt-task-react";
import { getStartEndDateForProject, initTasks, removeLocalStorageData, useWindowHeight } from "./ganttc/helper";
import { TaskListHeader } from "./ganttc/components/task-list-header";
import { TaskListColumn } from "./ganttc/components/task-list-table";
import { reOrder, reOrderAll, convertToggle2Flag, getData, pushData, pushNewData } from "./ganttc/helper";
import "@nkita/gantt-task-react/dist/index.css";
import { TodoProps } from "@/types";

// Init
const Ganttc = (
    { filterdTodos }: { filterdTodos: TodoProps[] }
) => {
    const [view, setView] = useState<ViewMode>(ViewMode.Day);
    const [tasks, setTasks] = useState<Task[]>(initTasks());
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

    useEffect(() => {
        setTasks(filterdTodos.map(t => {
            return {
                start: new Date(t.creationDate ?? ""),
                end: new Date(t.creationDate ?? ""),
                name: t.text,
                id: t.id,
                progress: 0,
                type: "task",
            }
        }))
    }, [filterdTodos])
    // const toaster = useToaster();
    // const message = (message: string, type: MessageType) => <Message showIcon type={type}>{message}</Message>;
    // const info = (msg: string) => {
    //     if (msg !== "") toaster.push(message(msg, "success"));
    // }

    // const [scrollX, setScrollX] = useState(-1);
    let columnWidth = 23;
    if (view === ViewMode.Month) {
        columnWidth = 200;
    } else if (view === ViewMode.Week) {
        columnWidth = 150;
    }


    const handleTaskChange = (task: Task) => {
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
        // console.log(task.name + " has " + (isSelected ? "selected" : "unselected"));
    }

    const handleExpanderClick = (task: Task) => {
        // console.log("On expander click Id:" + task.id);
    };

    if (tasks.length === 0) return <></>

    return (
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
            barBackgroundColor="skyblue"
            viewDate={currentDate}
            // viewTask={12}
            listCellWidth={"100%"}
            // ganttHeight={((rowHeight * tasks.length + headerHeight) > windowHeight) ? (windowHeight - headerHeight) : 0}
            ganttHeight={0}
            columnWidth={columnWidth}
            locale={"ja-JP"}
            rowHeight={rowHeight}
            timeStep={86400000}
            fontFamily={"proxima-nova, 'Helvetica Neue', Helvetica, Arial, sans-serif,'proxima-nova','Helvetica Neue',Helvetica,Arial,sans-serif"}
        />
    );
};


export default Ganttc;