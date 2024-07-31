'use client'
import { useState, MouseEvent, useEffect, Dispatch, SetStateAction } from "react"
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
        toggleHelp,
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
        toggleHelp: () => void;
        onClickSaveButton: () => void;
    }
) => {
    const [command, setCommand] = useState("")
    const [projects, setProjects] = useState<string[]>([])
    const [currentProject, setCurrentProject] = useState("")
    const [viewCompletionTask, setViewCompletionTask] = useState(true)
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [currentId, setCurrentId] = useState<string | undefined>(undefined)
    const [searchResultIndex, setSearchResultIndex] = useState<boolean[]>([])
    const [prefix, setPrefix] = useState('text')
    const [log, setLog] = useState("")
    const { register, setFocus, getValues, setValue } = useForm()

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
                    return _a.localeCompare(_b); // 文字列の比較にする
                });
            }
        }
        setFilterdTodos(_todos)
        if (currentId !== undefined) {
            const index = _todos.map(t => t.id).indexOf(currentId)
            if (index >= 0) setCurrentIndex(index)
            setCurrentId(undefined)
        }
    }, [todos, currentId, currentProject, sort, viewCompletionTask, setFilterdTodos])

    useEffect(() => {
        const filteredProjects = todos.map(t => t.project).filter(p => p !== undefined && p !== "") as string[];
        setProjects(Array.from(new Set(filteredProjects)));
    }, [todos,])

    useEffect(() => {
        if (filterdTodos.length > 0 && currentIndex !== - 1) {
            const id = filterdTodos[currentIndex >= filterdTodos.length ? filterdTodos.length - 1 : currentIndex].id
            const formid = `${prefix}-${id}`
            if (mode === 'edit') setFocus(`edit-${formid}`)
            if (mode === 'normal') setFocus(formid)
            if (mode === 'editOnSort') setFocus("newtask")
        }
    }, [filterdTodos, currentId, mode, currentIndex, prefix, setFocus])

    /*****
     * common function
     ****/
    const handleSetTodos = (_todos: TodoProps[]) => {
        const _t = todoFunc.sortUpdate(_todos)
        setTodos(_t)
        // console.log(_t[0], prevTodos[0])
        setIsUpdate(todoFunc.diff(_t, prevTodos).length > 0)
    }
    const toNormalMode = () => {
        if (filterdTodos.length > 0) {
            const replace: TodoProps = {
                id: filterdTodos[currentIndex].id,
                is_complete: filterdTodos[currentIndex].is_complete,
                priority: getValues(`edit-priority-${filterdTodos[currentIndex].id}`),
                completionDate: filterdTodos[currentIndex].completionDate,
                creationDate: filterdTodos[currentIndex].creationDate,
                text: getValues(`edit-text-${filterdTodos[currentIndex].id}`),
                project: getValues(`edit-project-${filterdTodos[currentIndex].id}`),
                context: getValues(`edit-context-${filterdTodos[currentIndex].id}`),
                detail: getValues(`edit-detail-${filterdTodos[currentIndex].id}`)
            }
            if (todoFunc.isEmpty(replace)) {
                handleSetTodos(todoFunc.delete(todos, filterdTodos[currentIndex].id))
                setCurrentIndex(currentIndex === 0 ? 0 : currentIndex - 1)
            } else {
                const t = todos.filter(_t => _t.id === replace.id)[0]
                if (!isEqual(t, replace)) handleSetTodos(todoFunc.modify(todos, replace))
            }
            // ソートした後に編集すると位置ズレを起こすため修正
            setCurrentId(filterdTodos[currentIndex].id)
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
            detail: filterdTodos[index].detail
        })
        handleSetTodos(_todos)
    }

    const changeProject = (index: number) => {
        setCurrentProject(index === -1 ? "" : projects[index])
        setCurrentIndex(0)
        setCommand('')
        setMode('normal')
    }
    /** hotkeys  */
    /*******************
     * 
     * Normal mode
     * 
     *******************/
    // useHotkeys("Space", (e) => console.log(e))

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
    }, setKeyEnableDefine(keymap['insertTop'].enable))

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
        const index = currentIndex >= filterdTodos.length ? filterdTodos.length - 1 : currentIndex
        setCurrentIndex(index)
        handleSetTodos(todoFunc.delete(todos, filterdTodos[index].id))
    }, setKeyEnableDefine(keymap['delete'].enable))

    // change to edit mode
    useHotkeys(keymap['editText'].keys, (e) => {
        setMode('edit')
    }, setKeyEnableDefine(keymap['editText'].enable))

    // change to priority edit mode
    useHotkeys(keymap['editPriority'].keys, (e) => {
        setPrefix('priority')
        setMode('edit')
    }, setKeyEnableDefine(keymap['editPriority'].enable))

    // change to project edit mode
    useHotkeys(keymap['editProject'].keys, (e) => {
        setPrefix('project')
        setMode('edit')
    }, { ...setKeyEnableDefine(keymap['editProject'].enable) })

    // change to context edit mode
    useHotkeys(keymap['editContext'].keys, (e) => {
        setPrefix('context')
        setMode('edit')
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
        const id = filterdTodos.length > 0 ? filterdTodos[currentIndex].id : undefined
        setViewCompletionTask(!viewCompletionTask)
        if (id !== undefined) setCurrentId(id)
    }, setKeyEnableDefine(keymap['toggleCompletionTask'].enable))

    /*******************
     * 
     * Sort mode
     * 
     *******************/
    useHotkeys(keymap['sortPriority'].keys, (e) => {
        setSort("priority")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortPriority'].enable))

    useHotkeys(keymap['sortClear'].keys, (e) => {
        setSort(undefined)
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortClear'].enable))

    useHotkeys(keymap['sortCreationDate'].keys, (e) => {
        setSort("creationDate")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortCreationDate'].enable))

    useHotkeys(keymap['sortContext'].keys, (e) => {
        setSort("context")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortContext'].enable))

    useHotkeys(keymap['sortCompletion'].keys, (e) => {
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
                setCurrentId(newId)
            }
            setPrefix('text')
            setMode('normal')
        }
        setCommand('')
    }, setKeyEnableDefine(keymap['normalModeOnSort'].enable))

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
            setMode('edit')
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
        setMode('edit')
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
        toggleHelp()
    }, setKeyEnableDefine(keymap['viewHelp'].enable))

    /*******************
     * 
     * Command mode
     * 
     *******************/
    const handleClickElement = (index: number, prefix: string) => {
        if (prefix === 'completion') completeTask(index)
        if (prefix === 'projectTab') changeProject(index)
        if (['priority', 'context', 'text', 'project'].includes(prefix)) {
            setPrefix(prefix)
            setMode('edit')
        }
    }
    const handleClickDetailElement = (prefix: string) => {
        if (prefix === 'completion') completeTask(currentIndex)
        if (prefix === 'detail') {
            setPrefix("detail")
            setMode("edit")
        }
    }
    const handleMainMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        toNormalMode()
        e.preventDefault()
        e.stopPropagation();
    }
    return (
        <div className={`flex gap-2 w-full h-full`} onMouseDown={handleMainMouseDown}>
            <ResizablePanelGroup direction="horizontal" autoSaveId={"list_detail"}>
                <ResizablePanel defaultSize={80} minSize={4}>
                    <TodoList
                        filterdTodos={filterdTodos}
                        currentIndex={currentIndex}
                        prefix={prefix}
                        mode={mode}
                        projects={projects}
                        currentProject={currentProject}
                        sort={sort}
                        searchResultIndex={searchResultIndex}
                        command={command}
                        loading={loading}
                        onClick={handleClickElement}
                        setCurrentIndex={setCurrentIndex}
                        register={register}
                    />
                </ResizablePanel>
                <ResizableHandle className="w-0 px-1 bg-transparent border-0 outline-none ring-0" />
                <ResizablePanel defaultSize={20} minSize={4} className=" mt-12" >
                    <Detail
                        todo={filterdTodos[currentIndex]}
                        prefix={prefix}
                        mode={mode}
                        onClick={handleClickDetailElement}
                        register={register}
                    />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>

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
        register
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
    }
) => {
    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation()
    const _classNameCont = "p-1 w-full text-left truncate outline-none bg-transparent"
    const isView = currentIndex === index && currentPrefix === prefix && mode === "edit"
    const val = t[prefix] ?? ""

    return (
        <>
            <div className={`${isView && "hidden"} ${className}`}>
                {prefix === "detail" ? (
                    <textarea
                        tabIndex={-1}
                        // className={_classNameCont}
                        className={"font-normal w-full outline-none bg-gray-50 rounded-sm p-1 resize-none"}
                        rows={10}
                        placeholder="詳細を入力…"
                        {...register(`edit-${prefix}-${t.id}`, { value: t[prefix] })}
                    />
                ) :
                    (
                        <button
                            autoFocus={currentIndex === index}
                            className={_classNameCont}
                            {...register(`${prefix}-${t.id}`)}
                        >
                            {label}
                        </button>
                    )}
            </div>
            <div className={`${!isView && "hidden"} ${className} font-bold`}>
                {/* {(prefix === "project" || prefix === "context") ? (
                    <DynamicSearchSelect tabIndex={-1} items={["project", "hobby"]} placeholder={"選択"} {...register(`edit-${prefix}-${t.id}`, { value: t[prefix] })} addItem={addItem} autoSave={false} />
                ) : ( */}
                {prefix === "detail" ? (
                    <textarea
                        onMouseDown={e => e.stopPropagation()}
                        tabIndex={-1}
                        className={"font-normal w-full outline-none bg-gray-50 rounded-sm p-1 resize-none"}
                        rows={10}
                        placeholder="詳細を入力…"
                        onFocus={e => e.currentTarget.setSelectionRange(0, val.length)}
                        {...register(`edit-${prefix}-${t.id}`, { value: t[prefix] })}
                    />
                ) :
                    (
                        <input
                            tabIndex={-1}
                            className={_classNameCont}
                            type="text"
                            maxLength={prefix === 'priority' ? 1 : -1}
                            onFocus={e => e.currentTarget.setSelectionRange(val.length, val.length)}
                            {...register(`edit-${prefix}-${t.id}`, { value: t[prefix] })}
                        />
                    )}
                {/* )} */}
            </div >
        </>
    )
}