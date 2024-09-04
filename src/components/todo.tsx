'use client'
import React, { useState, MouseEvent, useEffect, Dispatch, SetStateAction, ReactNode } from "react"
import { useHotkeys, } from "react-hotkeys-hook"
import { useForm } from "react-hook-form"
import { keymap } from '@/components/config'
import { TodoProps, Sort, Mode } from "@/types"
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
import { Modal } from "./ui/modal"
import { DynamicSearchSelect } from "./ui/combobox-dynamic"
import { Usage } from "./usage"
import { useLocalStorage } from "@/hook/useLocalStrorage"
import { Skeleton } from "./ui/skeleton"

export const Todo = (
    {
        todos,
        prevTodos,
        filterdTodos,
        mode,
        sort,
        loading,
        setTodos,
        setFilterdTodos,
        setMode,
        setSort,
        setIsUpdate,
        onClickSaveButton
    }: {
        todos: TodoProps[]
        prevTodos: TodoProps[]
        filterdTodos: TodoProps[]
        mode: Mode
        sort: Sort
        loading: Boolean
        setTodos: Dispatch<SetStateAction<TodoProps[]>>
        setFilterdTodos: Dispatch<SetStateAction<TodoProps[]>>
        setMode: Dispatch<SetStateAction<Mode>>
        setSort: Dispatch<SetStateAction<Sort>>
        setIsUpdate: Dispatch<SetStateAction<boolean>>
        onClickSaveButton: () => void;
    }
) => {
    const [command, setCommand] = useState("")
    const [projects, setProjects] = useState<string[]>([])
    const [labels, setLabels] = useState<string[]>([])
    const [currentProject, setCurrentProject] = useState("")
    const [viewCompletionTask, setViewCompletionTask] = useState(true)
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [keepPositionId, setKeepPositionId] = useState<string | undefined>(undefined)
    const [searchResultIndex, setSearchResultIndex] = useState<boolean[]>([])
    const [prefix, setPrefix] = useState('text')
    const [log, setLog] = useState("")
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
        setProjects(Array.from(new Set(_p)));
        setLabels(Array.from(new Set(_l)))
    }, [todos])

    useEffect(() => {
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
    }, [todos, currentProject, sort, viewCompletionTask, setFilterdTodos])

    useEffect(() => {
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
        setIsUpdate(todoFunc.diff(_t, prevTodos).length > 0)
    }
    const toNormalMode = () => {
        if (filterdTodos.length > 0) {

            const positions = {
                editDetail: ["content", "list"],
                default: ["list", "content"]
            };
            const targetTodo = filterdTodos[currentIndex]
            const targetTodoId = targetTodo.id
            const [updatePosition, otherPosition] = mode === "editDetail" ? positions.editDetail : positions.default

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

    const priorityTask = (index: number, action: 'plus' | 'minus') => {
        const _priority = filterdTodos[index].priority
        let newPriority = 0
        if (_priority && ['1', '2', '3'].includes(_priority)) {
            let _p = Number(_priority)
            newPriority = action === 'plus' ? _p + 1 : _p - 1
            if (3 < newPriority) newPriority = 3
            if (newPriority < 0) newPriority = 0
        } else {
            newPriority = action === "plus" ? 1 : 0
        }
        const _todos = todoFunc.modify(todos, {
            id: filterdTodos[index].id,
            is_complete: filterdTodos[index].is_complete,
            priority: newPriority === 0 ? "" : newPriority.toString(),
            completionDate: filterdTodos[index].completionDate,
            creationDate: filterdTodos[index].creationDate,
            text: filterdTodos[index].text,
            project: filterdTodos[index].project,
            context: filterdTodos[index].context,
            detail: filterdTodos[index].detail,
            sort: filterdTodos[index].sort
        })
        handleSetTodos(_todos)
    }

    const changeProject = (index: number) => {
        setCurrentProject(index === -1 ? "" : projects[index])
        setCurrentIndex(0)
        setCommand('')
        setMode('normal')
    }

    const keepPosition = (id?: string) => setKeepPositionId(id ? id : filterdTodos.length > 0 ? filterdTodos[currentIndex].id : undefined)

    /** hotkeys  */
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
    }, setKeyEnableDefine(keymap['up'].enable))

    // move to down
    useHotkeys(keymap['down'].keys, (e) => {
        if (currentIndex < filterdTodos.length - 1) setCurrentIndex(currentIndex + 1)
        setCommand('')
        setMode('normal')
    }, setKeyEnableDefine(keymap['down'].enable))

    // insert task 
    useHotkeys(keymap['insert'].keys, (e) => {
        handleSetTodos(todoFunc.add(currentIndex, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
        setMode('edit')
    }, setKeyEnableDefine(keymap['insert'].enable))

    // add task to Top
    useHotkeys(keymap['insertTop'].keys, (e) => {
        handleSetTodos(todoFunc.add(0, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
        setCurrentIndex(0)
        setMode('edit')
    }, setKeyEnableDefine(keymap['insertTop'].enable), [mode])

    // add task to Top
    useHotkeys(keymap['insertTopOnSort'].keys, (e) => {
        setMode('editOnSort')
    }, setKeyEnableDefine(keymap['insertTopOnSort'].enable))

    // append task 
    useHotkeys(keymap['append'].keys, (e) => {
        handleSetTodos(todoFunc.add(currentIndex + 1, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
        setCurrentIndex(currentIndex + 1)
        setMode('edit')
    }, setKeyEnableDefine(keymap['append'].enable))

    // append task to bottom
    useHotkeys(keymap['appendBottom'].keys, (e) => {
        handleSetTodos(todoFunc.add(filterdTodos.length, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
        setCurrentIndex(filterdTodos.length)
        setMode('edit')
    }, setKeyEnableDefine(keymap['appendBottom'].enable))

    // delete task
    useHotkeys(keymap['delete'].keys, (e) => {
        handleSetTodos(todoFunc.delete(todos, filterdTodos[currentIndex].id))
        const index = currentIndex >= filterdTodos.length ? filterdTodos.length - 1 : currentIndex - 1
        setCurrentIndex(index)
    }, setKeyEnableDefine(keymap['delete'].enable))

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
        priorityTask(currentIndex, 'plus')
        keepPosition()
    }, setKeyEnableDefine(keymap['increasePriority'].enable))

    useHotkeys(keymap['decreasePriority'].keys, (e) => {
        priorityTask(currentIndex, 'minus')
        keepPosition()
    }, setKeyEnableDefine(keymap['decreasePriority'].enable))

    // change to project edit mode
    useHotkeys(keymap['editProject'].keys, (e) => {
        setPrefix('project')
        setMode('modal')
    }, { ...setKeyEnableDefine(keymap['editProject'].enable) })

    // change to context edit mode
    useHotkeys(keymap['editContext'].keys, (e) => {
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
    }, setKeyEnableDefine(keymap['moveProjectRight'].enable))

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
    }, setKeyEnableDefine(keymap['moveProjectLeft'].enable))

    // change to edit mode
    useHotkeys(keymap['completion'].keys, (e) => {
        const index = currentIndex >= filterdTodos.length ? filterdTodos.length - 1 : currentIndex
        setCurrentIndex(index)
        completeTask(index)
    }, setKeyEnableDefine(keymap['completion'].enable))

    // change sort mode
    useHotkeys(keymap['sortMode'].keys, (e) => {
        setMode("sort")
    }, setKeyEnableDefine(keymap['sortMode'].enable))

    // toggle view commpletion / incompletion
    useHotkeys(keymap['toggleCompletionTask'].keys, (e) => {
        keepPosition()
        setViewCompletionTask(!viewCompletionTask)
    }, setKeyEnableDefine(keymap['toggleCompletionTask'].enable))

    /*******************
     * 
     * Sort mode
     * 
     *******************/
    useHotkeys(keymap['sortPriority'].keys, (e) => {
        keepPosition()
        setSort("priority")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortPriority'].enable))

    useHotkeys(keymap['sortClear'].keys, (e) => {
        keepPosition()
        setSort(undefined)
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortClear'].enable))

    useHotkeys(keymap['sortCreationDate'].keys, (e) => {
        setSort("creationDate")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortCreationDate'].enable))

    useHotkeys(keymap['sortContext'].keys, (e) => {
        keepPosition()
        setSort("context")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortContext'].enable))

    useHotkeys(keymap['sortCompletion'].keys, (e) => {
        keepPosition()
        setSort("is_complete")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortCompletion'].enable))


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
                keepPosition(newId)
            }
            setPrefix('text')
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['normalModeOnSort'].enable))

    useHotkeys(keymap['normalModefromEditDetail'].keys, (e) => {
        if (!e.isComposing) toNormalMode()
        setCommand('')
    }, setKeyEnableDefine(keymap['normalModefromEditDetail'].enable))

    useHotkeys(keymap['numberMode'].keys, (e) => {
        setCommand(command + e.key)
        setMode('number')
    }, setKeyEnableDefine(keymap['numberMode'].enable))

    useHotkeys(keymap['numberInput'].keys, (e) => {
        setCommand(command + e.key)
        setMode('number')
    }, setKeyEnableDefine(keymap['numberInput'].enable))

    useHotkeys(keymap['moveToTop'].keys, (e) => {
        setCurrentIndex(0)
    }, setKeyEnableDefine(keymap['moveToTop'].enable))

    useHotkeys(keymap['moveToEnd'].keys, (e) => {
        setCurrentIndex(filterdTodos.length - 1)
    }, setKeyEnableDefine(keymap['moveToEnd'].enable))

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
    }, setKeyEnableDefine(keymap['moveToLine'].enable))

    useHotkeys(keymap['appendToLine'].keys, (e) => {
        const line = parseInt(command)
        if (moveToLine(line)) {
            handleSetTodos(todoFunc.add(line, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
            setCurrentIndex(line)
            setMode('edit')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['appendToLine'].enable))

    useHotkeys(keymap['insertToLine'].keys, (e) => {
        const line = parseInt(command)
        if (moveToLine(line)) {
            handleSetTodos(todoFunc.add(line - 1, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
            setCurrentIndex(line - 1)
            setMode('edit')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['insertToLine'].enable))


    useHotkeys(keymap['editProjectLine'].keys, (e) => {
        const line = parseInt(command)
        if (moveToLine(line)) {
            setPrefix('project')
            setMode('modal')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['editProjectLine'].enable))

    useHotkeys(keymap['editContextLine'].keys, (e) => {
        const line = parseInt(command)
        if (moveToLine(line)) {
            setPrefix('context')
            setMode('edit')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['editContextLine'].enable))

    useHotkeys(keymap['editPriorityLine'].keys, (e) => {
        const line = parseInt(command)
        if (moveToLine(line)) {
            setPrefix('priority')
            setMode('edit')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['editPriorityLine'].enable))

    useHotkeys(keymap['editTextLine'].keys, (e) => {
        const line = parseInt(command)
        if (moveToLine(line)) {
            setMode('edit')
        } else {
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['editTextLine'].enable))

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
    }, setKeyEnableDefine(keymap['searchEnter'].enable))

    // help toggle
    useHotkeys(keymap['viewHelp'].keys, (e) => {
        setHelp(!isHelp)
    }, setKeyEnableDefine(keymap['viewHelp'].enable))

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
        <div className={`flex gap-2 w-full h-full pb-1`} onMouseDown={handleMainMouseDown}>
            <ResizablePanelGroup direction="horizontal" autoSaveId={"list_detail"}>
                <ResizablePanel defaultSize={80} minSize={4} className="relative pl-1">
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
                    />
                </ResizablePanel>
                <ResizableHandle className="pl-1 bg-border-0 outline-none mt-8 cursor-ew-resize ring-0 hover:bg-sky-500/50 transition-all ease-in" />
                <ResizablePanel defaultSize={20} minSize={4} className={"relative"} >
                    {loading ? (
                        <div className={`absolute top-[30px] w-full h-[calc(100%-30px)] pr-2 border rounded-md bg-white`}>
                            <div className="flex text-sm items-center justify-center h-full w-full ">Loading...</div>
                        </div>
                    ) : (
                        <>
                            <div className={`absolute top-[30px] ${(isHelp && mode !== "editDetail") ? "z-10" : "hidden"} w-full h-[calc(100%-30px)] pr-1 rounded-sm`}>
                                <Usage
                                    sort={sort}
                                    mode={mode}
                                    isHelp={isHelp}
                                    setHelp={setHelp}
                                    isTodos={filterdTodos.length > 0}
                                />
                            </div>
                            <div className={`absolute top-[30px] w-full h-[calc(100%-30px)] pr-1 ${(isHelp && mode !== "editDetail") && "blur-sm backdrop-blur-none"}`}>
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
        </div >

    )
}


export const Item = (
    {
        t,
        index,
        mode,
        currentIndex,
        prefix,
        currentPrefix,
        label,
        className,
        register,
        position = "list",
    }: {
        t: TodoProps
        index: number
        currentIndex: number
        prefix: "text" | "priority" | "project" | "context" | "detail"
        currentPrefix: string
        mode: string
        label: any
        className?: string | undefined
        register: any
        position?: "list" | "content"
    }
) => {
    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation()
    const _classNameCont = `p-1 w-full text-left outline-none bg-transparent ${position === "list" ? "truncate" : "focus:outline-sky-300 rounded hover:cursor-text"} `
    const isView = currentIndex === index
        && currentPrefix === prefix
        && ((mode === "edit" && position === "list") || (mode === "editDetail" && position === "content"))
    const val = t[prefix] ?? ""

    return (
        <>
            <div className={`${isView && "hidden"} ${className}`}>
                {
                    prefix === "detail" ? (
                        <>
                            <textarea
                                tabIndex={-1}
                                // className={_classNameCont}
                                className={"font-normal w-full outline-none bg-gray-50 rounded-sm p-1 resize-none h-full"}
                                rows={10}
                                placeholder="詳細を入力…"
                                defaultValue={label}
                            />
                        </>
                    ) : (
                        <button
                            autoFocus={currentIndex === index}
                            className={_classNameCont}
                            {...register(`${position}-${prefix}-${t.id}`)}
                        >
                            {label}
                        </button>
                    )
                }
            </div >
            <div className={`${!isView && "hidden"} ${className} font-bold h-full`} onMouseDown={e => e.stopPropagation()}>
                {prefix === "detail" ? (
                    <textarea
                        tabIndex={-1}
                        className={"font-normal w-full outline-sky-300 bg-gray-50 rounded-sm p-1 resize-none h-full"}
                        rows={10}
                        placeholder="詳細を入力…"
                        onFocus={e => e.currentTarget.setSelectionRange(0, val.length)}
                        defaultValue={label}
                        {...register(`edit-${position}-${prefix}-${t.id}`)}
                    />
                ) :
                    (
                        <input
                            tabIndex={-1}
                            className={_classNameCont}
                            type="text"
                            maxLength={prefix === 'priority' ? 1 : -1}
                            onFocus={e => e.currentTarget.setSelectionRange(val.length, val.length)}
                            {...register(`edit-${position}-${prefix}-${t.id}`, { value: t[prefix] })}
                        />
                    )}
                {/* )} */}
            </div >
        </>
    )
}


export const ModalSelect = (
    {
        t,
        index,
        currentIndex,
        prefix,
        currentPrefix,
        mode,
        className,
        label,
        register,
        rhfSetValue,
        position = "list",
        items,
        onClick
    }: {
        t: TodoProps
        index: number
        label: string | undefined
        currentIndex: number
        items: string[]
        mode: Mode
        prefix: "text" | "priority" | "project" | "context" | "detail"
        currentPrefix: string
        className?: string | undefined
        register: any
        rhfSetValue: any
        position?: "list" | "content"
        onClick: (index: number, prefx: string) => void
    }) => {
    const isView = currentIndex === index
        && currentPrefix === prefix
        && mode === "modal"
        && (position === "list" || position === "content")

    function open() {
        onClick(currentIndex, prefix)
    }

    function close(_: boolean) {
        onClick(currentIndex, "normal")
    }

    const handleAddItem = (val: string) => {
        rhfSetValue(`edit-${position}-${prefix}-${t.id}`, val)
        onClick(currentIndex, "normal")
    }
    return (
        <>
            <input type="hidden" {...register(`edit-${position}-${prefix}-${t.id}`, { value: label ?? "" })} />
            <Modal
                buttonLabel={label}
                dialogTitle={"選択"}
                className={className}
                open={isView}
                onClickOpen={open}
                onClickClose={close}>
                <div>
                    <div className="text-gray-500">
                        <p className="pt-3 ">
                            <kbd>Enter</kbd>で確定　<kbd>Esc</kbd>でキャンセル
                            <br />
                            <br />
                            <kbd>↑</kbd> <kbd>↓</kbd>キーで選択
                        </p>
                        <p className="text-sm/10 pt-8">
                            <span>現在の値：<span className="text-primary font-medium underline">{label}</span>{!label && "-"}</span>
                        </p>
                    </div>
                    <DynamicSearchSelect
                        autoFocus={true}
                        tabIndex={0}
                        addItem={handleAddItem}
                        placeholder="値を入力..."
                        items={items}
                        {...register(`${position}-${prefix}-${t.id}`)}
                    />
                </div>
            </Modal>
        </>
    )
}