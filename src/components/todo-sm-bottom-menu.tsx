'use client'
import React, { useState, Dispatch, SetStateAction } from "react"
import { TodoEnablesProps, TodoProps, Mode, ProjectProps } from "@/types"
import { todoFunc } from "@/lib/todo"
import { Input } from "@/components/ui/input";
import { toast } from "sonner"
import jaJson from "@/dictionaries/ja.json"
import { Monitor, ArrowRightLeft, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ProjectTab } from "./todo-project-tab";
const MAX_UNDO_COUNT = 10

export const BottomMenu = (
    {
        todos,
        prevTodos,
        completionOnly,
        projects,
        filteredProjects,
        currentProjectId,
        viewCompletionTask,
        todoEnables,
        handleClickElement,
        setMode,
        setViewCompletionTask,
        setCurrentProjectId,
        handleSetTodos,
    }: {
        todos: TodoProps[]
        prevTodos: TodoProps[]
        completionOnly?: boolean
        projects: ProjectProps[]
        filteredProjects: ProjectProps[]
        currentProjectId: string
        viewCompletionTask: boolean
        todoEnables: TodoEnablesProps
        handleClickElement: (index: number, prefix: string) => void
        setMode: Dispatch<SetStateAction<Mode>>
        setViewCompletionTask: Dispatch<SetStateAction<boolean>>
        setCurrentProjectId: Dispatch<SetStateAction<string>>
        handleSetTodos: (todos: TodoProps[], prevTodos: TodoProps[]) => void
    }
) => {

    const [activePanel, setActivePanel] = useState<'none' | 'addTask' | 'selectProject' | 'setting'>('none')
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [projectId, setProjectId] = useState("");
    const [task, setTask] = useState("");
    const [priority, setPriority] = useState("");

    const prefix = "st"
    const openPanel = (panel: 'addTask' | 'selectProject' | 'setting') => {
        setMode('modal')
        setActivePanel(panel)
    }

    const closePanel = () => {
        setActivePanel('none')
        setMode('normal')
    }

    const handleAddTask = (event: React.FormEvent) => {
        if (!todoEnables.enableAddTodo) return toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        // if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        handleSetTodos(todoFunc.add(0, todos, { text: task, priority: priority, projectId: projectId, viewCompletionTask: viewCompletionTask }), prevTodos)
        setTask("")
        setPriority("")
        setProjectId("")
        closePanel()
    }

    const handleProjectIdSelect = (value: string) => setCurrentProjectId(value.replace(prefix, ""))

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        setStartY(e.touches[0].clientY);
        setCurrentY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (isDragging) {
            setCurrentY(e.touches[0].clientY);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (currentY - startY > 50) {
            closePanel();
        } else {
            setCurrentY(startY);
        }
    };

    return (
        <>
            {/* スライドアップパネル */}
            <div className={`${activePanel !== 'none' ? 'block' : 'hidden'} fixed bottom-0 left-0 right-0 bg-black/50  z-20 h-[100%] `} onClick={closePanel} />
            <div
                className={`fixed bottom-0 left-0 right-0 bg-background text-card-foreground shadow-lg transform transition-transform duration-200 ease-out z-30 ${activePanel !== 'none' ? 'translate-y-0' : 'translate-y-full'}`}
                style={{
                    height: '55%',
                    transform: isDragging ? `translateY(${(currentY - startY) > 0 ? currentY - startY : 0}px)` : undefined,
                    transition: isDragging ? 'none' : undefined,
                }}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="p-4 h-full flex flex-col"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">
                            {activePanel === 'addTask' ? 'タスクを追加' : activePanel === 'selectProject' ? 'プロジェクトを選択' : '設定'}
                        </h2>
                        <Button variant="ghost" size="icon" onClick={closePanel}>
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                    {activePanel === 'addTask' && (
                        <form onSubmit={handleAddTask} className="space-y-4">
                            <Select name="project" value={projectId} onValueChange={(value) => setProjectId(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="プロジェクト" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.length === 0 &&
                                        <div className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm text-muted-foreground bg-muted outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                                            現在選択できるプロジェクトはありません。
                                        </div>
                                    }
                                    {projects.map((project, index) => (
                                        <SelectItem key={index} value={project.id}>{project.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input placeholder="タスク名" name="task" value={task} onChange={(e) => setTask(e.target.value)} />
                            <Select name="priority" value={priority} onValueChange={(value) => setPriority(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="優先度" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={"1"}>{"低"}</SelectItem>
                                    <SelectItem value={"2"}>{"中"}</SelectItem>
                                    <SelectItem value={"3"}>{"高"}</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2 py-4">
                                <Button type="button" variant="outline" className="w-full" onClick={() => {
                                    setTask("")
                                    setPriority("")
                                    setProjectId("")
                                }}>クリア</Button>
                                <Button type="submit" className="w-full">追加</Button>
                            </div>
                        </form>
                    )}
                    {activePanel === 'selectProject' && (
                        <div className="space-y-4">
                            <Select onValueChange={handleProjectIdSelect} defaultValue={prefix + currentProjectId} value={prefix + currentProjectId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="ALL" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={prefix}>{"ALL"}</SelectItem>
                                    {projects.filter(p => p.isTabDisplay).map((project, index) => (
                                        <SelectItem key={index} value={prefix + project.id}>{project.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {activePanel === 'setting' && (
                        <div className="flex items-center justify-between p-4">
                            <Label htmlFor="view-completed-tasks">完了タスクも表示</Label>
                            <Switch id="view-completed-tasks" checked={completionOnly} onCheckedChange={setViewCompletionTask} />
                        </div>
                    )}
                </div>
            </div>
            <nav className="fixed bottom-0 left-0 right-0 bg-card z-20 border-t-2 h-[110px]  drop-shadow-xl block sm:hidden w-full">
                <div className="h-[35px] w-full">
                    <div className={`w-full h-full flex justify-start  items-end overflow-x-auto flex-nowrap text-nowrap hidden-scrollbar text-foreground`}>
                        <ProjectTab tabId={"all"} currentProjectId={currentProjectId} index={-1} filterdProjects={filteredProjects} exProjects={projects} onClick={handleClickElement} />
                        {projects && filteredProjects.map((p, i) => <ProjectTab key={p.id} tabId={prefix} currentProjectId={currentProjectId} index={i} filterdProjects={filteredProjects} exProjects={projects} onClick={handleClickElement} project={p} />)}
                    </div>
                </div>
                <div className="flex justify-around items-start h-[75px] text-secondary-foreground/80 border-t">
                    <Button variant="ghost" className="flex w-[33%] flex-col h-full items-center" onClick={() => openPanel('setting')}>
                        <Monitor className="h-6 w-6" />
                        <span className="text-xs">表示</span>
                    </Button>
                    <Button variant="ghost" className="flex w-[33%] flex-col h-full items-center" onClick={() => openPanel('addTask')}>
                        <Plus className="h-6 w-6" />
                        <span className="text-xs">タスク追加</span>
                    </Button>
                </div>
            </nav>
        </>
    )
}