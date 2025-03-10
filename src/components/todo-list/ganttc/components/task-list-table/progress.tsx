import React from "react";
import styles from "./index.module.css";
import { Task } from "../../common/types/public-types"

export const Progress: React.FC<{
    task: Task;
    rowWidth: number;
    handleProgressChange: (task: Task) => void;
}> = ({
    task,
    rowWidth,
    handleProgressChange,
}) => {
        return (
            <>
                <div
                    className={styles.taskListCell}
                    style={{
                        minWidth: `${rowWidth}px`,
                        maxWidth: `${rowWidth}px`,
                        textAlign: "center",
                    }}
                >
                    <select name="progress" className={styles.select}
                        onChange={e => {
                            task.progress = Number(e.target.value);
                            handleProgressChange(task)
                        }}
                        value={task.progress}
                    >
                        <option value={0}>0%</option>
                        <option value={25}>25%</option>
                        <option value={50}>50%</option>
                        <option value={75}>75%</option>
                        <option value={100}>100%</option>
                    </select>
                </div>
            </>
        );
    };