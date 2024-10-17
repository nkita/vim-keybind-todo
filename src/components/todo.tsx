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

export const Todo = (
    {
        todos,
        prevTodos,
        loading,
        completionOnly,
        setTodos,
        setIsUpdate,
        onClickSaveButton
    }: {
        todos: TodoProps[]
        prevTodos: TodoProps[]
        loading: Boolean
        completionOnly?: boolean
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
        todosLimit: 30,
    })

    const [isHelp, setHelp] = useLocalStorage("todo_is_help", true)
    const { register, setFocus, getValues, setValue, watch } = useForm()

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
        setProjects(Array.from(new Set([..._p])));
        setLabels(Array.from(new Set([..._l])))
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
                if (mode === 'normal') setFocus(`list-${prefix}-${id}`)
                if (mode === 'editOnSort') setFocus("newtask")
            }
        }
    }, [filterdTodos, mode, keepPositionId, currentIndex, prefix, setFocus, setValue])

    /*****
     * common function
     ****/
    const handleSetTodos = (_todos: TodoProps[]) => {
        const _t = todoFunc.sortUpdate(_todos)
        setTodos(_t)
        _t.forEach(t => {
            setValue(`edit-content-text-${t.id}`, t.text)
            setValue(`edit-list-text-${t.id}`, t.text)
        })
        const d = todoFunc.diff(_t, prevTodos).filter(d => !todoFunc.isEmpty(d))
        debugLog(`diff:`, d)
        debugLog(`isUpdate:${d.length > 0}`)
        setIsUpdate(d.length > 0)
    }
    const toNormalMode = () => {
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
            sort: targetTodo.sort
        }
        let _todos: TodoProps[] = []
        if (todoFunc.isEmpty(replace)) {
            _todos = todoFunc.delete(todos, targetTodoId)
            handleSetTodos(_todos)
            setCurrentIndex(currentIndex === 0 ? 0 : currentIndex - 1)
        } else {
            const t = todos.filter(_t => _t.id === replace.id)[0]
            if (!isEqual(t, replace)) {
                _todos = todoFunc.modify(todos, replace)
                handleSetTodos(_todos)
            }
            setCurrentIndex(todoFunc.getIndexById(filterdTodos, targetTodoId))
        }
        setPrefix('text')
        setMode('normal')
    }

    const completeTask = (index: number) => {
        const _todos = todoFunc.modify(todos, {
            id: filterdTodos[index].id,
            is_complete: !filterdTodos[index].is_complete,
            priority: filterdTodos[index].priority,
            completionDate: !filterdTodos[index].is_complete ? yyyymmddhhmmss(new Date()) : null,
            creationDate: filterdTodos[index].creationDate,
            text: filterdTodos[index].text,
            project: filterdTodos[index].project,
            context: filterdTodos[index].context,
            detail: filterdTodos[index].detail,
            sort: filterdTodos[index].sort
        })
        handleSetTodos(_todos)
    }

    const priorityTask = (todos: TodoProps[], targetId: string, action: 'plus' | 'minus') => {
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
            sort: targetTodo.sort
        })
        handleSetTodos(_todos)
    }

    const changeProject = (index: number) => {
        setCurrentProject(index === -1 ? "" : projects[index])
        setCurrentIndex(0)
        setCommand('')
        setMode('normal')
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
        setMode('normal')
    }, setKeyEnableDefine(keymap['up'].enable), [currentIndex])

    // move to down
    useHotkeys(keymap['down'].keys, (e) => {
        if (currentIndex < filterdTodos.length - 1) setCurrentIndex(currentIndex + 1)
        setCommand('')
        setMode('normal')
    }, setKeyEnableDefine(keymap['down'].enable), [currentIndex, filterdTodos])

    // insert task 
    useHotkeys(keymap['insert'].keys, (e) => {
        if (!todoEnables.enableAddTodo) return toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        handleSetTodos(todoFunc.add(currentIndex, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
        setMode('edit')
    }, setKeyEnableDefine(keymap['insert'].enable), [currentIndex, todos, currentProject, viewCompletionTask, todoEnables])

    // add task to Top
    useHotkeys(keymap['insertTop'].keys, (e) => {
        if (!todoEnables.enableAddTodo) return toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        handleSetTodos(todoFunc.add(0, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
        setCurrentIndex(0)
        setMode('edit')
    }, setKeyEnableDefine(keymap['insertTop'].enable), [mode, currentProject, viewCompletionTask, todos, todoEnables])

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

        handleSetTodos(todoFunc.add(currentIndex + 1, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
        setCurrentIndex(currentIndex + 1)
        setMode('edit')
    }, setKeyEnableDefine(keymap['append'].enable), [todos, currentIndex, currentProject, viewCompletionTask, todoEnables])

    // append task to bottom
    useHotkeys(keymap['appendBottom'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        if (!todoEnables.enableAddTodo) {
            toast.error(jaJson.追加可能タスク数を超えた場合のエラー)
        } else {
            handleSetTodos(todoFunc.add(filterdTodos.length, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
            setCurrentIndex(filterdTodos.length)
            setMode('edit')
        }
    }, setKeyEnableDefine(keymap['appendBottom'].enable), [filterdTodos, currentProject, viewCompletionTask, todoEnables])

    // delete task
    const deleteTask = (currentIndex: number, filterdTodos: TodoProps[]) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        handleSetTodos(todoFunc.delete(todos, filterdTodos[currentIndex].id))
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
        deleteTask(currentIndex, filterdTodos)
    }, setKeyEnableDefine(keymap['delete'].enable), [currentIndex, filterdTodos, prefix])

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
        priorityTask(todos, filterdTodos[currentIndex].id, 'plus')
    }, setKeyEnableDefine(keymap['increasePriority'].enable), [todos, filterdTodos, currentIndex])

    useHotkeys(keymap['decreasePriority'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        priorityTask(todos, filterdTodos[currentIndex].id, 'minus')
    }, setKeyEnableDefine(keymap['decreasePriority'].enable), [todos, filterdTodos, currentIndex])

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

    // move to right project
    useHotkeys(keymap['moveProjectRight'].keys, (e) => {
        if (projects.length > 0) {
            if (!currentProject) {
                changeProject(0)
            } else {
                const _index = projects.indexOf(currentProject)
                if (_index < projects.length - 1) changeProject(_index + 1)
            }
        }
    }, setKeyEnableDefine(keymap['moveProjectRight'].enable), [currentProject, projects])

    // move to left project
    useHotkeys(keymap['moveProjectLeft'].keys, (e) => {
        if (projects.length > 0) {
            if (currentProject) {
                const _index = projects.indexOf(currentProject)
                if (_index === 0) {
                    changeProject(-1)
                } else {
                    changeProject(_index - 1)
                }
            }
        }
    }, setKeyEnableDefine(keymap['moveProjectLeft'].enable), [currentProject, projects])

    // change to edit mode
    useHotkeys(keymap['completion'].keys, (e) => {
        completeTask(currentIndex)
        if (!viewCompletionTask) {
            const index = currentIndex >= filterdTodos.length ? filterdTodos.length - 1 : currentIndex === 0 ? currentIndex : currentIndex - 1
            setCurrentIndex(index)
        }
    }, setKeyEnableDefine(keymap['completion'].enable), [currentIndex, filterdTodos])

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
        if (!e.isComposing) toNormalMode()
        setCommand('')
    }, setKeyEnableDefine(keymap['normalMode'].enable))

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
                handleSetTodos([newtask, ...todos])
                setValue("newtask", "")
                keepPosition(filterdTodos, currentIndex, newId)
            }
            setPrefix('text')
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['normalModeOnSort'].enable), [currentProject, filterdTodos, currentIndex])

    useHotkeys(keymap['normalModefromEditDetail'].keys, (e) => {
        if (!e.isComposing) toNormalMode()
        setCommand('')
    }, setKeyEnableDefine(keymap['normalModefromEditDetail'].enable))

    useHotkeys(keymap['normalModefromEditDetailText'].keys, (e) => {
        if (prefix !== "text") return
        if (!e.isComposing) toNormalMode()
        setCommand('')
    }, { ...setKeyEnableDefine(keymap['normalModefromEditDetail'].enable), preventDefault: prefix === "text" }, [prefix])

    useHotkeys(keymap['numberMode'].keys, (e) => {
        setCommand(command + e.key)
        setMode('number')
    }, setKeyEnableDefine(keymap['numberMode'].enable), [command])

    useHotkeys(keymap['numberInput'].keys, (e) => {
        setCommand(command + e.key)
        setMode('number')
    }, setKeyEnableDefine(keymap['numberInput'].enable), [command])

    useHotkeys(keymap['moveToTop'].keys, (e) => {
        setCurrentIndex(0)
    }, setKeyEnableDefine(keymap['moveToTop'].enable))

    useHotkeys(keymap['moveToEnd'].keys, (e) => {
        setCurrentIndex(filterdTodos.length - 1)
    }, setKeyEnableDefine(keymap['moveToEnd'].enable), [filterdTodos])

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
            handleSetTodos(todoFunc.add(line, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
            setCurrentIndex(line)
            setMode('edit')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['appendToLine'].enable), [command, todos, currentProject, viewCompletionTask])

    useHotkeys(keymap['insertToLine'].keys, (e) => {
        if (currentProject === completionTaskProjectName) return toast.error(jaJson["完了済みタスクでは完了・未完了の更新のみ可能"])
        const line = parseInt(command)
        if (moveToLine(line)) {
            handleSetTodos(todoFunc.add(line - 1, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
            setCurrentIndex(line - 1)
            setMode('edit')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['insertToLine'].enable), [command, todos, currentProject, viewCompletionTask])


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
    const handleClickElement = (index: number, prefix: string) => {
        if (prefix === 'completion') completeTask(index)
        if (prefix === 'projectTab') changeProject(index)
        if (['priority', 'text'].includes(prefix)) {
            setPrefix(prefix)
            setMode('edit')
        }
        if (['context', 'project'].includes(prefix)) {
            setPrefix(prefix)
            setMode('modal')
        }
        if (prefix === 'normal') toNormalMode()
    }
    const handleClickDetailElement = (prefix: string) => {
        if (prefix === 'completion') completeTask(currentIndex)
        if (prefix === 'detail' || prefix === "text") {
            setPrefix(prefix)
            setMode("editDetail")
        }
        if (prefix === "normal") toNormalMode()
    }
    const handleMainMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        toNormalMode()
        e.preventDefault()
        e.stopPropagation();
    }

    const handleDetailMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        toNormalMode()
        e.stopPropagation();
    }
    return (
        <div className={`relative flex gap-2 w-full h-full pb-1 pt-4`} onMouseDown={handleMainMouseDown}>
            {/** 　debug デバッグエリア */}
            {/* <div className="absolute top-0 m-auto bg-yellow-100 ">
                currentIndex:{currentIndex} prefix:{prefix} filterdTodolength:{filterdTodos.length}
            </div> */}
            {/** 　デバッグエリア */}

            <ResizablePanelGroup direction="horizontal" autoSaveId={"list_detail"}>
                <ResizablePanel defaultSize={60} minSize={4} className="relative pl-8 pb-4">
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
                </ResizablePanel>
                <ResizableHandle tabIndex={-1} className="pl-2 bg-border-0 outline-none mt-8 mb-4 cursor-col-resize ring-0 hover:bg-secondary transition-all ease-in" />
                <ResizablePanel defaultSize={40} minSize={4} className={`relative`} >
                    {loading ? (
                        <></>
                    ) : (
                        <>
                            <div className={`absolute right-0 pb-4 pl-10  ${(isHelp && mode !== "editDetail") ? "w-full" : "w-0 text-nowrap"} z-20 h-full transition-all animate-slide-in-right`}>
                                <Usage
                                    sort={sort}
                                    mode={mode}
                                    isHelp={isHelp}
                                    setHelp={setHelp}
                                    isTodos={filterdTodos.length > 0}
                                />
                            </div>
                            <div className={`absolute top-[30px] w-full h-[calc(100%-30px)] pb-4 pr-8 z-10`}>
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
                    <div className="absolute bottom-3 w-full">
                        <div className="flex items-center justify-between ">
                            <div className="flex gap-2 items-center">
                                <span className="text-sm text-muted-foreground">入力キー:</span>
                                {currentKeys.length === 0 && <span className="text-sm text-muted-foreground">何も入力されていません</span>}
                                <div className="flex gap-2 items-center">
                                    {currentKeys.map((k, i) => {
                                        if (i === 0) return <kbd key={'key' + i} className="text-sm text-primary-foreground bg-primary">{k}</kbd>
                                        if (i === 1) return <kbd key={'key' + i} className="text-sm bg-muted text-muted-foreground ">{k}</kbd>
                                        return <kbd key={'key' + i} className="text-sm bg-muted text-muted-foreground transition-all">{k}</kbd>
                                    })}
                                </div>
                            </div>
                            <div className={` ${!isHelp ? "opacity-1" : "opacity-0"}  z-10 fade-in-5 transition-all overflow-hidden`}>
                                <button
                                    tabIndex={-1}
                                    onClick={_ => setHelp(true)}
                                    className={`flex gap-1 items-center text-xs justify-end px-3 py-2 rounded-l-xl border  shadow-md bg-primary text-primary-foreground`}>
                                    <kbd className="text-xs px-1 py-0 text-primary-foreground">?</kbd>
                                    <span>ヘルプ表示</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
            <DeleteModal
                currentIndex={currentIndex}
                filterdTodos={filterdTodos}
                currentPrefix={prefix}
                mode={mode}
                onClick={handleClickDetailElement}
                onDelete={deleteTask}
            />

        </div >
    )
}