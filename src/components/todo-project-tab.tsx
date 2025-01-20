'use client'
import React, { useEffect, useContext } from "react"
import { List, Box, X } from "lucide-react"
import { postSaveProjects } from "@/lib/todo"
import { TodoContext } from "@/provider/todo";
import { ProjectProps } from "@/types"
import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";

export const ProjectTab = (
    {
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
    }
) => {
    const config = useContext(TodoContext)
    const { isOver, setNodeRef: setNodeRefDroppable } = useDroppable({
        id: tabId,
        data: {
            type: "projectTab",
            id: project?.id
        }
    });

    const {
        attributes,
        listeners,
        setNodeRef: setNodeRefSortable,
        transform,
        transition,
    } = useSortable({ id: tabId, data: { type: "projectTab", id: tabId } });

    const style = {
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition
    };

    // TODO: スクロール
    // useEffect(() => {
    //     if (project && currentProjectId === project.id) {
    //         ref.current?.scrollIntoView({ behavior: "smooth" })
    //     }
    // }, [project, currentProjectId])

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
            {...attributes}
            {...listeners}
            className={`relative flex items-center pl-4  pr-2
                ${current ?
                    `${isOver ? "bg-sky-100" : "bg-card"} border-t-primary border-t border-b-transparent border-x`
                    : ` ${isOver ? "bg-sky-100" : "bg-muted"} text-muted-foreground border-t border-x border-x-transparent`}
                h-full  hover:bg-accent hover:text-accent-foreground transition-all fade-in-5
            `} ref={setNodeRefDroppable} >
            <button ref={setNodeRefSortable}
                onClick={_ => {
                    onClick(index, 'projectTab')
                }}
                className={` text-xs focus-within:outline-none`}>
                <span className="flex gap-1 items-center" >
                    {project ? (
                        <> <Box className="w-3" />{project.name}</>
                    ) : (
                        <> <List className="w-3" />{"すべてのタスク"}</>
                    )}
                </span >
            </button >
            {(project && setProjects) && <button tabIndex={-1} className={`m-1 p-1 border border-transparent rounded-sm hover:border-primary `} onClick={handleHidden}><X className="h-3 w-3" /></button>}
            <div className={`absolute inset-y-1/4 right-0 h-1/2 border-r ${current || prevCurrent ? "border-transparent" : "border"} `}></div>
        </div>
    )
}