'use client'
import React, { useState, MouseEvent, useEffect, Dispatch, SetStateAction } from "react"
import { useHotkeys, } from "react-hotkeys-hook"
import { useForm } from "react-hook-form"
import { keymap, completionTaskProjectName } from '@/components/config'
import { TodoEnablesProps, TodoProps, Sort, Mode } from "@/types"
import { todoFunc } from "@/lib/todo"
import { yyyymmddhhmmss } from "@/lib/time"
import { TodoList } from "./todo-list"
import { Detail } from "./detail"
import { isEqual, findIndex, get } from "lodash";
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
import { Check, List, Redo2, Undo2, ExternalLink, Save, IndentIncrease, IndentDecrease, Box, CircleHelp, CircleCheck, Eye, EyeIcon, Monitor, MonitorCheck, ListChecks, LayoutList, ListTodo, TentTree } from "lucide-react"
import { BottomMenu } from "@/components/todo-sm-bottom-menu";
import Link from "next/link"
import { useAuth0 } from "@auth0/auth0-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { EyeClosedIcon, QuestionMarkIcon } from "@radix-ui/react-icons"
import { Badge } from "./ui/badge"
// import { TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip"

const MAX_UNDO_COUNT = 10
const headerH = 60
const projectsH = 30
const headerHClass = `h-[${headerH}px]`
const projectsHClass = `h-[${projectsH}px]`
const mainHClass = `h-[calc(100%-${headerH}px)]`
const tableHeightClass = `h-[calc(100%-${projectsH}px)]`

export const Todo = (
    {
        todos,
        prevTodos,
        loading,
        completionOnly,
        isSave,
        isUpdate,
        setTodos,
        setIsUpdate,
        onClickSaveButton
    }: {
        todos: TodoProps[]
        prevTodos: TodoProps[]
        loading: Boolean
        completionOnly?: boolean
        isSave: boolean
        isUpdate: boolean
        setTodos: Dispatch<SetStateAction<TodoProps[]>>
        setIsUpdate: Dispatch<SetStateAction<boolean>>
        onClickSaveButton: () => void;
    }
) => {
    const [command, setCommand] = useState("")
    const [viewCompletionTask, setViewCompletionTask] = useLocalStorage("todo_is_view_completion", true)
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [keepPositionId, setKeepPositionId] = useState<string | undefined>(undefined)
    const [searchResultIndex, setSearchResultIndex] = useState<boolean[]>([])
    const [prefix, setPrefix] = useState('text')
    const [log, setLog] = useState("")
    const [currentProject, setCurrentProject] = useState("")

    const [projects, setProjects] = useState<string[]>([])
    const [labels, setLabels] = useState<string[]>([])
    const [mode, setMode] = useState<Mode>('normal')
    const [sort, setSort] = useLocalStorage<Sort>("sort-ls-key", undefined)
    const [filterdTodos, setFilterdTodos] = useState<TodoProps[]>(todos)

    const [currentKeys, setCurrentKeys] = useState<String[]>([])
    const [todoEnables, setTodoEnables] = useState<TodoEnablesProps>({
        enableAddTodo: true,
        todosLimit: 100,
    })
    const [historyTodos, setHistoryTodos] = useState<TodoProps[][]>([])
    const [undoCount, setUndoCount] = useState(0)

    const [isHelp, setHelp] = useLocalStorage("todo_is_help", true)
    const [isLastPosition, setIsLastPosition] = useState(false)
    const [selectTaskId, setSelectTaskId] = useState<string | undefined>(undefined)
    const { register, setFocus, getValues, setValue, watch } = useForm()
    const { user, isLoading } = useAuth0()
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
        let projects: (string | undefined)[] = []
        let labels: (string | undefined)[] = []
        todos.forEach(t => {
            projects.push(t.project)
            labels.push(t.context)
        })
        const _p = projects.filter(p => p !== undefined && p !== "") as string[];
        const _l = labels.filter(l => l !== undefined && l !== "") as string[];
        setProjects(Array.from(new Set([..._p])).sort());
        setLabels(Array.from(new Set([..._l])).sort())
    }, [todos])


    useEffect(() => {
        setTodoEnables(prev => {
            prev.enableAddTodo = todos.filter(t => !t.is_complete).length < prev.todosLimit
            return prev
        })
    }, [todos])

    useEffect(() => {
        debugLog(`currentProject:${currentProject} `)
        if (completionOnly) {
            if (todos.length > 0) setFilterdTodos(todos)
            return
        }
        let _todos = !currentProject ? [...todos] : todos.filter(t => t.project === currentProject)

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
    }, [todos, currentProject, sort, completionOnly, viewCompletionTask, setFilterdTodos])

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
        debugLog(`diff:`, d)
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
            project: getValues(`edit-list-project-${targetTodoId}`),
            context: getValues(`edit-list-context-${targetTodoId}`),
            detail: getValues(`edit-content-detail-${targetTodoId}`) ?? "",
            sort: targetTodo.sort,
            indent: targetTodo.indent,
            limitDate: targetTodo.limitDate
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
            project: filterdTodos[index].project,
            context: filterdTodos[index].context,
            detail: filterdTodos[index].detail,
            sort: filterdTodos[index].sort,
            indent: filterdTodos[index].indent,
            limitDate: filterdTodos[index].limitDate
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
            project: targetTodo.project,
            context: targetTodo.context,
            detail: targetTodo.detail,
            sort: targetTodo.sort,
            indent: targetTodo.indent,
            limitDate: targetTodo.limitDate
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
            project: targetTodo.project,
            context: targetTodo.context,
            detail: targetTodo.detail,
            sort: targetTodo.sort,
            indent: indent,
            limitDate: targetTodo.limitDate
        })
        handleSetTodos(_todos, prevTodos)
    }
    const changeProject = (index: number) => {
        setCurrentProject(index === -1 ? "" : projects[index])
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
    }, setKeyEnableDefine(keymap['up'].enable), [todos, currentIndex, mode, selectTaskId, prevTodos])

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
        handleMoveProject("right", projects, currentProject)
    }, setKeyEnableDefine(keymap['moveProjectRight'].enable), [projects, currentProject])

    // move to left project
    useHotkeys(keymap['moveProjectLeft'].keys, (e) => {
        handleMoveProject("left", projects, currentProject)
    }, setKeyEnableDefine(keymap['moveProjectLeft'].enable), [projects, currentProject])

    // insert task 
    useHotkeys(keymap['insert'].keys, (e) => {
        if (!todoEnables.enableAddTodo) return toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        const _indent = filterdTodos[currentIndex].indent ?? 0
        handleSetTodos(todoFunc.add(currentIndex, todos, { project: currentProject, viewCompletionTask: viewCompletionTask, indent: _indent }), prevTodos)
        setMode('edit')
    }, setKeyEnableDefine(keymap['insert'].enable), [currentIndex, todos, currentProject, viewCompletionTask, todoEnables, prevTodos])

    // add task to Top
    useHotkeys(keymap['insertTop'].keys, (e) => {
        if (!todoEnables.enableAddTodo) return toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        handleSetTodos(todoFunc.add(0, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }), prevTodos)
        setCurrentIndex(0)
        setMode('edit')
    }, setKeyEnableDefine(keymap['insertTop'].enable), [mode, currentProject, viewCompletionTask, todos, prevTodos, todoEnables])

    // add task to Top
    useHotkeys(keymap['insertTopOnSort'].keys, (e) => {
        if (!todoEnables.enableAddTodo) return toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        setMode('editOnSort')
    }, setKeyEnableDefine(keymap['insertTopOnSort'].enable), [todoEnables])

    // append task 
    useHotkeys(keymap['append'].keys, (e) => {
        if (!todoEnables.enableAddTodo) return toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        const _indent = currentIndex + 1 < filterdTodos.length ? filterdTodos[currentIndex + 1].indent ?? 0 : 0
        handleSetTodos(todoFunc.add(currentIndex + 1, todos, { project: currentProject, viewCompletionTask: viewCompletionTask, indent: _indent }), prevTodos)
        setCurrentIndex(currentIndex + 1)
        setMode('edit')
    }, setKeyEnableDefine(keymap['append'].enable), [todos, currentIndex, currentProject, viewCompletionTask, todoEnables, prevTodos])

    // append task to bottom
    useHotkeys(keymap['appendBottom'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        if (!todoEnables.enableAddTodo) {
            toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        } else {
            handleSetTodos(todoFunc.add(filterdTodos.length, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }), prevTodos)
            setCurrentIndex(filterdTodos.length)
            setMode('edit')
        }
    }, setKeyEnableDefine(keymap['appendBottom'].enable), [filterdTodos, currentProject, viewCompletionTask, todoEnables, prevTodos])

    // delete task
    const deleteTask = (currentIndex: number, filterdTodos: TodoProps[], prevTodos: TodoProps[]) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        handleSetTodos(todoFunc.delete(todos, filterdTodos[currentIndex].id), prevTodos)
        const index = currentIndex >= filterdTodos.length ? filterdTodos.length - 1 : currentIndex === 0 ? currentIndex : currentIndex - 1
        setCurrentIndex(index)
        setMode('normal')
        setPrefix('text')
    }
    useHotkeys(keymap['deleteModal'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        setMode('modal')
        setPrefix('delete')
    }, setKeyEnableDefine(keymap['deleteModal'].enable), [todos, filterdTodos, currentIndex])

    useHotkeys(keymap['delete'].keys, (e) => {
        if (prefix !== 'delete') return
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        deleteTask(currentIndex, filterdTodos, prevTodos)
    }, setKeyEnableDefine(keymap['delete'].enable), [currentIndex, filterdTodos, prevTodos, prefix])

    // change to edit mode
    useHotkeys(keymap['editText'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        setMode('edit')
    }, setKeyEnableDefine(keymap['editText'].enable))

    // change to priority edit mode
    // useHotkeys(keymap['editPriority'].keys, (e) => {
    //     setPrefix('priority')
    //     setMode('edit')
    // }, setKeyEnableDefine(keymap['editPriority'].enable))
    useHotkeys(keymap['increasePriority'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        priorityTask(todos, prevTodos, filterdTodos[currentIndex].id, 'plus')
    }, setKeyEnableDefine(keymap['increasePriority'].enable), [todos, filterdTodos, currentIndex, prevTodos])

    useHotkeys(keymap['decreasePriority'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        priorityTask(todos, prevTodos, filterdTodos[currentIndex].id, 'minus')
    }, setKeyEnableDefine(keymap['decreasePriority'].enable), [todos, filterdTodos, currentIndex, prevTodos])

    // change to project edit mode
    useHotkeys(keymap['editProject'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        setPrefix('project')
        setMode('modal')
    }, { ...setKeyEnableDefine(keymap['editProject'].enable) })

    // change to context edit mode
    useHotkeys(keymap['editContext'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        setPrefix('context')
        setMode('modal')
    }, setKeyEnableDefine(keymap['editContext'].enable))

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
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        keepPosition(filterdTodos, currentIndex)
        setSort("priority")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortPriority'].enable), [currentIndex, filterdTodos])

    useHotkeys(keymap['sortClear'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        keepPosition(filterdTodos, currentIndex)
        setSort(undefined)
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortClear'].enable), [filterdTodos, currentIndex])

    useHotkeys(keymap['sortCreationDate'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        setSort("creationDate")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortCreationDate'].enable))

    useHotkeys(keymap['sortContext'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        keepPosition(filterdTodos, currentIndex)
        setSort("context")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortContext'].enable), [filterdTodos, currentIndex])

    useHotkeys(keymap['sortCompletion'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
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
                project: currentProject
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
    }, setKeyEnableDefine(keymap['normalModeOnSort'].enable), [currentProject, filterdTodos, currentIndex])

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
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        const line = parseInt(command)
        if (moveToLine(line)) {
            handleSetTodos(todoFunc.add(line, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }), prevTodos)
            setCurrentIndex(line)
            setMode('edit')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['appendToLine'].enable), [command, todos, currentProject, viewCompletionTask, prevTodos])

    useHotkeys(keymap['insertToLine'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        const line = parseInt(command)
        if (moveToLine(line)) {
            handleSetTodos(todoFunc.add(line - 1, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }), prevTodos)
            setCurrentIndex(line - 1)
            setMode('edit')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['insertToLine'].enable), [command, todos, currentProject, viewCompletionTask, prevTodos])


    useHotkeys(keymap['editProjectLine'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        const line = parseInt(command)
        if (moveToLine(line)) {
            setPrefix('project')
            setMode('modal')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['editProjectLine'].enable), [command])

    useHotkeys(keymap['editContextLine'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        const line = parseInt(command)
        if (moveToLine(line)) {
            setPrefix('context')
            setMode('modal')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['editContextLine'].enable), [command])

    useHotkeys(keymap['editTextLine'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        const line = parseInt(command)
        if (moveToLine(line)) {
            setMode('edit')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['editTextLine'].enable), [command])

    useHotkeys(keymap['editDetail'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
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
        if (['context', 'project'].includes(prefix)) {
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
        if (['context', 'project'].includes(prefix)) {
            setPrefix(prefix)
            setMode('modal')
        }
    }
    const handleMainMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        if (mode !== "modal") {
            toNormalMode(todos, prevTodos, mode, filterdTodos, currentIndex)
            e.preventDefault()
            e.stopPropagation();
        }
    }

    const handleDetailMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        toNormalMode(todos, prevTodos, mode, filterdTodos, currentIndex)
        e.stopPropagation();
    }

    const getNextProjectIndex = (direction: "right" | "left", projects: string[], currentProject: string) => {
        if (projects.length <= 0) return
        if (direction === "right") {
            if (!currentProject) {
                return 0
            } else {
                const _index = projects.indexOf(currentProject)
                if (_index < projects.length - 1) return _index + 1
            }
        } else {
            if (!currentProject) return
            const _index = projects.indexOf(currentProject)
            if (_index === 0) {
                return -1
            } else {
                return _index - 1
            }
        }
    }

    const handleMoveProject = (direction: "right" | "left", projects: string[], currentProject: string) => {
        const index = getNextProjectIndex(direction, projects, currentProject)
        if (index === undefined) return
        changeProject(index)
    }

    const Project = (
        {
            currentProject, index, project, onClick

        }: {
            currentProject: string, index: number, project: string, onClick: (index: number, prefix: string) => void
        }
    ) => {
        const ref = React.useRef<HTMLButtonElement>(null)
        useEffect(() => {
            if (currentProject === project) {
                ref.current?.scrollIntoView({ behavior: "smooth" })
            }
        }, [currentProject, project])
        return (
            <button tabIndex={-1} ref={ref} onClick={_ => onClick(index, 'projectTab')}
                className={`text-xs px-2 ${currentProject === project ? " bg-secondary text-secondary-foreground border-t border-primary " : " text-secondary-foreground/50 border-t border-transparent"} h-full hover:font-semibold hover:text-secondary-foreground transition-all fade-in-5`}>
                <span className="flex gap-1 items-center">
                    {project ? (
                        project === completionTaskProjectName ? (
                            <> <Check className="w-3" />{"完了済み"}</>
                        ) : (
                            <> <Box className="w-3" />{project}</>
                        )
                    ) : (
                        <> <List className="w-3" />{"ALL"}</>
                    )}
                </span>
            </button>
        )
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
    const MenuButton = ({ children, disabled, label, onClick }: { children: React.ReactNode, disabled?: boolean, label?: string, onClick?: () => void }) => {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                        <button onClick={onClick} className="p-1 hover:cursor-pointer border border-transparent hover:border-primary rounded-sm disabled:opacity-20 disabled:border-transparent transition-all" disabled={disabled}>{children}</button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs" align="start">
                        {label}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider >
        )
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
        const swipeThreshold = 10; // スワイプ感度の閾値
        if (touchEndX === 0) return
        const swipeDistance = touchEndX - touchStartX;
        // 右にスワイプ
        if (swipeDistance > swipeThreshold) handleMoveProject("left", projects, currentProject);
        // 左にスワイプ
        if (swipeDistance < -swipeThreshold) handleMoveProject("right", projects, currentProject);
        setTouchStartX(0);
        setTouchEndX(0);
    };

    return (
        <>
            <header className={`flex justify-between shrink-0 ${headerHClass} items-center gap-2 transition-[width,height] ease-linear`}>
                <div className="flex items-center gap-2 border m-1 p-1 rounded-md bg-card text-card-foreground">
                    <MenuButton label="元に戻す（Undo）" onClick={() => undo(undoCount, historyTodos)} disabled={historyTodos.length === 0 || undoCount >= historyTodos.length - 1}><Undo2 size={16} /></MenuButton>
                    <MenuButton label="やり直し（Redo）" onClick={() => redo(undoCount, historyTodos)} disabled={historyTodos.length === 0 || undoCount <= 0}><Redo2 size={16} /></MenuButton>
                    {isSave !== undefined && isUpdate !== undefined && onClickSaveButton !== undefined && user &&
                        <MenuButton label="保存" onClick={() => onClickSaveButton} disabled={!isUpdate}>
                            {(isSave && isUpdate) ? (
                                <div className="animate-spin h-4 w-4 border-2 p-1 border-primary rounded-full border-t-transparent" />
                            ) : (
                                <Save size={16} />
                            )}
                        </MenuButton>
                    }
                    <MenuButton label="インデント" onClick={() => filterdTodos[currentIndex] && indentTask(todos, prevTodos, filterdTodos[currentIndex].id, "plus")} disabled={(filterdTodos[currentIndex]?.indent ?? 0) === 1} ><IndentIncrease size={16} /></MenuButton>
                    <MenuButton label="インデントを戻す" onClick={() => filterdTodos[currentIndex] && indentTask(todos, prevTodos, filterdTodos[currentIndex].id, "minus")} disabled={(filterdTodos[currentIndex]?.indent ?? 0) === 0}><IndentDecrease size={16} /></MenuButton>
                    <MenuButton label="ヘルプ表示/非表示" onClick={() => setHelp(prev => !prev)} ><QuestionMarkIcon className="h-3 w-3" /></MenuButton>
                </div>
                <div className="flex gap-2 items-center">
                    {command && <span className="text-xs">Line：{command}</span>}
                    {viewCompletionTask ? (
                        <MenuButton label="完了したタスクも表示"><ListTodo className="h-4 w-4" /></MenuButton>
                    ) : (
                        <MenuButton label="進行中タスクのみ表示"><LayoutList className="h-4 w-4" /></MenuButton>
                    )}
                    <div className="flex items-center w-[80px] justify-start"><Badge>{mode}</Badge></div>
                </div>
            </header >
            <div className={`w-full ${mainHClass}`}>
                {/* オーバーレイ */}
                {/* <div className={`fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-10 ${mode === "editDetail" ? "block sm:hidden" : "hidden"}`} onMouseDown={handleMainMouseDown} /> */}
                {/* オーバーレイ */}

                <div className={`relative w-full h-[2.5rem] border-y bg-card`}>
                    <div className={`w-full h-full flex justify-start items-end overflow-hidden flex-nowrap text-nowrap hidden-scrollbar text-foreground `}  >
                        <Project currentProject={currentProject} index={-1} project={""} onClick={handleClickElement} />
                        {projects.map((p, i) => {
                            return (
                                <Project key={p} currentProject={currentProject} index={i} project={p} onClick={handleClickElement} />
                            )
                        })}
                    </div>
                </div>
                <div className={`relative w-full h-[calc(100%-2.5rem)]`} onMouseDown={handleMainMouseDown}>
                    <ResizablePanelGroup direction="horizontal" autoSaveId={"list_detail"}>
                        <ResizablePanel defaultSize={60} minSize={20} className={`${mode === "editDetail" ? "hidden sm:block" : "block"}`}>
                            <div
                                onTouchStart={handleTouchStart}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                                className="h-full w-full">
                                <TodoList
                                    filterdTodos={filterdTodos}
                                    currentIndex={currentIndex}
                                    prefix={prefix}
                                    mode={mode}
                                    viewCompletion={viewCompletionTask}
                                    projects={projects}
                                    labels={labels}
                                    currentProject={currentProject}
                                    sort={sort}
                                    searchResultIndex={searchResultIndex}
                                    command={command}
                                    loading={loading}
                                    onClick={handleClickElement}
                                    setCurrentIndex={setCurrentIndex}
                                    register={register}
                                    rhfSetValue={setValue}
                                    completionOnly={completionOnly}
                                />
                            </div>
                        </ResizablePanel>
                        <ResizableHandle tabIndex={-1} className="hidden sm:block cursor-col-resize " />
                        <ResizablePanel defaultSize={40} minSize={20} className={`relative bg-card ${mode === "editDetail" ? "block px-2 sm:px-0" : "hidden sm:block"}`} collapsible>
                            {loading ? (
                                <></>
                            ) : (
                                <>
                                    <div className={`w-full h-full z-20`}>
                                        {!filterdTodos[currentIndex] &&
                                            <div className="flex flex-col items-center text-muted-foreground justify-center h-full">
                                                <TentTree className="w-7 h-7" />
                                                Please select a task.
                                            </div>
                                        }
                                        <Detail
                                            todo={filterdTodos[currentIndex]}
                                            prefix={prefix}
                                            mode={mode}
                                            isHelp={isHelp}
                                            onMouseDownEvent={handleDetailMouseDown}
                                            onClick={handleClickDetailElement}
                                            setValue={setValue}
                                            watch={watch}
                                            register={register}
                                        />
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
                        loading={loading}
                        completionOnly={completionOnly}
                        viewCompletionTask={viewCompletionTask}
                        projects={projects}
                        currentProject={currentProject}
                        setViewCompletionTask={setViewCompletionTask}
                        setCurrentProject={setCurrentProject}
                        setMode={setMode}
                        handleSetTodos={handleSetTodos}
                        todoEnables={todoEnables}
                    />
                    <div className={`absolute bottom-1 h-3/4  ${(isHelp && mode !== "editDetail") ? "w-full" : "w-0 hidden text-nowrap"} z-30  transition-all animate-fade-in`}>
                        <Usage
                            sort={sort}
                            mode={mode}
                            isHelp={isHelp}
                            setHelp={setHelp}
                            isTodos={filterdTodos.length > 0}
                        />
                    </div>
                </div >
            </div >
        </>
    )
}
const ExLink = ({
    href,
    className = "",
    target,
    lock,
    children,
    type,
    onClick,
    ...props
}: {
    href?: string,
    className?: string | undefined,
    type?: "button" | "link",
    target?: string,
    lock?: boolean,
    onClick?: () => void,
    children: React.ReactNode
}) => {
    if (type === "link" && href) {
        return (
            <Link
                href={href}
                target={target}
                className={`flex text-accent-foreground/60 hover:underline hover:text-accent-foreground text-sm items-center gap-1 px-3 transition-all fade-in-5`}
                {...props}
            >
                {children}
            </Link>
        )
    } else {
        return (
            <button
                tabIndex={-1}
                onClick={onClick}
                className={`flex text-sm text-accent-foreground/60 hover:text-accent-foreground items-center gap-1 px-3 transition-all fade-in-5`}
                {...props}
            >
                {children}
            </button>
        )
    }
}