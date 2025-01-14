'use client'
import React, { useState, MouseEvent, useEffect, Dispatch, SetStateAction, useRef } from "react"
import { useHotkeys, } from "react-hotkeys-hook"
import { useForm } from "react-hook-form"
import { keymap, completionTaskProjectName } from '@/components/config'
import { TodoEnablesProps, TodoProps, Sort, Mode, ProjectProps, LabelProps } from "@/types"
import { todoFunc } from "@/lib/todo"
import { yyyymmddhhmmss } from "@/lib/time"
import { TodoList } from "./todo-list"
import { Detail } from "./detail"
import { isEqual, findIndex, get, set, sortBy, filter } from "lodash";
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
import { Check, List, Redo2, Undo2, Save, IndentIncrease, IndentDecrease, Box, LayoutList, ListTodo, TentTree, PanelRightClose, CircleHelp, CircleCheck, Eye, EyeOffIcon, Columns, PlusCircle, Plus, PlusIcon, PlusSquareIcon, X, Settings2 } from "lucide-react"
import { BottomMenu } from "@/components/todo-sm-bottom-menu";
import { useAuth0 } from "@auth0/auth0-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ImperativePanelHandle } from "react-resizable-panels"
import { Button } from "./ui/button"
import { SidebarTrigger } from "./ui/sidebar"
import { ProjectEditModal } from "./project-edit-modal"
import { useFetchProjects } from "@/lib/fetch"
import { ProjectTab } from "./todo-project-tab"
import { ProjectTabSettingModal } from "./project-tab-setting-modal"
import { SimpleSpinner } from "./ui/spinner"
// import { TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip"

const MAX_UNDO_COUNT = 10

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
        setTodos: Dispatch<SetStateAction<TodoProps[]>>
        setExProjects: Dispatch<SetStateAction<ProjectProps[]>>
        setExLabels: Dispatch<SetStateAction<LabelProps[]>>
        setIsUpdate: Dispatch<SetStateAction<boolean>>
        onClickSaveButton: () => void;
    }
) => {
    const [command, setCommand] = useState("")
    const [viewCompletionTask, setViewCompletionTask] = useLocalStorage("todo_is_view_completion", true)
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [keepPositionId, setKeepPositionId] = useState<string | undefined>(undefined)
    const [prefix, setPrefix] = useState('text')
    const [currentProjectId, setCurrentProjectId] = useState("")

    const [mode, setMode] = useState<Mode>('normal')
    const [sort, setSort] = useLocalStorage<Sort>("sort-ls-key", undefined)
    const [filterdTodos, setFilterdTodos] = useState<TodoProps[]>(todos)
    const [filterdProjects, setFilterdProjects] = useState<ProjectProps[]>(exProjects)

    const [todoEnables, setTodoEnables] = useState<TodoEnablesProps>({
        enableAddTodo: true,
        todosLimit: 100,
    })
    const [historyTodos, setHistoryTodos] = useState<TodoProps[][]>([])
    const [undoCount, setUndoCount] = useState(0)
    const [isHelp, setHelp] = useLocalStorage("todo_is_help", false)
    const [isLastPosition, setIsLastPosition] = useState(false)
    const [selectTaskId, setSelectTaskId] = useState<string | undefined>(undefined)
    const [isOpenRightPanel, setIsOpenRightPanel] = useLocalStorage("todo_is_open_right_panel", true)
    const resizeRef = useRef<ImperativePanelHandle>(null);

    const { register, setFocus, getValues, setValue, watch } = useForm()
    const { user, isLoading } = useAuth0()

    const [currentKeys, setCurrentKeys] = useState<String[]>([])
    const [log, setLog] = useState("")
    const [searchResultIndex, setSearchResultIndex] = useState<boolean[]>([])

    useEffect(() => {
        const panel = resizeRef.current;
        if (panel) {
            isOpenRightPanel ? panel.expand() : panel.collapse()
        }
    }, [isOpenRightPanel])

    const setKeyEnableDefine = (keyConf: { mode?: Mode[], sort?: Sort[], withoutTask?: boolean, useKey?: boolean } | undefined) => {
        let enabledMode = false
        let enabledSort = true
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
            enabledWithoutTask = filterdTodos.length === 0 ? keyConf.withoutTask ?? true : true
        }
        return { enabled: enabledMode && enabledSort && enabledWithoutTask, enableOnContentEditable: true, enableOnFormTags: true, preventDefault: true, useKey: keyConf?.useKey ?? false }
    }

    useEffect(() => {
        setTodoEnables(prev => {
            prev.enableAddTodo = todos.filter(t => !t.is_complete).length < prev.todosLimit
            return prev
        })
    }, [todos])

    useEffect(() => {
        if (completionOnly) {
            if (todos.length > 0) setFilterdTodos(todos)
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
        setFilterdTodos(_todos)
    }, [todos, currentProjectId, sort, completionOnly, viewCompletionTask, setFilterdTodos])

    useEffect(() => {
        if (exProjects.length > 0) {
            setFilterdProjects(sortBy(exProjects.filter(p => p.isTabDisplay), "sort"))
        }
    }, [exProjects])

    useEffect(() => {
        debugLog(`currentIndex:${currentIndex} mode:${mode} keepPositionId:${keepPositionId} prefix:${prefix} mode:${mode} `)
        if (filterdTodos.length > 0 && currentIndex !== - 1) {
            if (keepPositionId && currentIndex !== filterdTodos.map(t => t.id).indexOf(keepPositionId ? keepPositionId : "")) {
                let index = filterdTodos.map(t => t.id).indexOf(keepPositionId)
                if (index === -1) {
                    index = currentIndex >= filterdTodos.length ? filterdTodos.length - 1 : currentIndex > 0 ? currentIndex - 1 : currentIndex
                }
                setCurrentIndex(index)
                setKeepPositionId(undefined)
            } else {
                const id = filterdTodos[currentIndex >= filterdTodos.length ? filterdTodos.length - 1 : currentIndex].id
                if (mode === 'edit' || mode === "editDetail") setFocus(`edit-${mode === "edit" ? "list" : "content"}-${prefix}-${id}`)
                if (mode === 'normal' || mode === "select") setFocus(`list-${prefix}-${id}`)
                if (mode === 'editOnSort') setFocus("newtask")
                setIsLastPosition(true)
            }
        }
    }, [filterdTodos, mode, keepPositionId, currentIndex, prefix, setFocus, setValue])


    useEffect(() => {
        if (isLastPosition) {
            if (currentIndex >= filterdTodos.length) setCurrentIndex(filterdTodos.length - 1)
            setIsLastPosition(false)
        }
    }, [filterdTodos, currentIndex, isLastPosition])

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

    const toNormalMode = (todos: TodoProps[], prevTodos: TodoProps[], mode: Mode, filterdTodos: TodoProps[], currentIndex: number) => {
        if (filterdTodos.length === 0) {
            setPrefix('text')
            setMode('normal')
            return
        }
        const targetTodo = filterdTodos[currentIndex]
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
            setCurrentIndex(todoFunc.getIndexById(filterdTodos, targetTodoId))
        }
        setPrefix('text')
        setMode('normal')
    }

    const completeTask = (index: number, prevTodos: TodoProps[]) => {
        const _todos = todoFunc.modify(todos, {
            id: filterdTodos[index].id,
            is_complete: !filterdTodos[index].is_complete,
            priority: filterdTodos[index].priority,
            completionDate: !filterdTodos[index].is_complete ? new Date().toISOString() : null,
            creationDate: filterdTodos[index].creationDate,
            text: filterdTodos[index].text,
            projectId: filterdTodos[index].projectId,
            labelId: filterdTodos[index].labelId,
            detail: filterdTodos[index].detail,
            sort: filterdTodos[index].sort,
            indent: filterdTodos[index].indent,
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
        })
        handleSetTodos(_todos, prevTodos)
    }
    const changeProject = (index: number) => {
        setCurrentProjectId(index === -1 ? "" : filterdProjects[index].id)
        setCurrentIndex(0)
        setCommand('')
    }

    const keepPosition = (filterdTodos: TodoProps[], currentIndex: number, id?: string) => setKeepPositionId(id ? id : filterdTodos.length > 0 ? filterdTodos[currentIndex].id : undefined)

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
            handleSetTodos(todoFunc.swap(todos, selectTaskId, filterdTodos[currentIndex - 1].id), prevTodos)
        }
    }, setKeyEnableDefine(keymap['up'].enable), [todos, currentIndex, mode, selectTaskId, prevTodos, filterdTodos])

    // move to down
    useHotkeys(keymap['down'].keys, (e) => {
        if (currentIndex < filterdTodos.length - 1) setCurrentIndex(currentIndex + 1)
        setCommand('')
        if (mode === "select") {
            if (currentIndex >= filterdTodos.length - 1 || !selectTaskId) return
            handleSetTodos(todoFunc.swap(todos, selectTaskId, filterdTodos[currentIndex + 1].id), prevTodos)
        }
    }, setKeyEnableDefine(keymap['down'].enable), [todos, currentIndex, filterdTodos, mode, selectTaskId, prevTodos])

    useHotkeys(keymap['moveToTop'].keys, (e) => {
        setCurrentIndex(0)
        // if (mode !== "select") setMode('normal')
        if (mode === "select") {
            if (currentIndex <= 0 || !selectTaskId) return
            handleSetTodos(todoFunc.move(todos, todoFunc.getIndexById(todos, selectTaskId), 0), prevTodos)
        }
    }, setKeyEnableDefine(keymap['moveToTop'].enable), [mode, selectTaskId, todos, prevTodos])

    useHotkeys(keymap['moveToEnd'].keys, (e) => {
        setCurrentIndex(filterdTodos.length - 1)
        if (mode === "select") {
            if (currentIndex >= filterdTodos.length - 1 || !selectTaskId) return
            handleSetTodos(todoFunc.move(todos, todoFunc.getIndexById(todos, selectTaskId), todos.length - 1), prevTodos)
        }
        // if (mode !== "select") setMode('normal')
    }, setKeyEnableDefine(keymap['moveToEnd'].enable), [filterdTodos, mode, selectTaskId, todos, prevTodos])

    // move to right project
    useHotkeys(keymap['moveProjectRight'].keys, (e) => {
        handleMoveProject("right", filterdProjects, currentProjectId)
    }, setKeyEnableDefine(keymap['moveProjectRight'].enable), [filterdProjects, currentProjectId])

    // move to left project
    useHotkeys(keymap['moveProjectLeft'].keys, (e) => {
        handleMoveProject("left", filterdProjects, currentProjectId)
    }, setKeyEnableDefine(keymap['moveProjectLeft'].enable), [filterdProjects, currentProjectId])

    // insert task 
    useHotkeys(keymap['insert'].keys, (e) => {
        if (!todoEnables.enableAddTodo) return toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        const _indent = filterdTodos[currentIndex].indent ?? 0
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
        const _indent = currentIndex + 1 < filterdTodos.length ? filterdTodos[currentIndex + 1].indent ?? 0 : 0
        handleSetTodos(todoFunc.add(currentIndex + 1, todos, { projectId: currentProjectId, viewCompletionTask: viewCompletionTask, indent: _indent }), prevTodos)
        setCurrentIndex(currentIndex + 1)
        setMode('edit')
    }, setKeyEnableDefine(keymap['append'].enable), [todos, currentIndex, currentProjectId, viewCompletionTask, todoEnables, prevTodos])

    // append task to bottom
    useHotkeys(keymap['appendBottom'].keys, (e) => {
        if (!todoEnables.enableAddTodo) {
            toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        } else {
            handleSetTodos(todoFunc.add(filterdTodos.length, todos, { projectId: currentProjectId, viewCompletionTask: viewCompletionTask }), prevTodos)
            setCurrentIndex(filterdTodos.length)
            setMode('edit')
        }
    }, setKeyEnableDefine(keymap['appendBottom'].enable), [filterdTodos, currentProjectId, viewCompletionTask, todoEnables, prevTodos])

    // delete task
    const deleteTask = (currentIndex: number, filterdTodos: TodoProps[], prevTodos: TodoProps[]) => {
        handleSetTodos(todoFunc.delete(todos, filterdTodos[currentIndex].id), prevTodos)
        const index = currentIndex >= filterdTodos.length ? filterdTodos.length - 1 : currentIndex === 0 ? currentIndex : currentIndex - 1
        setCurrentIndex(index)
        setMode('normal')
        setPrefix('text')
    }
    useHotkeys(keymap['deleteModal'].keys, (e) => {
        setMode('modal')
        setPrefix('delete')
    }, setKeyEnableDefine(keymap['deleteModal'].enable), [todos, filterdTodos, currentIndex])

    useHotkeys(keymap['delete'].keys, (e) => {
        if (prefix !== 'delete') return
        deleteTask(currentIndex, filterdTodos, prevTodos)
    }, setKeyEnableDefine(keymap['delete'].enable), [currentIndex, filterdTodos, prevTodos, prefix])

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
        priorityTask(todos, prevTodos, filterdTodos[currentIndex].id, 'plus')
    }, setKeyEnableDefine(keymap['increasePriority'].enable), [todos, filterdTodos, currentIndex, prevTodos])

    useHotkeys(keymap['decreasePriority'].keys, (e) => {
        priorityTask(todos, prevTodos, filterdTodos[currentIndex].id, 'minus')
    }, setKeyEnableDefine(keymap['decreasePriority'].enable), [todos, filterdTodos, currentIndex, prevTodos])

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
        if (!viewCompletionTask && currentIndex >= filterdTodos.length - 1) setCurrentIndex(filterdTodos.length - 1)
    }, setKeyEnableDefine(keymap['completion'].enable), [currentIndex, filterdTodos, prevTodos])

    // change sort mode
    // useHotkeys(keymap['sortMode'].keys, (e) => {
    //     setMode("sort")
    // }, setKeyEnableDefine(keymap['sortMode'].enable))

    // toggle view commpletion / incompletion
    useHotkeys(keymap['toggleCompletionTask'].keys, (e) => {
        if (completionOnly) return
        keepPosition(filterdTodos, currentIndex)
        setViewCompletionTask(!viewCompletionTask)
    }, setKeyEnableDefine(keymap['toggleCompletionTask'].enable), [viewCompletionTask, filterdTodos, currentIndex])


    useHotkeys(keymap['undo'].keys, (e) => {
        if (historyTodos.length === 0 || undoCount >= historyTodos.length - 1) return
        undo(undoCount, historyTodos)
    }, setKeyEnableDefine(keymap['undo'].enable), [todos, undoCount, historyTodos, prevTodos, filterdTodos, currentIndex])

    useHotkeys(keymap['redo'].keys, (e) => {
        if (historyTodos.length === 0 || undoCount <= 0) return
        redo(undoCount, historyTodos)
    }, setKeyEnableDefine(keymap['redo'].enable), [undoCount, historyTodos, prevTodos, filterdTodos, currentIndex])

    useHotkeys(keymap['indent'].keys, (e) => {
        indentTask(todos, prevTodos, filterdTodos[currentIndex].id, 'plus')
    }, setKeyEnableDefine(keymap['indent'].enable), [todos, prevTodos, filterdTodos, currentIndex])

    useHotkeys(keymap['unIndnet'].keys, (e) => {
        indentTask(todos, prevTodos, filterdTodos[currentIndex].id, 'minus')
    }, setKeyEnableDefine(keymap['unIndnet'].enable), [todos, prevTodos, filterdTodos, currentIndex])

    /*******************
     * 
     * Sort mode
     * 
     *******************/
    useHotkeys(keymap['sortPriority'].keys, (e) => {
        keepPosition(filterdTodos, currentIndex)
        setSort("priority")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortPriority'].enable), [currentIndex, filterdTodos])

    useHotkeys(keymap['sortClear'].keys, (e) => {
        keepPosition(filterdTodos, currentIndex)
        setSort(undefined)
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortClear'].enable), [filterdTodos, currentIndex])

    useHotkeys(keymap['sortCreationDate'].keys, (e) => {
        setSort("creationDate")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortCreationDate'].enable))

    useHotkeys(keymap['sortCompletion'].keys, (e) => {
        keepPosition(filterdTodos, currentIndex)
        setSort("is_complete")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortCompletion'].enable), [filterdTodos, currentIndex])


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
            if (!e.isComposing) toNormalMode(todos, prevTodos, mode, filterdTodos, currentIndex)
            setCommand('')
        }
    }, setKeyEnableDefine(keymap['normalMode'].enable), [todos, prevTodos, mode, filterdTodos, currentIndex])

    useHotkeys(keymap['normalModeOnSort'].keys, (e) => {
        if (!e.isComposing) {
            const newId = self.crypto.randomUUID()
            const newtask = {
                id: newId,
                creationDate: yyyymmddhhmmss(new Date()),
                text: getValues(`newtask`),
                projectId: currentProjectId
            }
            if (!todoFunc.isEmpty(newtask)) {
                handleSetTodos([newtask, ...todos], prevTodos)
                setValue("newtask", "")
                keepPosition(filterdTodos, currentIndex, newId)
            }
            setPrefix('text')
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['normalModeOnSort'].enable), [currentProjectId, filterdTodos, currentIndex])

    useHotkeys(keymap['normalModefromEditDetail'].keys, (e) => {
        if (!e.isComposing) toNormalMode(todos, prevTodos, mode, filterdTodos, currentIndex)
        setCommand('')
    }, setKeyEnableDefine(keymap['normalModefromEditDetail'].enable), [todos, prevTodos, mode, filterdTodos, currentIndex])

    useHotkeys(keymap['normalModefromEditDetailText'].keys, (e) => {
        if (prefix !== "text") return
        if (!e.isComposing) toNormalMode(todos, prevTodos, mode, filterdTodos, currentIndex)
        setCommand('')
    }, { ...setKeyEnableDefine(keymap['normalModefromEditDetail'].enable), preventDefault: prefix === "text" }, [todos, prevTodos, prefix, mode, filterdTodos, currentIndex])

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
            if (filterdTodos.length >= line) {
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
        if (!e.isComposing) {
            const keyword = getValues('search').replace(/\s+/g, '')
            keyword
                ? setSearchResultIndex(filterdTodos.map(t => t.text.toLocaleLowerCase().replace(/\s+/g, '').includes(keyword.toLowerCase().replace(/\s+/g, ''))))
                : setSearchResultIndex([])
            setMode("normal")
        }
    }, setKeyEnableDefine(keymap['searchEnter'].enable), [filterdTodos])

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
        setSelectTaskId(filterdTodos[currentIndex].id)
        setMode('select')
    }, setKeyEnableDefine(keymap['select'].enable), [filterdTodos, currentIndex])

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
        if (prefix === 'normal') toNormalMode(todos, prevTodos, mode, filterdTodos, currentIndex)
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
        if (prefix === "normal") toNormalMode(todos, prevTodos, mode, filterdTodos, currentIndex)
        if (['projectId', 'labelId'].includes(prefix)) {
            setPrefix(prefix)
            setMode('modal')
        }
    }
    const handleMainMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (mode !== "modal" && mode !== "normal") {
            toNormalMode(todos, prevTodos, mode, filterdTodos, currentIndex)
        }
        e.preventDefault()
        e.stopPropagation();
    }

    const handleDetailMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (mode !== "modal" && mode !== "normal") {
            toNormalMode(todos, prevTodos, mode, filterdTodos, currentIndex)
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
    const MenuButton = ({ children, className, disabled, label, onClick }: { children: React.ReactNode, className?: string, disabled?: boolean, label?: string, onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void }) => {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                        <button onClick={onClick}
                            onMouseDown={e => e.stopPropagation()}
                            className={cn(className, `p-1 hover:cursor-pointer border disabled:text-secondary-foreground/20 hover:border-primary rounded-sm border-transparent transition-all`)} disabled={disabled}>{children}</button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs" align="start" side="bottom">
                        {label}
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
        if (swipeDistance > swipeThreshold) handleMoveProject("left", filterdProjects, currentProjectId);
        // 左にスワイプ
        if (swipeDistance < -swipeThreshold) handleMoveProject("right", filterdProjects, currentProjectId);
        setTouchStartX(0);
        setTouchEndX(0);
    };

    const projectTop = useRef<HTMLDivElement>(null);
    const projectLast = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!currentProjectId && projectTop.current) {
            projectTop.current.scrollIntoView({ behavior: "smooth" })
        }
        if (filterdProjects.length - 1 === findIndex(filterdProjects, p => p.id === currentProjectId) && projectLast.current) {
            projectLast.current.scrollIntoView({ behavior: "smooth" })
        }
    }, [currentProjectId, filterdProjects])

    return (
        <>
            <header className={`shrink-0 h-[3rem] sm:h-[5.8rem] gap-2 transition-[width,height] ease-linear shadow-xl bg-muted text-muted-foreground`}>
                <div className={`relative w-full h-0 sm:h-[2.8rem] border-b`}>
                    <div className={`w-full h-full flex justify-start  items-end overflow-x-auto flex-nowrap text-nowrap hidden-scrollbar text-foreground`}  >
                        <div ref={projectTop} />
                        <ProjectTab currentProjectId={currentProjectId} index={-1} onClick={handleClickElement} filterdProjects={filterdProjects} exProjects={exProjects} setProjects={setExProjects} />
                        {!loading && filterdProjects.map((p, i) => <ProjectTab key={p.id} currentProjectId={currentProjectId} index={i} filterdProjects={filterdProjects} exProjects={exProjects} onClick={handleClickElement} project={p} setProjects={setExProjects} />)}
                        {/* <div className="text-transparent border-b min-w-[80px] h-[10px]" /> */}
                        {/* <div className="w-full h-full border-b"></div> */}
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
                <div className="flex justify-between items-center h-[3rem] border-b-2 bg-card text-card-foreground">
                    <div className="flex items-center gap-2 h-full px-2 mx-2 ">
                        <div className="block md:hidden"><SidebarTrigger className="border" /></div>
                        <MenuButton label="元に戻す（Undo）" onClick={() => undo(undoCount, historyTodos)} disabled={historyTodos.length === 0 || undoCount >= historyTodos.length - 1}><Undo2 size={16} /></MenuButton>
                        <MenuButton label="やり直し（Redo）" onClick={() => redo(undoCount, historyTodos)} disabled={historyTodos.length === 0 || undoCount <= 0}><Redo2 size={16} /></MenuButton>
                        <MenuButton label="インデント" onClick={() => filterdTodos[currentIndex] && indentTask(todos, prevTodos, filterdTodos[currentIndex].id, "plus")} disabled={(filterdTodos[currentIndex]?.indent ?? 0) === 1} ><IndentIncrease size={16} /></MenuButton>
                        <MenuButton label="インデントを戻す" onClick={() => filterdTodos[currentIndex] && indentTask(todos, prevTodos, filterdTodos[currentIndex].id, "minus")} disabled={(filterdTodos[currentIndex]?.indent ?? 0) === 0}><IndentDecrease size={16} /></MenuButton>
                        <div className={`hidden sm:block inset-y-1/4 right-0 h-1/2 border-r w-8`}></div>
                        <div className="hidden sm:block">
                            <MenuButton label={`${viewCompletionTask ? "完了したタスクも表示" : "進行中タスクのみ表示"}`} onClick={_ => setViewCompletionTask(prev => !prev)}>
                                {viewCompletionTask ? <Eye size={16} /> : <EyeOffIcon size={16} />}
                            </MenuButton>
                        </div>
                        <div className="hidden sm:block">
                            <MenuButton label="ヘルプ表示/非表示" onClick={() => setHelp(prev => !prev)} ><CircleHelp size={16} /></MenuButton>
                        </div>
                        <div className="hidden sm:block">
                            <MenuButton label="詳細パネルの表示/非表示" onClick={() => setIsOpenRightPanel(prev => !prev)} >
                                <Columns size={16} />
                            </MenuButton>
                        </div>
                    </div>
                    <div className="relative flex gap-2 items-center px-2">
                        {isSave !== undefined && isUpdate !== undefined && onClickSaveButton !== undefined && user &&
                            <Button variant={"default"} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => onClickSaveButton} disabled={!isUpdate}>
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
            <div className={`w-full h-[calc(100%-3rem)] sm:h-[calc(100%-5.8rem)]`}>
                {/* オーバーレイ */}
                {/* <div className={`fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-10 ${mode === "editDetail" ? "block sm:hidden" : "hidden"}`} onMouseDown={handleMainMouseDown} /> */}
                {/* オーバーレイ */}
                <div className={`relative w-full h-full`} onMouseDown={handleMainMouseDown}>
                    <ResizablePanelGroup direction="horizontal" autoSaveId={"list_detail"}>
                        <ResizablePanel defaultSize={60} minSize={20} className={`relative ${mode === "editDetail" ? "hidden sm:block" : "block"} transition-transform`}>
                            <div
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                className="h-[calc(100%-70px)] sm:h-[calc(100%-30px)] w-full">
                                <TodoList
                                    filterdTodos={filterdTodos}
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
                                    register={register}
                                    rhfSetValue={setValue}
                                />
                            </div>
                            <div className="h-[30px] flex items-center justify-between w-full bg-card border-y text-xs px-2">
                                {command ? (
                                    <span>Line：{command}</span>
                                ) : (
                                    <span>No：{currentIndex + 1}</span>
                                )}
                                {mode}
                            </div>
                        </ResizablePanel>
                        <ResizableHandle tabIndex={-1} className="hidden sm:block cursor-col-resize " />
                        <ResizablePanel ref={resizeRef} defaultSize={40} minSize={20} className={`relative  bg-card ${mode === "editDetail" ? "block px-2 sm:px-0" : "hidden sm:block"}`} collapsible>
                            {loading ? (
                                <></>
                            ) : (
                                <>
                                    <div className={`w-full h-full z-20`}>
                                        {(!filterdTodos[currentIndex] || !filterdTodos[currentIndex].text) &&
                                            <div className="flex flex-col items-center text-muted-foreground justify-center h-full">
                                                <TentTree className="w-7 h-7" />
                                                タスクを追加、または選択してください。
                                            </div>
                                        }
                                        {filterdTodos[currentIndex] && filterdTodos[currentIndex].text &&
                                            <Detail
                                                todo={filterdTodos[currentIndex]}
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
                    <DeleteModal
                        currentIndex={currentIndex}
                        filterdTodos={filterdTodos}
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
                        filteredProjects={filterdProjects}
                        currentProjectId={currentProjectId}
                        handleClickElement={handleClickElement}
                        setViewCompletionTask={setViewCompletionTask}
                        setCurrentProjectId={setCurrentProjectId}
                        setMode={setMode}
                        handleSetTodos={handleSetTodos}
                        todoEnables={todoEnables}
                    />
                    {!loading &&
                        <div className={`absolute bottom-1 h-3/4  ${(isHelp && mode !== "editDetail") ? "w-full" : "w-0 hidden text-nowrap"} z-30  transition-all animate-fade-in`}>
                            <Usage
                                sort={sort}
                                mode={mode}
                                setHelp={setHelp}
                                isTodos={filterdTodos.length > 0}
                            />
                        </div>
                    }
                </div >
            </div >
        </>
    )
}