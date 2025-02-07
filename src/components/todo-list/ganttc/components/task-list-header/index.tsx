import React from "react";
import { convertFlg2Width } from "../../helper";

import styles from "./index.module.css";
interface ITaskListHeader {
    headerHeight: number;
    rowWidth: string;
    fontFamily: string;
    fontSize: string;
}

export const TaskListHeader: React.FC<ITaskListHeader> = ({
    headerHeight,
    fontFamily,
    fontSize,
    rowWidth
}) => {
    const width = convertFlg2Width(rowWidth);
    return (
        <></>
    );
};

// export const TaskListTable: React.FC<