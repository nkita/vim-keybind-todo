'use client'
import React, { useState, MouseEvent, useEffect, Dispatch, SetStateAction } from "react"
import { useHotkeys, } from "react-hotkeys-hook"
import { useForm } from "react-hook-form"
import { keymap, completionTaskProjectName } from '@/components/config'
import { TodoEnablesProps, TodoProps, Sort, Mode } from "@/types"
import { todoFunc } from "@/lib/todo"
import { Input } from "@/components/ui/input";
import { yyyymmddhhmmss } from "@/lib/time"
import { TodoList } from "./todo-list"
import { Detail } from "./detail"
import { isEqual } from "lodash";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Usage } from "./usage"
import { useLocalStorage } from "@/hook/useLocalStrorage"
import { toast } from "sonner"
import jaJson from "@/dictionaries/ja.json"
import { debugLog } from "@/lib/utils"
import { DeleteModal } from "./delete-modal"
import { Monitor, ArrowRightLeft, Settings, List, Plus, Redo2, Undo2, X } from "lucide-react"
import { FaSitemap } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
const MAX_UNDO_COUNT = 10

export const BottomMenu = (
    {
        todos,
        prevTodos,
        loading,
        completionOnly,
        projects,
        currentProject,
        viewCompletionTask,
        todoEnables,
        setMode,
        setViewCompletionTask,
        setCurrentProject,
        handleSetTodos,
    }: {
        todos: TodoProps[]
        prevTodos: TodoProps[]
        loading: Boolean
        completionOnly?: boolean
        projects: string[]
        currentProject: string
        viewCompletionTask: boolean
        todoEnables: TodoEnablesProps
        setMode: Dispatch<SetStateAction<Mode>>
        setViewCompletionTask: Dispatch<SetStateAction<boolean>>
        setCurrentProject: Dispatch<SetStateAction<string>>
        handleSetTodos: (todos: TodoProps[], prevTodos: TodoProps[]) => void
    }
) => {

    const [activePanel, setActivePanel] = useState<'none' | 'addTask' | 'selectProject' | 'setting'>('none')
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);
    const [project, setProject] = useState("");
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
        handleSetTodos(todoFunc.add(0, todos, { text: task, priority: priority, project: currentProject, viewCompletionTask: viewCompletionTask }), prevTodos)
        setTask("")
        setPriority("")
        setProject("")
        closePanel()
    }

    const handleProjectSelect = (value: string) => setCurrentProject(value.replace(prefix, ""))

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
            <div className={`${activePanel !== 'none' ? 'block' : 'hidden'} fixed bottom-0 left-0 right-0 bg-black/50  z-10 h-[100%] `} onClick={closePanel} />
            <div
                className={`fixed bottom-0 left-0 right-0 bg-background text-card-foreground shadow-lg transform transition-transform duration-200 ease-out z-20 ${activePanel !== 'none' ? 'translate-y-0' : 'translate-y-full'
                    }`}
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
                            <Select name="project" value={project} onValueChange={(value) => setProject(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="プロジェクト" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project, index) => (
                                        <SelectItem key={index} value={project}>{project}</SelectItem>
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
                                    setProject("")
                                }}>クリア</Button>
                                <Button type="submit" className="w-full">追加</Button>
                            </div>
                        </form>
                    )}
                    {activePanel === 'selectProject' && (
                        <div className="space-y-4">
                            <Select onValueChange={handleProjectSelect} defaultValue={prefix + currentProject} value={prefix + currentProject}>
                                <SelectTrigger>
                                    <SelectValue placeholder="ALL" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={prefix}>{"ALL"}</SelectItem>
                                    {projects.map((project, index) => (
                                        <SelectItem key={index} value={prefix + project}>{project}</SelectItem>
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
            <nav className="fixed bottom-0 left-0 right-0 bg-secondary text-secondary-foreground border-t block sm:hidden">
                <div className="flex justify-around items-center h-16 text-primary">
                    <Button variant="ghost" className="flex w-[33%] flex-col h-full items-center" onClick={() => openPanel('setting')}>
                        <Monitor className="h-6 w-6" />
                        <span className="text-xs">表示</span>
                    </Button>
                    <Button variant="ghost" className="flex w-[33%] flex-col h-full items-center" onClick={() => openPanel('selectProject')}>
                        <ArrowRightLeft className="h-6 w-6" />
                        <span className="text-xs">切り替え</span>
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