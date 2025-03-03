'use client'
import React, { useState, MouseEvent, useEffect, Dispatch, SetStateAction, useRef } from "react"
import { useHotkeys, } from "react-hotkeys-hook"
import { useForm } from "react-hook-form"
import { keymap } from '@/components/config'
import { TodoEnablesProps, TodoProps, Sort, Mode, ProjectProps, LabelProps, DisplayMode } from "@/types"
import { todoFunc } from "@/lib/todo"
import { yyyymmddhhmmss } from "@/lib/time"
import { NormalList } from "./todo-list/normal-list"
import { Detail } from "./detail"
import { isEqual, findIndex, sortBy } from "lodash";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Usage } from "./usage"
import { useLocalStorage } from "@/hook/useLocalStrorage"
import { toast } from "sonner"
import jaJson from "@/dictionaries/ja.json"
import { cn, debugLog } from "@/lib/utils"
import { DeleteModal } from "./delete-modal"
import { Redo2, Undo2, Save, IndentIncrease, IndentDecrease, TentTree, CircleHelp, Eye, EyeOffIcon, Columns, Plus, Settings2, FileBox, Cloud, CloudOff, GanttChart, ListTodo, Wallpaper, ZoomIn, ZoomOut } from "lucide-react"
import { BottomMenu } from "@/components/todo-sm-bottom-menu";
import { useAuth0 } from "@auth0/auth0-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ImperativePanelHandle } from "react-resizable-panels"
import { Button } from "./ui/button"
import { SidebarTrigger } from "./ui/sidebar"
import { ProjectEditModal } from "./project-edit-modal"
import { ProjectTab } from "./todo-project-tab"
import { ProjectTabSettingModal } from "./project-tab-setting-modal"
import { SimpleSpinner } from "./ui/spinner"
import { DndContext, DragEndEvent, DragMoveEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core"
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable"
import { GanttcList } from "./todo-list/ganttc-list"

const MAX_UNDO_COUNT = 10
const HEADER_HEIGHT_SM = 48 // 3rem
const HEADER_PROJECT_TAB_HEIGHT = 40
const HEADER_MENU_BAR_HEIGHT = 50
const BOTTOM_MENU_HEIGHT = 30

export const Todo = (
    {
        todos,
        prevTodos,
        exProjects,
        exLabels,
        loading,
        completionOnly,
        isSave,
        isUpdate,
        isLocalMode,
        setTodos,
        setExProjects,
        setExLabels,
        setIsUpdate,
        onClickSaveButton,
    }: {
        todos: TodoProps[]
        prevTodos: TodoProps[]
        exProjects: ProjectProps[]
        exLabels: LabelProps[]
        loading: Boolean
        completionOnly?: boolean
        isSave: boolean
        isUpdate: boolean
        isLocalMode: boolean
        setTodos: Dispatch<SetStateAction<TodoProps[]>>
        setExProjects: Dispatch<SetStateAction<ProjectProps[]>>
        setExLabels: Dispatch<SetStateAction<LabelProps[]>>
        setIsUpdate: Dispatch<SetStateAction<boolean>>
        onClickSaveButton: () => void;
    }
) => {
    const [command, setCommand] = useState("")
    const [viewCompletionTask, setViewCompletionTask] = useLocalStorage("is_view_completion", true)
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [keepPositionId, setKeepPositionId] = useState<string | undefined>(undefined)
    const [prefix, setPrefix] = useState('text')
    const [currentProjectId, setCurrentProjectId] = useLocalStorage("current_project_id", "")
    const [displayMode, setDisplayMode] = useLocalStorage<DisplayMode>("display_mode", "List")
    const [mode, setMode] = useState<Mode>('normal')
    const [sort, setSort] = useLocalStorage<Sort>("sort-ls-key", undefined)
    const [filteredTodos, setFilteredTodos] = useState<TodoProps[]>(todos)
    const [filteredProjects, setFilteredProjects] = useState<ProjectProps[]>(exProjects)

    const [todoEnables, setTodoEnables] = useState<TodoEnablesProps>({
        enableAddTodo: true,
        todosLimit: 100,
    })
    const [historyTodos, setHistoryTodos] = useState<TodoProps[][]>([])
    const [undoCount, setUndoCount] = useState(0)
    const [isHelp, setHelp] = useLocalStorage("is_help", false)
    const [isLastPosition, setIsLastPosition] = useState(false)
    const [selectTaskId, setSelectTaskId] = useState<string | undefined>(undefined)
    const [isOpenRightPanel, setIsOpenRightPanel] = useLocalStorage("is_open_right_panel", true)
    const resizeRef = useRef<ImperativePanelHandle>(null);
    const rowHeight = [30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50]
    const [rowHeightIndex, setRowHeightIndex] = useLocalStorage("row_height_index", 0)

    const { register, setFocus, getValues, setValue, watch } = useForm()
    const { user, isLoading } = useAuth0()
    const [isComposing, setIsComposing] = useState(false)
    const [currentKeys, setCurrentKeys] = useState<String[]>([])
    const [log, setLog] = useState("")
    const [searchResultIndex, setSearchResultIndex] = useState<boolean[]>([])
    const [windowHeight, setWindowHeight] = useState(0)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowHeight(window.innerHeight)

            const handleResize = () => {
                setWindowHeight(window.innerHeight)
            }

            window.addEventListener('resize', handleResize)
            return () => window.removeEventListener('resize', handleResize)
        }
    }, [])

    // 初期値を0に設定
    const mainHeight = windowHeight === 0 ? 0 : windowHeight - (
        window.innerWidth >= 640 ?
            HEADER_PROJECT_TAB_HEIGHT + HEADER_MENU_BAR_HEIGHT :
            HEADER_HEIGHT_SM
    )
    const contentHeight = windowHeight === 0 ? 200 : mainHeight - BOTTOM_MENU_HEIGHT

    useEffect(() => {
        const panel = resizeRef.current;
        if (panel) {
            isOpenRightPanel ? panel.expand() : panel.collapse()
        }
    }, [isOpenRightPanel])

    useEffect(() => {
        if (currentProjectId && filteredTodos.length > 0) {
            if (filteredProjects.filter(f => f.id === currentProjectId).length === 0) setCurrentProjectId("")
        }
    }, [currentProjectId, filteredProjects, filteredTodos, setCurrentProjectId])

    const setKeyEnableDefine = (keyConf: { mode?: Mode[], sort?: Sort[], withoutTask?: boolean, useKey?: boolean, displayMode?: DisplayMode[] } | undefined) => {
        let enabledMode = false
        let enabledSort = true
        let enabledDisplayMode = true
        let enabledWithoutTask = true
        if (keyConf !== undefined) {
            if (keyConf.mode !== undefined) {
                keyConf.mode.forEach(m => {
                    if (m === mode) enabledMode = true
                })
            }
            if (keyConf.sort !== undefined) {
                enabledSort = false
                keyConf.sort.forEach(s => {
                    if (s === sort) enabledSort = true
                })
            }
            if (keyConf.displayMode !== undefined) {
                enabledDisplayMode = false
                keyConf.displayMode.forEach(dm => {
                    if (dm === displayMode) enabledDisplayMode = true
                })
            }
            enabledWithoutTask = filteredTodos.length === 0 ? keyConf.withoutTask ?? true : true
        }
        return { enabled: enabledMode && enabledSort && enabledWithoutTask && enabledDisplayMode, enableOnContentEditable: true, enableOnFormTags: true, preventDefault: true, useKey: keyConf?.useKey ?? false }
    }

    useEffect(() => {
        setTodoEnables(prev => {
            prev.enableAddTodo = todos.filter(t => !t.is_complete).length < prev.todosLimit
            return prev
        })
    }, [todos])

    useEffect(() => {
        if (completionOnly) {
            if (todos.length > 0) setFilteredTodos(todos)
            return
        }
        let _todos = !currentProjectId ? [...todos] : todos.filter(t => t.projectId === currentProjectId)

        if (!viewCompletionTask) {
            _todos = _todos.filter(t => t.is_complete !== true)
        }

        if (sort !== undefined) {
            if (sort === "sort") {
                _todos.sort((a, b) => {
                    let _a = a[sort] ?? 99999999
                    let _b = b[sort] ?? 99999999
                    return _a - _b
                })
            } else {
                _todos.sort((a, b) => {
                    let _a = a[sort]
                    let _b = b[sort]
                    if (sort === 'is_complete' || typeof _a === "boolean" || typeof _b === "boolean") {
                        _a = _a === undefined ? "a" : _a ? undefined : "a"
                        _b = _b === undefined ? "a" : _b ? undefined : "a"
                    }
                    if (_a === undefined || !_a) return 1
                    if (_b === undefined || !_b) return -1
                    return _b.localeCompare(_a); // 文字列の比較にする
                });
            }
        }
        setFilteredTodos(_todos)
    }, [todos, currentProjectId, sort, completionOnly, viewCompletionTask, setFilteredTodos])

    useEffect(() => {
        if (exProjects.length > 0) {
            setFilteredProjects(sortBy(exProjects.filter(p => p.isTabDisplay), "sort"))
        }
    }, [exProjects])

    useEffect(() => {
        debugLog(`currentIndex:${currentIndex} mode:${mode} keepPositionId:${keepPositionId} prefix:${prefix} mode:${mode} `)
        if (filteredTodos.length > 0 && currentIndex !== - 1) {
            if (keepPositionId && currentIndex !== filteredTodos.map(t => t.id).indexOf(keepPositionId ? keepPositionId : "")) {
                let index = filteredTodos.map(t => t.id).indexOf(keepPositionId)
                if (index === -1) {
                    index = currentIndex >= filteredTodos.length ? filteredTodos.length - 1 : currentIndex > 0 ? currentIndex - 1 : currentIndex
                }
                setCurrentIndex(index)
                setKeepPositionId(undefined)
            } else {
                const id = filteredTodos[currentIndex >= filteredTodos.length ? filteredTodos.length - 1 : currentIndex].id
                if (mode === 'edit' || mode === "editDetail") setFocus(`edit-${mode === "edit" ? "list" : "content"}-${prefix}-${id}`)
                if (mode === 'normal' || mode === "select") setFocus(`list-${prefix}-${id}`)
                if (mode === 'editOnSort') setFocus("newtask")
                setIsLastPosition(true)
            }
        }
    }, [filteredTodos, mode, keepPositionId, currentIndex, prefix, setFocus, setValue])


    useEffect(() => {
        if (isLastPosition) {
            if (currentIndex >= filteredTodos.length) setCurrentIndex(filteredTodos.length - 1)
            setIsLastPosition(false)
        }
    }, [filteredTodos, currentIndex, isLastPosition])

    /*****
     * common function
     ****/
    const handleSetTodos = (_todos: TodoProps[], prevTodos: TodoProps[]) => {
        const _t = todoFunc.sortUpdate(_todos)
        setTodos(_t)
        _t.forEach(t => {
            setValue(`edit-content-text-${t.id}`, t.text)
            setValue(`edit-list-text-${t.id}`, t.text)
        })
        const d = todoFunc.diff(_t, prevTodos).filter(t => !todoFunc.isEmpty(t))
        debugLog(`isUpdate:${d.length > 0}`)
        if (d.length > 0) {
            setIsUpdate(true)
            setHistoryTodos(prev => {
                const p = prev.slice(undoCount > 0 ? undoCount + 1 : 1, MAX_UNDO_COUNT)
                return [_t, prevTodos.filter(t => !todoFunc.isEmpty(t)), ...p]
            })
            setUndoCount(0)
        }
    }

    const toNormalMode = (todos: TodoProps[], prevTodos: TodoProps[], mode: Mode, filteredTodos: TodoProps[], currentIndex: number) => {
        if (filteredTodos.length === 0) {
            setPrefix('text')
            setMode('normal')
            return
        }
        const targetTodo = filteredTodos[currentIndex]
        if (targetTodo === undefined) {
            setPrefix('text')
            setMode('normal')
            return
        }
        const positions = {
            editDetail: ["content", "list"],
            default: ["list", "content"]
        };
        const [updatePosition, otherPosition] = mode === "editDetail" ? positions.editDetail : positions.default

        const targetTodoId = targetTodo.id
        const replaceText = getValues(`edit-${updatePosition}-text-${targetTodoId}`)
        setValue(`edit-${otherPosition}-text-${targetTodoId}`, replaceText)
        const replace: TodoProps = {
            id: targetTodoId,
            is_complete: targetTodo.is_complete,
            priority: targetTodo.priority,
            completionDate: targetTodo.completionDate,
            creationDate: targetTodo.creationDate,
            text: replaceText,
            projectId: getValues(`edit-list-projectId-${targetTodoId}`),
            labelId: getValues(`edit-list-labelId-${targetTodoId}`),
            detail: getValues(`edit-content-detail-${targetTodoId}`) ?? "",
            startDate: targetTodo.startDate ?? yyyymmddhhmmss(new Date(new Date(targetTodo.creationDate || new Date()).setHours(0, 0, 0))),
            endDate: targetTodo.endDate ?? yyyymmddhhmmss(new Date(new Date(targetTodo.creationDate || new Date()).setHours(23, 59, 59))),
            inProgress: targetTodo.inProgress,
            sort: targetTodo.sort,
            indent: targetTodo.indent,
        }
        let _todos: TodoProps[] = []
        if (todoFunc.isEmpty(replace)) {
            _todos = todoFunc.delete(todos, targetTodoId)
            handleSetTodos(_todos, prevTodos)
            setCurrentIndex(currentIndex === 0 ? 0 : currentIndex - 1)
        } else {
            const t = todos.filter(_t => _t.id === replace.id)[0]
            if (!isEqual(t, replace)) {
                _todos = todoFunc.modify(todos, replace)
                handleSetTodos(_todos, prevTodos)
            }
            setCurrentIndex(todoFunc.getIndexById(filteredTodos, targetTodoId))
        }
        setPrefix('text')
        setMode('normal')
    }

    const completeTask = (index: number, prevTodos: TodoProps[]) => {
        const _todos = todoFunc.modify(todos, {
            id: filteredTodos[index].id,
            is_complete: !filteredTodos[index].is_complete,
            priority: filteredTodos[index].priority,
            completionDate: !filteredTodos[index].is_complete ? new Date().toISOString() : null,
            creationDate: filteredTodos[index].creationDate,
            text: filteredTodos[index].text,
            projectId: filteredTodos[index].projectId,
            labelId: filteredTodos[index].labelId,
            detail: filteredTodos[index].detail,
            sort: filteredTodos[index].sort,
            indent: filteredTodos[index].indent,
            startDate: filteredTodos[index].startDate ?? yyyymmddhhmmss(new Date(new Date(filteredTodos[index].creationDate || new Date()).setHours(0, 0, 0))),
            endDate: filteredTodos[index].endDate ?? yyyymmddhhmmss(new Date(new Date(filteredTodos[index].creationDate || new Date()).setHours(23, 59, 59))),
            inProgress: filteredTodos[index].inProgress,
        })
        handleSetTodos(_todos, prevTodos)
    }

    const priorityTask = (todos: TodoProps[], prevTodos: TodoProps[], targetId: string, action: 'plus' | 'minus') => {
        const targetTodo = todos.filter(t => t.id === targetId)[0]
        const _priority = targetTodo.priority
        let newPriority = 0
        if (_priority !== undefined && ['1', '2', '3'].includes(_priority)) {
            let _p = Number(_priority)
            newPriority = action === 'plus' ? _p + 1 : _p - 1
            if (3 < newPriority) newPriority = 3
            if (newPriority < 0) newPriority = 0
        } else {
            newPriority = action === "plus" ? 1 : 0
        }
        const _todos = todoFunc.modify(todos, {
            id: targetTodo.id,
            is_complete: targetTodo.is_complete,
            priority: newPriority === 0 ? "" : newPriority.toString(),
            completionDate: targetTodo.completionDate,
            creationDate: targetTodo.creationDate,
            text: targetTodo.text,
            projectId: targetTodo.projectId,
            labelId: targetTodo.labelId,
            detail: targetTodo.detail,
            sort: targetTodo.sort,
            indent: targetTodo.indent,
            startDate: targetTodo.startDate ?? yyyymmddhhmmss(new Date(new Date(targetTodo.creationDate || new Date()).setHours(0, 0, 0))),
            endDate: targetTodo.endDate ?? yyyymmddhhmmss(new Date(new Date(targetTodo.creationDate || new Date()).setHours(23, 59, 59))),
            inProgress: targetTodo.inProgress,
        })
        handleSetTodos(_todos, prevTodos)
    }

    const indentTask = (todos: TodoProps[], prevTodos: TodoProps[], targetId: string, action: 'plus' | 'minus') => {
        const targetTodo = todos.filter(t => t.id === targetId)[0]
        let indent = targetTodo.indent ?? 0
        if (action === 'plus') indent = 1
        if (action === 'minus') indent = 0

        const _todos = todoFunc.modify(todos, {
            id: targetTodo.id,
            is_complete: targetTodo.is_complete,
            priority: targetTodo.priority,
            completionDate: targetTodo.completionDate,
            creationDate: targetTodo.creationDate,
            text: targetTodo.text,
            projectId: targetTodo.projectId,
            labelId: targetTodo.labelId,
            detail: targetTodo.detail,
            sort: targetTodo.sort,
            indent: indent,
            startDate: targetTodo.startDate ?? yyyymmddhhmmss(new Date(new Date(targetTodo.creationDate || new Date()).setHours(0, 0, 0))),
            endDate: targetTodo.endDate ?? yyyymmddhhmmss(new Date(new Date(targetTodo.creationDate || new Date()).setHours(23, 59, 59))),
            inProgress: targetTodo.inProgress,
        })
        handleSetTodos(_todos, prevTodos)
    }
    const changeProject = (index: number) => {
        setCurrentProjectId(index === -1 ? "" : filteredProjects[index].id)
        setCurrentIndex(0)
        setCommand('')
    }

    const keepPosition = (filteredTodos: TodoProps[], currentIndex: number, id?: string) => setKeepPositionId(id ? id : filteredTodos.length > 0 ? filteredTodos[currentIndex].id : undefined)

    const changePeriod = (todoId: string, todos: TodoProps[], prevTodos: TodoProps[], startDate: string, endDate: string) => {
        const _todos = todos.map(t => {
            if (t.id === todoId) {
                return { ...t, startDate: startDate, endDate: endDate }
            }
            return t
        })
        handleSetTodos(_todos, prevTodos)
    }
    const handlePeriodChange = (todoId: string, startDate: Date, endDate: Date) => {
        if (mode !== "normal") {
            toNormalMode(todos, prevTodos, mode, filteredTodos, currentIndex)
        }
        const startDateStr = yyyymmddhhmmss(startDate)
        const endDateStr = yyyymmddhhmmss(endDate)
        changePeriod(todoId, todos, prevTodos, startDateStr, endDateStr)
    }

    /** hotkeys  */
    useHotkeys('*', (e) => {
        const key = ["Shift", "Meta", "Tab", "Control", "Alt", "KanjiMode"].includes(e.key) ? "" : e.key
        if (key) {
            let strKey = key
            if (e.altKey) strKey = "Alt + " + strKey
            if (e.ctrlKey) strKey = "Ctrl + " + strKey
            if (e.metaKey) strKey = "Meta + " + strKey
            setCurrentKeys((prev) => {
                return [strKey, ...prev.slice(0, 2)]
            })
        }
    }, { enabled: true }, [])

    /*******************
     * 
     * Normal mode
     * 
     *******************/
    // save
    useHotkeys(keymap['save'].keys, (e) => onClickSaveButton(), setKeyEnableDefine(keymap['save'].enable))

    // move to up 
    useHotkeys(keymap['up'].keys, (e) => {
        if (0 < currentIndex) setCurrentIndex(currentIndex - 1)
        setCommand('')
        if (mode === "select") {
            if (currentIndex <= 0 || !selectTaskId) return
            handleSetTodos(todoFunc.swap(todos, selectTaskId, filteredTodos[currentIndex - 1].id), prevTodos)
        }
    }, setKeyEnableDefine(keymap['up'].enable), [todos, currentIndex, mode, selectTaskId, prevTodos, filteredTodos])

    // move to down
    useHotkeys(keymap['down'].keys, (e) => {
        if (currentIndex < filteredTodos.length - 1) setCurrentIndex(currentIndex + 1)
        setCommand('')
        if (mode === "select") {
            if (currentIndex >= filteredTodos.length - 1 || !selectTaskId) return
            handleSetTodos(todoFunc.swap(todos, selectTaskId, filteredTodos[currentIndex + 1].id), prevTodos)
        }
    }, setKeyEnableDefine(keymap['down'].enable), [todos, currentIndex, filteredTodos, mode, selectTaskId, prevTodos])

    useHotkeys(keymap['moveToTop'].keys, (e) => {
        setCurrentIndex(0)
        // if (mode !== "select") setMode('normal')
        if (mode === "select") {
            if (currentIndex <= 0 || !selectTaskId) return
            handleSetTodos(todoFunc.move(todos, todoFunc.getIndexById(todos, selectTaskId), 0), prevTodos)
        }
    }, setKeyEnableDefine(keymap['moveToTop'].enable), [mode, selectTaskId, todos, prevTodos])

    useHotkeys(keymap['moveToEnd'].keys, (e) => {
        setCurrentIndex(filteredTodos.length - 1)
        if (mode === "select") {
            if (currentIndex >= filteredTodos.length - 1 || !selectTaskId) return
            handleSetTodos(todoFunc.move(todos, todoFunc.getIndexById(todos, selectTaskId), todos.length - 1), prevTodos)
        }
        // if (mode !== "select") setMode('normal')
    }, setKeyEnableDefine(keymap['moveToEnd'].enable), [filteredTodos, mode, selectTaskId, todos, prevTodos])

    // move to right project
    useHotkeys(keymap['moveProjectRight'].keys, (e) => {
        handleMoveProject("right", filteredProjects, currentProjectId)
    }, setKeyEnableDefine(keymap['moveProjectRight'].enable), [filteredProjects, currentProjectId])

    // move to left project
    useHotkeys(keymap['moveProjectLeft'].keys, (e) => {
        handleMoveProject("left", filteredProjects, currentProjectId)
    }, setKeyEnableDefine(keymap['moveProjectLeft'].enable), [filteredProjects, currentProjectId])

    // insert task 
    useHotkeys(keymap['insert'].keys, (e) => {
        if (!todoEnables.enableAddTodo) return toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        const _indent = filteredTodos[currentIndex].indent ?? 0
        handleSetTodos(todoFunc.add(currentIndex, todos, { projectId: currentProjectId, viewCompletionTask: viewCompletionTask, indent: _indent }), prevTodos)
        setMode('edit')
    }, setKeyEnableDefine(keymap['insert'].enable), [currentIndex, todos, currentProjectId, viewCompletionTask, todoEnables, prevTodos])

    // add task to Top
    useHotkeys(keymap['insertTop'].keys, (e) => {
        if (!todoEnables.enableAddTodo) return toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        handleSetTodos(todoFunc.add(0, todos, { projectId: currentProjectId, viewCompletionTask: viewCompletionTask }), prevTodos)
        setCurrentIndex(0)
        setMode('edit')
    }, setKeyEnableDefine(keymap['insertTop'].enable), [mode, currentProjectId, viewCompletionTask, todos, prevTodos, todoEnables])

    // add task to Top
    useHotkeys(keymap['insertTopOnSort'].keys, (e) => {
        if (!todoEnables.enableAddTodo) return toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        setMode('editOnSort')
    }, setKeyEnableDefine(keymap['insertTopOnSort'].enable), [todoEnables])

    // append task 
    useHotkeys(keymap['append'].keys, (e) => {
        if (!todoEnables.enableAddTodo) return toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        const _indent = currentIndex + 1 < filteredTodos.length ? filteredTodos[currentIndex + 1].indent ?? 0 : 0
        handleSetTodos(todoFunc.add(currentIndex + 1, todos, { projectId: currentProjectId, viewCompletionTask: viewCompletionTask, indent: _indent }), prevTodos)
        setCurrentIndex(currentIndex + 1)
        setMode('edit')
    }, setKeyEnableDefine(keymap['append'].enable), [todos, currentIndex, currentProjectId, viewCompletionTask, todoEnables, prevTodos])

    // append task to bottom
    useHotkeys(keymap['appendBottom'].keys, (e) => {
        if (!todoEnables.enableAddTodo) {
            toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        } else {
            handleSetTodos(todoFunc.add(filteredTodos.length, todos, { projectId: currentProjectId, viewCompletionTask: viewCompletionTask }), prevTodos)
            setCurrentIndex(filteredTodos.length)
            setMode('edit')
        }
    }, setKeyEnableDefine(keymap['appendBottom'].enable), [filteredTodos, currentProjectId, viewCompletionTask, todoEnables, prevTodos])

    // delete task
    const deleteTask = (currentIndex: number, filteredTodos: TodoProps[], prevTodos: TodoProps[]) => {
        handleSetTodos(todoFunc.delete(todos, filteredTodos[currentIndex].id), prevTodos)
        const index = currentIndex >= filteredTodos.length ? filteredTodos.length - 1 : currentIndex === 0 ? currentIndex : currentIndex - 1
        setCurrentIndex(index)
        setMode('normal')
        setPrefix('text')
    }
    useHotkeys(keymap['deleteModal'].keys, (e) => {
        setMode('modal')
        setPrefix('delete')
    }, setKeyEnableDefine(keymap['deleteModal'].enable), [todos, filteredTodos, currentIndex])

    useHotkeys(keymap['delete'].keys, (e) => {
        if (prefix !== 'delete') return
        deleteTask(currentIndex, filteredTodos, prevTodos)
    }, setKeyEnableDefine(keymap['delete'].enable), [currentIndex, filteredTodos, prevTodos, prefix])

    // change to edit mode
    useHotkeys(keymap['editText'].keys, (e) => {
        setMode('edit')
    }, setKeyEnableDefine(keymap['editText'].enable))

    // change to priority edit mode
    // useHotkeys(keymap['editPriority'].keys, (e) => {
    //     setPrefix('priority')
    //     setMode('edit')
    // }, setKeyEnableDefine(keymap['editPriority'].enable))
    useHotkeys(keymap['increasePriority'].keys, (e) => {
        priorityTask(todos, prevTodos, filteredTodos[currentIndex].id, 'plus')
    }, setKeyEnableDefine(keymap['increasePriority'].enable), [todos, filteredTodos, currentIndex, prevTodos])

    useHotkeys(keymap['decreasePriority'].keys, (e) => {
        priorityTask(todos, prevTodos, filteredTodos[currentIndex].id, 'minus')
    }, setKeyEnableDefine(keymap['decreasePriority'].enable), [todos, filteredTodos, currentIndex, prevTodos])

    // change to project edit mode
    useHotkeys(keymap['editProject'].keys, (e) => {
        setPrefix('projectId')
        setMode('modal')
    }, { ...setKeyEnableDefine(keymap['editProject'].enable) })

    // change to label edit mode
    useHotkeys(keymap['editLabel'].keys, (e) => {
        setPrefix('labelId')
        setMode('modal')
    }, setKeyEnableDefine(keymap['editLabel'].enable))

    // change to edit mode
    useHotkeys(keymap['completion'].keys, (e) => {
        completeTask(currentIndex, prevTodos)
        if (!viewCompletionTask && currentIndex >= filteredTodos.length - 1) setCurrentIndex(filteredTodos.length - 1)
    }, setKeyEnableDefine(keymap['completion'].enable), [currentIndex, filteredTodos, prevTodos])

    // change sort mode
    // useHotkeys(keymap['sortMode'].keys, (e) => {
    //     setMode("sort")
    // }, setKeyEnableDefine(keymap['sortMode'].enable))

    // toggle view commpletion / incompletion
    useHotkeys(keymap['toggleCompletionTask'].keys, (e) => {
        if (completionOnly) return
        keepPosition(filteredTodos, currentIndex)
        setViewCompletionTask(!viewCompletionTask)
    }, setKeyEnableDefine(keymap['toggleCompletionTask'].enable), [viewCompletionTask, filteredTodos, currentIndex])


    useHotkeys(keymap['undo'].keys, (e) => {
        if (historyTodos.length === 0 || undoCount >= historyTodos.length - 1) return
        undo(undoCount, historyTodos)
    }, setKeyEnableDefine(keymap['undo'].enable), [todos, undoCount, historyTodos, prevTodos, filteredTodos, currentIndex])

    useHotkeys(keymap['redo'].keys, (e) => {
        if (historyTodos.length === 0 || undoCount <= 0) return
        redo(undoCount, historyTodos)
    }, setKeyEnableDefine(keymap['redo'].enable), [undoCount, historyTodos, prevTodos, filteredTodos, currentIndex])

    useHotkeys(keymap['indent'].keys, (e) => {
        indentTask(todos, prevTodos, filteredTodos[currentIndex].id, 'plus')
    }, setKeyEnableDefine(keymap['indent'].enable), [todos, prevTodos, filteredTodos, currentIndex])

    useHotkeys(keymap['unIndnet'].keys, (e) => {
        indentTask(todos, prevTodos, filteredTodos[currentIndex].id, 'minus')
    }, setKeyEnableDefine(keymap['unIndnet'].enable), [todos, prevTodos, filteredTodos, currentIndex])

    /*******************
     * 
     * Display Ganttc mode
     * 
     *******************/
    useHotkeys(keymap['changeDisplayMode'].keys, (e) => {
        setDisplayMode(displayMode === "Ganttc" ? "List" : "Ganttc")
    }, setKeyEnableDefine(keymap['changeDisplayMode'].enable), [displayMode])

    useHotkeys(keymap['expandEndDate'].keys, (e) => {
        const currentEndDate = new Date(filteredTodos[currentIndex].endDate)
        currentEndDate.setDate(currentEndDate.getDate() + 1)
        currentEndDate.setHours(23, 59, 59)
        const endDate = currentEndDate.toString()
        handlePeriodChange(filteredTodos[currentIndex].id, new Date(filteredTodos[currentIndex].startDate), new Date(endDate))
    }, setKeyEnableDefine(keymap['expandEndDate'].enable), [filteredTodos, currentIndex])

    useHotkeys(keymap['shrinkEndDate'].keys, (e) => {
        const currentEndDate = new Date(filteredTodos[currentIndex].endDate)
        currentEndDate.setDate(currentEndDate.getDate() - 1)
        currentEndDate.setHours(23, 59, 59)
        const endDate = currentEndDate.toString()
        handlePeriodChange(filteredTodos[currentIndex].id, new Date(filteredTodos[currentIndex].startDate), new Date(endDate))
    }, setKeyEnableDefine(keymap['shrinkEndDate'].enable), [filteredTodos, currentIndex])

    useHotkeys(keymap['shiftPeriodForward'].keys, (e) => {
        const currentStartDate = new Date(filteredTodos[currentIndex].startDate)
        const currentEndDate = new Date(filteredTodos[currentIndex].endDate)
        currentStartDate.setDate(currentStartDate.getDate() + 1)
        currentEndDate.setDate(currentEndDate.getDate() + 1)
        currentStartDate.setHours(0, 0, 0)
        currentEndDate.setHours(23, 59, 59)
        const startDate = currentStartDate.toString()
        const endDate = currentEndDate.toString()
        handlePeriodChange(filteredTodos[currentIndex].id, new Date(startDate), new Date(endDate))
    }, setKeyEnableDefine(keymap['shiftPeriodForward'].enable), [filteredTodos, currentIndex])

    useHotkeys(keymap['shiftPeriodBackward'].keys, (e) => {
        const currentStartDate = new Date(filteredTodos[currentIndex].startDate)
        const currentEndDate = new Date(filteredTodos[currentIndex].endDate)
        currentStartDate.setDate(currentStartDate.getDate() - 1)
        currentEndDate.setDate(currentEndDate.getDate() - 1)
        currentStartDate.setHours(0, 0, 0)
        currentEndDate.setHours(23, 59, 59)
        const startDate = currentStartDate.toString()
        const endDate = currentEndDate.toString()
        handlePeriodChange(filteredTodos[currentIndex].id, new Date(startDate), new Date(endDate))
    }, setKeyEnableDefine(keymap['shiftPeriodBackward'].enable), [filteredTodos, currentIndex])


    /*******************
     * 
     * Sort mode
     * 
     *******************/
    useHotkeys(keymap['sortPriority'].keys, (e) => {
        keepPosition(filteredTodos, currentIndex)
        setSort("priority")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortPriority'].enable), [currentIndex, filteredTodos])

    useHotkeys(keymap['sortClear'].keys, (e) => {
        keepPosition(filteredTodos, currentIndex)
        setSort(undefined)
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortClear'].enable), [filteredTodos, currentIndex])

    useHotkeys(keymap['sortCreationDate'].keys, (e) => {
        setSort("creationDate")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortCreationDate'].enable))

    useHotkeys(keymap['sortCompletion'].keys, (e) => {
        keepPosition(filteredTodos, currentIndex)
        setSort("is_complete")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortCompletion'].enable), [filteredTodos, currentIndex])


    // change command mode
    // useHotkeys(':', (e) => {
    //     setMode('command')
    //     setCommand(e.key)
    // }, enabled.normal)

    /*******************
     * 
     * Edit mode
     * 
     *******************/
    // change to normal mode
    useHotkeys(keymap['normalMode'].keys, (e) => {
        if (mode === "select") {
            setSelectTaskId(undefined)
            setMode("normal")
        } else {
            if (!isComposing && !e.isComposing) toNormalMode(todos, prevTodos, mode, filteredTodos, currentIndex)
            setCommand('')
        }
    }, setKeyEnableDefine(keymap['normalMode'].enable), [todos, prevTodos, mode, filteredTodos, currentIndex, isComposing])

    useHotkeys(keymap['normalModeOnSort'].keys, (e) => {
        if (!isComposing && !e.isComposing) {
            const newId = self.crypto.randomUUID()
            const newtask = {
                id: newId,
                creationDate: yyyymmddhhmmss(new Date()),
                text: getValues(`newtask`),
                projectId: currentProjectId,
                startDate: yyyymmddhhmmss(new Date(new Date().setHours(0, 0, 0))),
                endDate: yyyymmddhhmmss(new Date(new Date().setHours(23, 59, 59))),
                inProgress: 0,
            }
            if (!todoFunc.isEmpty(newtask)) {
                handleSetTodos([newtask, ...todos], prevTodos)
                setValue("newtask", "")
                keepPosition(filteredTodos, currentIndex, newId)
            }
            setPrefix('text')
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['normalModeOnSort'].enable), [currentProjectId, filteredTodos, currentIndex])

    useHotkeys(keymap['normalModefromEditDetail'].keys, (e) => {
        if (!isComposing && !e.isComposing) toNormalMode(todos, prevTodos, mode, filteredTodos, currentIndex)
        setCommand('')
    }, setKeyEnableDefine(keymap['normalModefromEditDetail'].enable), [todos, prevTodos, mode, filteredTodos, currentIndex])

    useHotkeys(keymap['normalModefromEditDetailText'].keys, (e) => {
        if (prefix !== "text") return
        if (!isComposing && !e.isComposing) toNormalMode(todos, prevTodos, mode, filteredTodos, currentIndex)
        setCommand('')
    }, { ...setKeyEnableDefine(keymap['normalModefromEditDetail'].enable), preventDefault: prefix === "text" }, [todos, prevTodos, prefix, mode, filteredTodos, currentIndex])

    useHotkeys(keymap['numberMode'].keys, (e) => {
        setCommand(command + e.key)
        setMode('number')
    }, setKeyEnableDefine(keymap['numberMode'].enable), [command])

    useHotkeys(keymap['numberInput'].keys, (e) => {
        setCommand(command + e.key)
        setMode('number')
    }, setKeyEnableDefine(keymap['numberInput'].enable), [command])

    useHotkeys(keymap['addProject'].keys, (e) => {
        setMode('editProject')
    }, setKeyEnableDefine(keymap['addProject'].enable), [command])

    /******************
     *
     * Number mode
     * 
     *****************/
    const moveToLine = (line: number) => {
        if (!isNaN(line)) {
            if (filteredTodos.length >= line) {
                setCurrentIndex(line - 1)
                return true
            } else {
                setLog("not found line")
                return false
            }
        }
    }

    useHotkeys(keymap['moveToLine'].keys, (e) => {
        const line = parseInt(command)
        moveToLine(line)
        setMode('normal')
        setCommand('')
    }, setKeyEnableDefine(keymap['moveToLine'].enable), [command])

    useHotkeys(keymap['appendToLine'].keys, (e) => {
        const line = parseInt(command)
        if (moveToLine(line)) {
            handleSetTodos(todoFunc.add(line, todos, { projectId: currentProjectId, viewCompletionTask: viewCompletionTask }), prevTodos)
            setCurrentIndex(line)
            setMode('edit')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['appendToLine'].enable), [command, todos, currentProjectId, viewCompletionTask, prevTodos])

    useHotkeys(keymap['insertToLine'].keys, (e) => {
        const line = parseInt(command)
        if (moveToLine(line)) {
            handleSetTodos(todoFunc.add(line - 1, todos, { projectId: currentProjectId, viewCompletionTask: viewCompletionTask }), prevTodos)
            setCurrentIndex(line - 1)
            setMode('edit')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['insertToLine'].enable), [command, todos, currentProjectId, viewCompletionTask, prevTodos])


    useHotkeys(keymap['editProjectLine'].keys, (e) => {
        const line = parseInt(command)
        if (moveToLine(line)) {
            setPrefix('projectId')
            setMode('modal')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['editProjectLine'].enable), [command])

    useHotkeys(keymap['editLabelLine'].keys, (e) => {
        const line = parseInt(command)
        if (moveToLine(line)) {
            setPrefix('labelId')
            setMode('modal')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['editLabelLine'].enable), [command])

    useHotkeys(keymap['editTextLine'].keys, (e) => {
        const line = parseInt(command)
        if (moveToLine(line)) {
            setMode('edit')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['editTextLine'].enable), [command])

    useHotkeys(keymap['editDetail'].keys, (e) => {
        setPrefix("detail")
        setMode('editDetail')
    }, setKeyEnableDefine(keymap['editDetail'].enable))

    // change to search mode
    useHotkeys(keymap['searchMode'].keys, (e) => {
        setValue("search", "")
        setMode("search")
        setFocus('search')
    }, setKeyEnableDefine(keymap['searchMode'].enable))
    // search mode cancel
    useHotkeys(keymap['searchEsc'].keys, (e) => {
        setValue("search", "")
        setMode("normal")
        setCurrentIndex(currentIndex)
    }, setKeyEnableDefine(keymap['searchEsc'].enable))
    // search word
    useHotkeys(keymap['searchEnter'].keys, (e) => {
        if (!isComposing && !e.isComposing) {
            const keyword = getValues('search').replace(/\s+/g, '')
            keyword
                ? setSearchResultIndex(filteredTodos.map(t => t.text.toLocaleLowerCase().replace(/\s+/g, '').includes(keyword.toLowerCase().replace(/\s+/g, ''))))
                : setSearchResultIndex([])
            setMode("normal")
        }
    }, setKeyEnableDefine(keymap['searchEnter'].enable), [filteredTodos])

    // help toggle
    useHotkeys(keymap['viewHelp'].keys, (e) => {
        setHelp(!isHelp)
    }, setKeyEnableDefine(keymap['viewHelp'].enable), [isHelp])


    /*******************
     * Tab無効化
     * *****************/

    useHotkeys('Tab', () => { }, { enabled: true, enableOnContentEditable: true, enableOnFormTags: true, preventDefault: true })

    /*******************
     * 
     * Command mode
     * 
     *******************/

    /*******************
     * 
     * Select mode
     * 
     *******************/

    useHotkeys(keymap['select'].keys, (e) => {
        setSelectTaskId(filteredTodos[currentIndex].id)
        setMode('select')
    }, setKeyEnableDefine(keymap['select'].enable), [filteredTodos, currentIndex])

    const handleClickElement = (index: number, prefix: string) => {
        if (prefix === 'completion') completeTask(index, prevTodos)
        if (prefix === 'projectTab') changeProject(index)
        if (['priority', 'text'].includes(prefix)) {
            setCurrentIndex(index)
            setPrefix(prefix)
            setMode('edit')
        }
        if (['projectId', 'labelId'].includes(prefix)) {
            setPrefix(prefix)
            setMode('modal')
        }
        if (prefix === 'normal') toNormalMode(todos, prevTodos, mode, filteredTodos, index)
        if (prefix === 'editDetail') {
            setCurrentIndex(index)
            setPrefix('detail')
            setMode('editDetail')
        }
    }
    const handleClickDetailElement = (prefix: string) => {
        if (prefix === 'completion') completeTask(currentIndex, prevTodos)
        if (prefix === 'detail' || prefix === "text") {
            setPrefix(prefix)
            setMode("editDetail")
        }
        if (prefix === "normal") toNormalMode(todos, prevTodos, mode, filteredTodos, currentIndex)
        if (['projectId', 'labelId'].includes(prefix)) {
            setPrefix(prefix)
            setMode('modal')
        }
    }
    const handleMainMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (mode !== "modal" && mode !== "normal") {
            toNormalMode(todos, prevTodos, mode, filteredTodos, currentIndex)
        }
        e.preventDefault()
        e.stopPropagation();
    }

    const handleDetailMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (mode !== "modal" && mode !== "normal") {
            toNormalMode(todos, prevTodos, mode, filteredTodos, currentIndex)
        }
        e.stopPropagation();
    }

    const getNextProjectIndex = (direction: "right" | "left", projects: ProjectProps[], currentProjectId: string) => {
        if (projects.length <= 0) return
        if (direction === "right") {
            if (!currentProjectId) {
                return 0
            } else {
                const _index = projects.map(p => p.id).indexOf(currentProjectId)
                if (_index < projects.length - 1) return _index + 1
            }
        } else {
            if (!currentProjectId) return
            const _index = projects.map(p => p.id).indexOf(currentProjectId)
            if (_index === 0) {
                return -1
            } else {
                return _index - 1
            }
        }
    }

    const handleMoveProject = (direction: "right" | "left", projects: ProjectProps[], currentProjectId: string) => {
        const index = getNextProjectIndex(direction, projects, currentProjectId)
        if (index === undefined) return
        changeProject(index)
    }

    const undo = (undoCount: number, historyTodos: TodoProps[][]) => {
        let u = undoCount + 1
        setTodos(historyTodos[u])
        setUndoCount(u)
        setIsUpdate(true)
    }
    const redo = (undoCount: number, historyTodos: TodoProps[][]) => {
        const u = undoCount - 1
        setTodos(historyTodos[u])
        setUndoCount(u)
        setIsUpdate(true)
    }
    const MenuButton = ({ children, className, disabled, label, description, onClick }: { children: React.ReactNode, className?: string, disabled?: boolean, label?: string, description?: string, onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void }) => {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                        <button onClick={onClick}
                            onMouseDown={e => e.stopPropagation()}
                            className={cn(`p-1 hover:cursor-pointer border disabled:text-secondary-foreground/20 hover:border-primary rounded-sm border-transparent transition-all`, className)} disabled={disabled}>{children}</button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs" align="start" side="bottom">
                        <div className="text-xs whitespace-pre-wrap word-break">
                            {label}
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-pre-wrap word-break">
                            {description}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider >
        )
    }
    const handleClickAddButton = () => {
        if (!todoEnables.enableAddTodo) return toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        handleSetTodos(todoFunc.add(0, todos, { projectId: currentProjectId, viewCompletionTask: viewCompletionTask }), prevTodos)
        setCurrentIndex(0)
        setMode('edit')
    }

    const [touchStartX, setTouchStartX] = useState(0);
    const [touchEndX, setTouchEndX] = useState(0);

    const handleTouchStart = (event: React.TouchEvent) => {
        setTouchStartX(event.changedTouches[0].screenX);
    };

    const handleTouchMove = (event: React.TouchEvent) => {
        setTouchEndX(event.changedTouches[0].screenX);
    };

    const handleTouchEnd = () => {
        const swipeThreshold = 30; // スワイプ感度の閾値
        if (touchEndX === 0) return
        const swipeDistance = touchEndX - touchStartX;
        // 右にスワイプ
        if (swipeDistance > swipeThreshold) handleMoveProject("left", filteredProjects, currentProjectId);
        // 左にスワイプ
        if (swipeDistance < -swipeThreshold) handleMoveProject("right", filteredProjects, currentProjectId);
        setTouchStartX(0);
        setTouchEndX(0);
    };

    const projectTop = useRef<HTMLDivElement>(null);
    const projectLast = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!currentProjectId && projectTop.current) {
            projectTop.current.scrollIntoView({ behavior: "smooth" })
        }
        if (filteredProjects.length - 1 === findIndex(filteredProjects, p => p.id === currentProjectId) && projectLast.current) {
            projectLast.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [currentProjectId, filteredProjects])

    /** ドラッグイベント処理 */
    const [isDragging, setIsDragging] = useState(false);
    const [clickPosition, setClickPosition] = useState({ x: 0, y: 0 });
    const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
    const [isOverlay, setIsOverlay] = useState(false)
    // マウスの移動距離を計算する関数
    const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    const handleDragStart = (event: DragStartEvent) => {
        if (event.activatorEvent.type === "pointerdown") {
            const { clientX, clientY } = event.activatorEvent as PointerEvent;
            setInitialPosition({ x: clientX, y: clientY });
            setClickPosition({ x: clientX, y: clientY });
        }
    };

    const handleDragMove = (event: DragMoveEvent) => {
        const { x: deltaX, y: deltaY } = event.delta;
        const currentX = clickPosition.x + deltaX;
        const currentY = clickPosition.y + deltaY;
        const distance = calculateDistance(
            initialPosition.x,
            initialPosition.y,
            currentX,
            currentY
        );

        // 移動距離が5px以上の場合にドラッグ開始とみなす
        if (distance > 5 && !isDragging) {
            setIsDragging(true);
            setIsOverlay(event.active.data.current?.type === "todo")
        }

        // // ドラッグ中は位置を更新
        // if (isDragging) {
        //     setClickPosition({ x: initialPosition.x + deltaX, y: initialPosition.y + deltaY });
        // }
    };

    const handleDragEnd = (e: DragEndEvent) => {
        setIsDragging(false)
        setIsOverlay(false)
        const activeCurrent = e.active?.data?.current
        const overCurrent = e.over?.data?.current
        if (overCurrent?.type === "projectTab") {
            if (activeCurrent?.type === "todo") {
                const projectId = overCurrent ? overCurrent?.id : ""
                const activeTodoId = activeCurrent?.id
                handleSetTodos(todoFunc.update(todos, activeTodoId, { projectId: projectId }), prevTodos)
            }
            if (activeCurrent?.type === "projectTab") {
                const activeProjectId = activeCurrent?.id
                const overProjectId = overCurrent?.id
                let _projects = todoFunc.move(exProjects, todoFunc.getIndexById(exProjects, activeProjectId), todoFunc.getIndexById(exProjects, overProjectId))
                _projects = _projects.map((p, i) => {
                    p.sort = i
                    return p
                })
                setExProjects(_projects)
                // setExProjects(todoFunc.move(exProjects, todoFunc.getIndexById(exProjects, activeProjectId), todoFunc.getIndexById(exProjects, overProjectId)))
            }
        }
        if (overCurrent?.type === "todo") {
            const overTodoId = overCurrent?.id
            const activeTodoId = activeCurrent?.id
            handleSetTodos(todoFunc.move(todos, todoFunc.getIndexById(todos, activeTodoId), todoFunc.getIndexById(todos, overTodoId)), prevTodos)
            setCurrentIndex(todoFunc.getIndexById(filteredTodos, overTodoId))
        }
    };

    return (
        <>
            <DndContext onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
                <header className={cn(`shrink-0 h-[${HEADER_HEIGHT_SM}px] sm:h-[${HEADER_PROJECT_TAB_HEIGHT + HEADER_MENU_BAR_HEIGHT}px] gap-2 transition-[width,height] ease-linear bg-muted text-muted-foreground`)}>
                    <div
                        style={{ height: HEADER_PROJECT_TAB_HEIGHT }}
                        className={cn(`hidden sm:block relative w-full border-b`)}>
                        <div className={`w-full h-full flex justify-start  items-end overflow-x-auto overflow-y-hidden flex-nowrap text-nowrap hidden-scrollbar text-foreground`}  >
                            <div ref={projectTop} />
                            {isDragging && isOverlay && <ExOverlay id="overlay" isDragging={isDragging} clickPosition={clickPosition} />}
                            <ProjectTab tabId={"all"} currentProjectId={currentProjectId} index={-1} onClick={handleClickElement} filteredProjects={filteredProjects} exProjects={exProjects} setProjects={setExProjects} />
                            <SortableContext items={filteredProjects.map(p => p.id)} strategy={rectSortingStrategy}>
                                {!loading && filteredProjects.map((p, i) => <ProjectTab key={p.id} tabId={p.id} currentProjectId={currentProjectId} index={i} filteredProjects={filteredProjects} exProjects={exProjects} onClick={handleClickElement} project={p} setProjects={setExProjects} />)}
                            </SortableContext>
                            <div className="sticky right-0 top-0 h-full bg-muted/60 backdrop-blur-sm  flex items-center px-2" >
                                <ProjectEditModal
                                    buttonLabel={<Plus size={14} />}
                                    className="outline-none  p-2 rounded-md hover:bg-primary/10"
                                    mode={mode}
                                    setMode={setMode}
                                    exProjects={exProjects}
                                    setExProjects={setExProjects}
                                />
                                <ProjectTabSettingModal
                                    buttonLabel={<Settings2 size={14} />}
                                    className="outline-none  p-2 rounded-md hover:bg-primary/10"
                                    mode={mode}
                                    setMode={setMode}
                                    exProjects={exProjects}
                                    setExProjects={setExProjects}
                                />
                            </div>
                            <div ref={projectLast} className="text-transparent  min-w-[80px] h-[10px]" />
                        </div>
                    </div>
                    <div
                        style={{ height: `${HEADER_MENU_BAR_HEIGHT}px` }}
                        className={`flex justify-between items-center  bg-card text-card-foreground`}>
                        <div className="flex items-center gap-2 h-full px-2 mx-2 ">
                            <div className="block md:hidden"><SidebarTrigger className="border" /></div>
                            <MenuButton label="元に戻す（Undo）" onClick={() => undo(undoCount, historyTodos)} disabled={historyTodos.length === 0 || undoCount >= historyTodos.length - 1}><Undo2 size={16} /></MenuButton>
                            <MenuButton label="やり直し（Redo）" onClick={() => redo(undoCount, historyTodos)} disabled={historyTodos.length === 0 || undoCount <= 0}><Redo2 size={16} /></MenuButton>
                            <MenuButton label="インデント" onClick={() => filteredTodos[currentIndex] && indentTask(todos, prevTodos, filteredTodos[currentIndex].id, "plus")} disabled={(filteredTodos[currentIndex]?.indent ?? 0) === 1} ><IndentIncrease size={16} /></MenuButton>
                            <MenuButton label="インデントを戻す" onClick={() => filteredTodos[currentIndex] && indentTask(todos, prevTodos, filteredTodos[currentIndex].id, "minus")} disabled={(filteredTodos[currentIndex]?.indent ?? 0) === 0}><IndentDecrease size={16} /></MenuButton>
                            <div className={`hidden sm:block inset-y-1/4 right-0 h-1/2 border-r w-3`}></div>
                            <div className="hidden sm:block">
                                <MenuButton label={`${viewCompletionTask ? "完了したタスクも表示" : "進行中タスクのみ表示"}`} onClick={_ => setViewCompletionTask(prev => !prev)}>
                                    {viewCompletionTask ? <Eye size={16} /> : <EyeOffIcon size={16} />}
                                </MenuButton>
                            </div>
                            <div className="hidden sm:block">
                                <MenuButton label="ヘルプ表示/非表示" onClick={() => setHelp(prev => !prev)} ><CircleHelp size={16} /></MenuButton>
                            </div>
                            <div className="hidden sm:block">
                                <MenuButton label="詳細パネルの表示/非表示" onClick={() => setIsOpenRightPanel(prev => !prev)} disabled={displayMode === "Ganttc"} >
                                    <Columns size={16} />
                                </MenuButton>
                            </div>
                            <div className="hidden sm:block">
                                <MenuButton label="文字サイズを小さく" disabled={rowHeightIndex === 0 || rowHeightIndex === undefined} onClick={() => setRowHeightIndex(prev => {
                                    if (prev === undefined) return 0
                                    return prev > 0 ? prev - 1 : 0
                                })} ><ZoomOut size={16} /></MenuButton>
                            </div>
                            <div className="hidden sm:block">
                                <MenuButton label="文字サイズを大きく" disabled={rowHeightIndex === rowHeight.length - 1 || rowHeightIndex === undefined} onClick={() => setRowHeightIndex(prev => {
                                    if (prev === undefined) return 1
                                    return prev < rowHeight.length - 1 ? prev + 1 : prev
                                })} ><ZoomIn size={16} /></MenuButton>
                            </div>
                            <div className={`hidden sm:block inset-y-1/4 right-0 h-1/2 border-r w-3`}></div>
                            <div className="hidden sm:block">
                                <MenuButton
                                    className={`${displayMode === "List" ? "bg-accent text-accent-foreground" : ""}`}
                                    label="リストモード" description={`表示モードをリスト形式に切り替えます。 \n [g]キーで表示モードを交互に切り替えます。`} onClick={() => setDisplayMode("List")} ><ListTodo size={16} /></MenuButton>
                            </div>
                            <div className="hidden sm:block">
                                <MenuButton
                                    className={`${displayMode === "Ganttc" ? "bg-accent text-accent-foreground" : ""}`}
                                    label="ガントチャートモード" description={`表示モードをガントチャート形式に切り替えます。 \n [g]キーで表示モードを交互に切り替えます。`} onClick={() => setDisplayMode("Ganttc")} ><GanttChart size={16} /></MenuButton>
                            </div>
                        </div>
                        <div className="relative flex gap-2 items-center px-2">
                            {!loading && !isLocalMode && isSave !== undefined && isUpdate !== undefined && onClickSaveButton !== undefined && user &&
                                <Button variant={"default"} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={onClickSaveButton} disabled={!isUpdate}>
                                    {(isSave && isUpdate) ? (
                                        <SimpleSpinner className="border-primary-foreground h-4 w-4 p-1 border-t-transparent" />
                                    ) : (
                                        <><Save size={16} />保存</>
                                    )}
                                </Button>
                            }
                            <div className="hidden sm:inline-block">
                                <Button variant={"default"} onClick={handleClickAddButton} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90"><Plus />タスクを追加</Button>
                            </div>
                        </div>
                    </div>
                </header >
                <div style={{ height: contentHeight + BOTTOM_MENU_HEIGHT }} className="w-full bg-muted relative">
                    <div style={{ height: contentHeight }} className="w-full" onMouseDown={handleMainMouseDown}>
                        {loading &&
                            <div
                                className="flex flex-col gap-6 justify-center items-center h-full w-full">
                                <div className="flex space-x-2">
                                    {[0, 1, 2, 3].map((index) => (
                                        <div
                                            key={index}
                                            className="w-2 h-2 rounded-full bg-primary animate-bounce"
                                            style={{
                                                animationDelay: `${index * 0.15}s`,
                                                animationDuration: '0.8s'
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="flex flex-col items-center gap-1">
                                    <span className="font-semibold text-primary">データを読み込み中</span>
                                    <span className="text-sm text-muted-foreground">少々お待ちください...</span>
                                </div>
                            </div>
                        }
                        {!loading && displayMode === "Ganttc" &&
                            <>
                                <div
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                    className={`z-20 h-full w-full sm:block hidden`}>
                                    <GanttcList
                                        filteredTodos={filteredTodos}
                                        currentIndex={currentIndex}
                                        prefix={prefix}
                                        mode={mode}
                                        exProjects={exProjects}
                                        exLabels={exLabels}
                                        currentProjectId={currentProjectId}
                                        sort={sort}
                                        loading={loading}
                                        onClick={handleClickElement}
                                        setCurrentIndex={setCurrentIndex}
                                        setExProjects={setExProjects}
                                        setExLabels={setExLabels}
                                        setIsComposing={setIsComposing}
                                        register={register}
                                        rhfSetValue={setValue}
                                        onChangePeriod={handlePeriodChange}
                                        height={contentHeight - 20}
                                        rowHeight={rowHeight[rowHeightIndex]}
                                    />
                                </div>
                                <div className="flex sm:hidden text-muted-foreground text-xs justify-center items-center h-full">
                                    <div className="flex flex-col items-center gap-2">
                                        <Wallpaper className="w-8 h-8" />
                                        <p className="text-center">
                                            画面幅が狭くてガントチャートを表示できません。<br />
                                            PCで画面をめいいっぱい広げてご利用ください！
                                        </p>
                                    </div>
                                </div>
                            </>
                        }
                        {!loading && displayMode === "List" &&
                            <ResizablePanelGroup direction="horizontal" autoSaveId={"list_detail"}>
                                <ResizablePanel defaultSize={60} minSize={20} className={` relative ${mode === "editDetail" ? "hidden sm:block" : "block"} transition-transform`}>
                                    <div
                                        onTouchStart={handleTouchStart}
                                        onTouchMove={handleTouchMove}
                                        onTouchEnd={handleTouchEnd}
                                        className={`z-20 w-full border-t h-full`}>
                                        <NormalList
                                            filteredTodos={filteredTodos}
                                            currentIndex={currentIndex}
                                            prefix={prefix}
                                            mode={mode}
                                            exProjects={exProjects}
                                            exLabels={exLabels}
                                            currentProjectId={currentProjectId}
                                            sort={sort}
                                            loading={loading}
                                            onClick={handleClickElement}
                                            setCurrentIndex={setCurrentIndex}
                                            setExProjects={setExProjects}
                                            setExLabels={setExLabels}
                                            setIsComposing={setIsComposing}
                                            register={register}
                                            rhfSetValue={setValue}
                                            rowHeight={rowHeight[rowHeightIndex]}
                                        />
                                    </div>
                                </ResizablePanel>
                                <ResizableHandle tabIndex={-1} className="hidden sm:block w-[3px] bg-transparent hover:bg-primary/20  cursor-col-resize " />
                                <ResizablePanel ref={resizeRef} defaultSize={40} minSize={20} className={`relative  bg-card ${mode === "editDetail" ? "block px-2 sm:px-0" : "hidden sm:block"}`} collapsible>
                                    {loading ? (
                                        <></>
                                    ) : (
                                        <>
                                            <div className={`w-full h-full z-20 overflow-y-auto scroll-bar border-t`}>
                                                {(!filteredTodos[currentIndex] || !filteredTodos[currentIndex].text) &&
                                                    <div className="flex flex-col items-center text-muted-foreground justify-center h-full">
                                                        <TentTree className="w-7 h-7" />
                                                        タスクを追加、または選択してください。
                                                    </div>
                                                }
                                                {displayMode === "List" && filteredTodos[currentIndex] && filteredTodos[currentIndex].text &&
                                                    <Detail
                                                        todo={filteredTodos[currentIndex]}
                                                        exProjects={exProjects}
                                                        exLabels={exLabels}
                                                        prefix={prefix}
                                                        mode={mode}
                                                        onMouseDownEvent={handleDetailMouseDown}
                                                        onClick={handleClickDetailElement}
                                                        setValue={setValue}
                                                        watch={watch}
                                                        register={register}
                                                    />
                                                }
                                            </div>
                                        </>
                                    )}
                                </ResizablePanel>
                            </ResizablePanelGroup>
                        }
                        {!loading &&
                            <div className={cn(`h-[${BOTTOM_MENU_HEIGHT}px] absolute bottom-0 border-t items-center justify-between w-full bg-card text-xs px-2 hidden sm:flex`)}>
                                {command ? (
                                    <span>Line：{command}</span>
                                ) : (
                                    <span>No：{currentIndex + 1}</span>
                                )}
                                <div className="flex items-center gap-2">
                                    {mode}
                                    <div>
                                        {loading ? (
                                            <SimpleSpinner className="h-4 w-4 border-t-transparent p-1" />
                                        ) : (
                                            <>
                                                {isLocalMode ? (
                                                    <MenuButton
                                                        className="hover:border-transparent hover:cursor-default"
                                                        label={`ローカルモード`}
                                                        description={`オンラインモードへの切り替えは\n時間をおいてから再度画面更新をお試しください。`}
                                                        onClick={() => { }} ><CloudOff className="text-muted-foreground" size={16} /></MenuButton>
                                                ) : (
                                                    <MenuButton
                                                        className="hover:border-transparent hover:cursor-default"
                                                        label="オンラインモード"
                                                        description={`入力したタスク情報はしばらく立つと自動的にクラウド上へ保存します。\n「保存」ボタンクリックですぐに保存することも可能です。`}
                                                        onClick={() => { }} ><Cloud className="text-primary2" size={16} /></MenuButton>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        }
                        <DeleteModal
                            currentIndex={currentIndex}
                            filteredTodos={filteredTodos}
                            prevTodos={prevTodos}
                            currentPrefix={prefix}
                            mode={mode}
                            onClick={handleClickDetailElement}
                            onDelete={deleteTask}
                        />
                        <BottomMenu
                            todos={todos}
                            prevTodos={prevTodos}
                            completionOnly={completionOnly}
                            viewCompletionTask={viewCompletionTask}
                            projects={exProjects}
                            filteredProjects={filteredProjects}
                            currentProjectId={currentProjectId}
                            handleClickElement={handleClickElement}
                            setViewCompletionTask={setViewCompletionTask}
                            setCurrentProjectId={setCurrentProjectId}
                            setMode={setMode}
                            handleSetTodos={handleSetTodos}
                            todoEnables={todoEnables}
                        />
                        {!loading &&
                            <div className={`absolute bottom-0 ${(isHelp && mode !== "editDetail") ? "h-3/4 opacity-100" : "h-0 opacity-0 pointer-events-none"} w-full z-30 transition-all duration-300 ease-in-out overflow-hidden`}>
                                <Usage
                                    sort={sort}
                                    mode={mode}
                                    displayMode={displayMode}
                                    setHelp={setHelp}
                                    isTodos={filteredTodos.length > 0}
                                />
                            </div>
                        }
                    </div >
                </div >
            </DndContext >
        </>
    )
}

const ExOverlay = (props: {
    id: string,
    isDragging: boolean,
    clickPosition: { x: number, y: number }
}) => {
    return (
        <DragOverlay
            style={{
                width: "25px",
                height: "2.5rem",
            }}
        >
            {props.isDragging ? (
                <div className="w-full h-[calc(100%-10px)] flex justify-center items-center" >
                    <div className="w-full h-full flex justify-center items-center bg-primary/30 rounded-md ">
                        <FileBox className="w-4 h-4 text-primary" />
                    </div>
                </div>
            ) : null}
        </DragOverlay>
    )
}
