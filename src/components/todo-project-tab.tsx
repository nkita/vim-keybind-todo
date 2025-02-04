'use client'

import dynamic from 'next/dynamic'
import React, { useContext } from "react"
import { List, Box, X } from "lucide-react"
import { postSaveProjects } from "@/lib/todo"
import { TodoContext } from "@/provider/todo";
import { ProjectProps } from "@/types"
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";

// DnDの機能を持つコンポーネントを動的インポート
const ProjectTabContent = dynamic(() => Promise.resolve(({
    currentProjectId, index, project, filterdProjects, exProjects, setProjects, onClick, tabId
}: {
    currentProjectId: string,
    index: number,
    project?: ProjectProps,
    exProjects: ProjectProps[],
    filterdProjects: ProjectProps[],
    tabId: string,
    setProjects?: React.Dispatch<React.SetStateAction<ProjectProps[]>>,
    onClick: (index: number, prefix: string) => void
}) => {
    const config = useContext(TodoContext)
    const { isOver, setNodeRef: setNodeRefDroppable } = useDroppable({
        id: tabId,
        data: {
            type: "projectTab",
            id: project?.id
        },
    });

    const {
        isDragging,
        attributes,
        listeners,
        setNodeRef: setNodeRefSortable,
        transform,
        transition,
    } = useSortable({ id: tabId, data: { type: "projectTab", id: tabId } });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, 0px, 0)` : undefined,
        transition
    };

    const handleHidden = () => {
        if (!project || !setProjects) return
        let _projects = exProjects.map((v: ProjectProps, i: number) => {
            if (v.id === project.id) v.isTabDisplay = false
            v.sort = i
            return v
        })
        if (config.list && config.token) {
            postSaveProjects(
                _projects,
                config.list,
                config.token
            )
        }
        setProjects(_projects)
    }
    const currentProjectIdx = filterdProjects.map(p => p.id).indexOf(currentProjectId)
    const current = index === currentProjectIdx
    const prevCurrent = index === currentProjectIdx - 1

    return (
        <div
            style={style}
            {...attributes}
            {...listeners}
            className={`
                ${(!isDragging && isOver) ? "bg-primary2/10" : current ? "bg-card border-t-primary border-t border-x" : "bg-muted"}
                h-full relative flex items-center  pr-2
                `}
            ref={setNodeRefSortable}
        >
            <button
                ref={setNodeRefDroppable}
                onMouseDown={e => {
                    onClick(index, 'projectTab')
                }}
                className={`text-xs focus-within:outline-none pl-4`}>
                <span className={`flex gap-1 items-center`} >
                    {project ? (
                        <> <Box className="w-3" />{project.name}</>
                    ) : (
                        <> <List className="w-3" />{"すべてのタスク"}</>
                    )}
                </span >
            </button >
            {(project && setProjects) && <button tabIndex={-1} className={`m-1 p-1 border border-transparent rounded-sm hover:border-primary `} onMouseDown={handleHidden}><X className="h-3 w-3" /></button>}
            <div className={`absolute inset-y-1/4 right-0 h-1/2 border-r ${current || prevCurrent ? "border-transparent" : "border"} `}></div>
        </div>
    )
}), { ssr: false })

export const ProjectTab = (props: {
    currentProjectId: string,
    index: number,
    project?: ProjectProps,
    exProjects: ProjectProps[],
    filterdProjects: ProjectProps[],
    tabId: string,
    setProjects?: React.Dispatch<React.SetStateAction<ProjectProps[]>>,
    onClick: (index: number, prefix: string) => void
}) => {
    return <ProjectTabContent {...props} />
}