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
import { Check, ArrowRightLeft, Settings, List, Plus, Redo2, Undo2, X } from "lucide-react"
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
        setTodos,
        setIsUpdate,
        onClickSaveButton
    }: {
        todos: TodoProps[]
        prevTodos: TodoProps[]
        loading: Boolean
        completionOnly?: boolean
        projects: string[]
        setTodos: Dispatch<SetStateAction<TodoProps[]>>
        setIsUpdate: Dispatch<SetStateAction<boolean>>
        onClickSaveButton: () => void;
    }
) => {

    const [activePanel, setActivePanel] = useState<'none' | 'addTask' | 'selectProject' | 'setting'>('none')
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [currentY, setCurrentY] = useState(0);

    const openPanel = (panel: 'addTask' | 'selectProject' | 'setting') => {
        setActivePanel(panel)
    }

    const closePanel = () => {
        setActivePanel('none')
    }

    const handleAddTask = (event: React.FormEvent) => {
        event.preventDefault()
        // ここでタスク追加のロジックを実装
        console.log("タスクが追加されました")
        closePanel()
    }

    const handleProjectSelect = (value: string) => {
        // ここでプロジェクト選択のロジックを実装
        console.log(`プロジェクトが選択されました: ${value}`)
        closePanel()
    }

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
            <div
                className={`fixed bottom-0 left-0 right-0 bg-secondary text-secondary-foreground shadow-lg transform transition-transform duration-200 ease-out z-20 ${activePanel !== 'none' ? 'translate-y-0' : 'translate-y-full'
                    }`}
                style={{
                    height: '40%',
                    transform: isDragging ? `translateY(${(currentY - startY) > 0 ? currentY - startY : 0}px)` : undefined,
                    transition: isDragging ? 'none' : undefined,
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 h-full flex flex-col"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        className="w-16 h-1 bg-gray-300 rounded-full mx-auto mb-2 cursor-grab active:cursor-grabbing"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    />
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
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="プロジェクト" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project, index) => (
                                        <SelectItem key={index} value={project}>{project}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input placeholder="タスク名" />
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="優先度" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="0">{"なし"}</SelectItem>
                                    <SelectItem value="1">{"低"}</SelectItem>
                                    <SelectItem value="2">{"中"}</SelectItem>
                                    <SelectItem value="3">{"高"}</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button type="submit" className="w-full">追加</Button>
                        </form>
                    )}
                    {activePanel === 'selectProject' && (
                        <div className="space-y-4">
                            <Select onValueChange={handleProjectSelect}>
                                <SelectTrigger>
                                    <SelectValue placeholder="プロジェクトを選択" />
                                </SelectTrigger>
                                <SelectContent>
                                    {projects.map((project, index) => (
                                        <SelectItem key={index} value={project}>{project}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {activePanel === 'setting' && (
                        <div className="flex items-center justify-between">
                            <Switch id="view-completed-tasks" />
                            <Label htmlFor="view-completed-tasks">完了タスクも表示</Label>
                        </div>
                    )}
                </div>
            </div>
            <nav className="fixed bottom-0 left-0 right-0 bg-secondary text-secondary-foreground border-t block sm:hidden">
                <div className="flex justify-around items-center h-16 text-primary">
                    <Button variant="ghost" className="flex w-[33%] flex-col h-full items-center" onClick={() => openPanel('setting')}>
                        <Settings className="h-6 w-6" />
                        <span className="text-xs">設定</span>
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