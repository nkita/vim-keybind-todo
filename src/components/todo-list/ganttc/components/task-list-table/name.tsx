import React from "react";
import styles from "./index.module.css";
import { Task } from "../../common/types/public-types"


export const Name: React.FC<{
    task: Task;
    rowWidth: number;
    onMouseDown: (task: Task) => void;
    onMouseUp: (task: Task) => void;
}> = ({
    task,
    rowWidth,
    onMouseDown,
    onMouseUp,
}) => {
        return (
            <>
                <div
                    className={styles.taskListCell}
                    style={{
                        minWidth: `${rowWidth}px`,
                        maxWidth: `${rowWidth}px`,
                    }}
                    title={task.name}
                    onMouseDown={() => onMouseDown(task)}
                    onMouseUp={()=>onMouseUp(task)}
                >
                    <div className={styles.taskListNameWrapper}>
                        {/* 上位プロジェクトが存在する場合はインデントを大きく下げる */}
                        {(task.project !== undefined) &&
                            <div style={{
                                maxWidth: "15px",
                                minWidth: "15px"
                            }}>
                            </div>
                        }
                        <div>
                        </div>
                    </div>
                </div>
            </>
        );
    };