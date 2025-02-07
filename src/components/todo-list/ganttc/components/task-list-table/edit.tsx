import React from "react";
import styles from "./index.module.css";
import { Task } from "../../common/types/public-types"

export const Edit: React.FC<{
    task: Task;
    tasks: Task[];
    rowWidth: number;
    handleEditTask: (task: Task) => void;
    handleDeleteTask: (task: Task) => void;
    onMouseDown: (task: Task) => void;
    onMouseUp: (task: Task) => void;
}> = ({
    task,
    tasks,
    rowWidth,
    handleEditTask,
    handleDeleteTask,
    onMouseDown,
    onMouseUp,
}) => {

        return (
            <>
                <div
                    className={styles.taskListCell + " " + styles.taskListIcon}
                    style={{
                        minWidth: `${rowWidth}px`,
                        maxWidth: `${rowWidth}px`,
                    }}
                    onMouseDown={() => onMouseDown(task)}
                    onMouseUp={() => onMouseUp(task)}
                >
                </div>
            </>
        );
    };