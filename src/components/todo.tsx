'use client'
import { useState, MouseEvent, ChangeEvent, useEffect, } from "react"
import { useHotkeys, } from "react-hotkeys-hook"
import { useForm } from "react-hook-form"
import { keymap } from './config'
import { TodoProps, Sort, Mode } from "@/types"
import { todoFunc } from "@/libs/todo"
import { yyyymmddhhmmss } from "@/libs/time"
export const Todo = () => {
    const [key, setKey] = useState("")
    const [todos, setTodos] = useState<TodoProps[]>([
        { id: 0, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
        { id: 1, text: 'プロジェクトAの締め切り日に対してメールする', priority: 'b', project: "job", context: "family" },
        { id: 2, text: '締切日までに作品仕上げる', priority: 'A', project: "hobby", },
        { id: 3, text: '材料を買う', project: "hobby" },
        { id: 4, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
        { id: 14, text: 'プロジェクトAの締め切り日に対してメールする', priority: 'b', project: "job", context: "family" },
        { id: 12, text: '締切日までに作品仕上げる', priority: 'A', project: "hobby", },
        { id: 13, text: '材料を買う', project: "hobby" },
        { id: 10, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
    ])
    const [filterdTodos, setFilterdTodos] = useState<TodoProps[]>(todos)
    const [projects, setProjects] = useState<string[]>([])
    const [currentProject, setCurrentProject] = useState("")
    const [currentSort, setCurrentSort] = useState<Sort>(undefined)
    const [viewCompletionTask, setViewCompletionTask] = useState(true)
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [currentId, setCurrentId] = useState<number | undefined>(undefined)
    const [searchResultIndex, setSearchResultIndex] = useState<boolean[]>([])
    const [mode, setMode] = useState<Mode>('normal')
    const [prefix, setPrefix] = useState('text')
    const [log, setLog] = useState("")
    const { register, setFocus, getValues, setValue } = useForm()

    const setKeyEnableDefine = (keyConf: { mode?: Mode[], sort?: Sort[], withoutTask?: boolean } | undefined) => {
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
                    if (s === currentSort) enabledSort = true
                })
            }
            enabledWithoutTask = filterdTodos.length === 0 ? keyConf.withoutTask ?? true : true
        }
        return { enabled: enabledMode && enabledSort && enabledWithoutTask, enableOnContentEditable: true, enableOnFormTags: true, preventDefault: true }
    }

    useEffect(() => {
        let _todos = !currentProject ? [...todos] : todos.filter(t => t.project === currentProject)

        if (!viewCompletionTask) {
            _todos = _todos.filter(t => t.isCompletion !== true)
        }

        if (currentSort !== undefined) {
            _todos.sort((a, b) => {
                let _a = a[currentSort]
                let _b = b[currentSort]
                if (currentSort === 'isCompletion' || typeof _a === "boolean" || typeof _b === "boolean") {
                    _a = _a === undefined ? "a" : _a ? undefined : "a"
                    _b = _b === undefined ? "a" : _b ? undefined : "a"
                }
                if (_a === undefined || !_a) return 1
                if (_b === undefined || !_b) return -1
                return _a.localeCompare(_b); // 文字列の比較にする
            });
        }
        setFilterdTodos(_todos)
        if (currentId !== undefined) {
            const index = _todos.map(t => t.id).indexOf(currentId)
            if (index >= 0) setCurrentIndex(index)
            setCurrentId(undefined)
        }
    }, [todos, currentId, currentProject, currentSort, viewCompletionTask])

    useEffect(() => {
        const filteredProjects = todos.map(t => t.project).filter(p => p !== undefined && p !== "") as string[];
        setProjects(Array.from(new Set(filteredProjects)));
    }, [todos,])

    useEffect(() => {
        if (filterdTodos.length > 0 && currentIndex !== - 1) {
            const id = filterdTodos[currentIndex >= filterdTodos.length ? filterdTodos.length - 1 : currentIndex].id
            const formid = `${prefix}-${id}`
            if (mode === 'edit') setFocus(`edit-${formid}`, { shouldSelect: true })
            if (mode === 'normal') setFocus(formid)
        }
    }, [filterdTodos, currentId, mode, currentIndex, prefix, setFocus])


    /*****
     * common function
     */
    const toNormalMode = () => {
        const replace = {
            id: filterdTodos[currentIndex].id,
            isCompletion: filterdTodos[currentIndex].isCompletion,
            priority: getValues(`edit-priority-${filterdTodos[currentIndex].id}`),
            completionDate: filterdTodos[currentIndex].completionDate,
            creationDate: filterdTodos[currentIndex].creationDate,
            text: getValues(`edit-text-${filterdTodos[currentIndex].id}`),
            project: getValues(`edit-project-${filterdTodos[currentIndex].id}`),
            context: getValues(`edit-context-${filterdTodos[currentIndex].id}`)
        }
        if (todoFunc.isEmpty(replace)) {
            setTodos(todoFunc.delete(todos, filterdTodos[currentIndex].id))
            setCurrentIndex(currentIndex === 0 ? 0 : currentIndex - 1)
        } else {
            setTodos(todoFunc.modify(todos, replace))
        }
        // ソートした後に編集すると位置ズレを起こすため修正
        setCurrentId(filterdTodos[currentIndex].id)
        setPrefix('text')
        setMode('normal')
    }
    /*******************
     * 
     * Normal mode
     * 
     *******************/
    // move to up 
    useHotkeys(keymap['up'].keys, (e) => {
        if (0 < currentIndex) setCurrentIndex(currentIndex - 1)
        setKey('')
        setMode('normal')
    }, setKeyEnableDefine(keymap['up'].enable))

    // move to down
    useHotkeys(keymap['down'].keys, (e) => {
        if (currentIndex < filterdTodos.length - 1) setCurrentIndex(currentIndex + 1)
        setKey('')
        setMode('normal')
    }, setKeyEnableDefine(keymap['down'].enable))

    // insert task 
    useHotkeys(keymap['insert'].keys, (e) => {
        setTodos(todoFunc.add(currentIndex, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
        setMode('edit')
    }, setKeyEnableDefine(keymap['insert'].enable))

    // add task to Top
    useHotkeys(keymap['insertTop'].keys, (e) => {
        setTodos(todoFunc.add(0, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
        setCurrentIndex(0)
        setMode('edit')
    }, setKeyEnableDefine(keymap['insertTop'].enable))

    // add task to Top
    useHotkeys(keymap['insertTopOnSort'].keys, (e) => {
        setFocus('newtask')
        setMode('editOnSort')
    }, setKeyEnableDefine(keymap['insertTopOnSort'].enable))

    // append task 
    useHotkeys(keymap['append'].keys, (e) => {
        setTodos(todoFunc.add(currentIndex + 1, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
        setCurrentIndex(currentIndex + 1)
        setMode('edit')
    }, setKeyEnableDefine(keymap['append'].enable))

    // append task to bottom
    useHotkeys(keymap['appendBottom'].keys, (e) => {
        setTodos(todoFunc.add(filterdTodos.length, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
        setCurrentIndex(filterdTodos.length)
        setMode('edit')
    }, setKeyEnableDefine(keymap['appendBottom'].enable))

    // delete task
    useHotkeys(keymap['delete'].keys, (e) => {
        const index = currentIndex >= filterdTodos.length ? filterdTodos.length - 1 : currentIndex
        setCurrentIndex(index)
        setTodos(todoFunc.delete(todos, filterdTodos[index].id))
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
                setCurrentProject(projects[0])
                setCurrentIndex(0)
                setKey('')
                setMode('normal')
            } else {
                const _index = projects.indexOf(currentProject)
                if (_index < projects.length - 1) {
                    setCurrentProject(projects[_index + 1])
                    setCurrentIndex(0)
                    setKey('')
                    setMode('normal')
                }
            }
        }
    }, setKeyEnableDefine(keymap['moveProjectRight'].enable))

    // move to left project
    useHotkeys(keymap['moveProjectLeft'].keys, (e) => {
        if (projects.length > 0) {
            if (currentProject) {
                const _index = projects.indexOf(currentProject)
                if (_index === 0) {
                    setCurrentProject("")
                } else {
                    setCurrentProject(projects[_index - 1])
                }
                setCurrentIndex(0)
                setKey('')
                setMode('normal')
            }
        }
    }, setKeyEnableDefine(keymap['moveProjectLeft'].enable))

    // change to edit mode
    useHotkeys(keymap['completion'].keys, (e) => {
        const index = currentIndex >= filterdTodos.length ? filterdTodos.length - 1 : currentIndex
        setCurrentIndex(index)
        const _todos = todoFunc.modify(todos, {
            id: filterdTodos[index].id,
            isCompletion: !filterdTodos[index].isCompletion,
            priority: filterdTodos[index].priority,
            completionDate: !filterdTodos[index].isCompletion ? yyyymmddhhmmss(new Date()) : "",
            creationDate: filterdTodos[index].creationDate,
            text: filterdTodos[index].text,
            project: filterdTodos[index].project,
            context: filterdTodos[index].context
        })
        setTodos(_todos)
    }, setKeyEnableDefine(keymap['completion'].enable))

    // change sort mode
    useHotkeys(keymap['sortMode'].keys, (e) => {
        setMode("sort")
    }, setKeyEnableDefine(keymap['sortMode'].enable))


    // toggle commpletion
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
        setCurrentSort("priority")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortPriority'].enable))

    useHotkeys(keymap['sortClear'].keys, (e) => {
        setCurrentSort(undefined)
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortClear'].enable))

    useHotkeys(keymap['sortCreationDate'].keys, (e) => {
        setCurrentSort("creationDate")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortCreationDate'].enable))

    useHotkeys(keymap['sortContext'].keys, (e) => {
        setCurrentSort("context")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortContext'].enable))

    useHotkeys(keymap['sortCompletion'].keys, (e) => {
        setCurrentSort("isCompletion")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortCompletion'].enable))


    // change command mode
    // useHotkeys(':', (e) => {
    //     setMode('command')
    //     setKey(e.key)
    // }, enabled.normal)

    /*******************
     * 
     * Edit mode
     * 
     *******************/
    // change to normal mode
    useHotkeys(keymap['normalMode'].keys, (e) => {
        if (!e.isComposing) toNormalMode()
        setKey('')
    }, setKeyEnableDefine(keymap['normalMode'].enable))

    useHotkeys(keymap['normalModeOnSort'].keys, (e) => {
        if (!e.isComposing) {
            const newId = todos.length === 0 ? 1 : Math.max(...todos.map((t: TodoProps) => t.id)) + 1
            const newtask = {
                id: newId,
                creationDate: yyyymmddhhmmss(new Date()),
                text: getValues(`newtask`),
                project: currentProject
            }
            if (!todoFunc.isEmpty(newtask)) {
                setTodos([newtask, ...todos])
                setValue("newtask", "")
                setCurrentId(newId)
            }
            setPrefix('text')
            setMode('normal')
        }
        setKey('')
    }, setKeyEnableDefine(keymap['normalModeOnSort'].enable))

    useHotkeys(keymap['numberMode'].keys, (e) => {
        setKey(key + e.key)
        setMode('number')
    }, setKeyEnableDefine(keymap['numberMode'].enable))

    useHotkeys(keymap['numberInput'].keys, (e) => {
        setKey(key + e.key)
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
        const line = parseInt(key)
        moveToLine(line)
        setMode('normal')
        setKey('')
    }, setKeyEnableDefine(keymap['moveToLine'].enable))

    useHotkeys(keymap['appendToLine'].keys, (e) => {
        const line = parseInt(key)
        if (moveToLine(line)) {
            setTodos(todoFunc.add(line, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
            setCurrentIndex(line)
            setMode('edit')
        } else {
            setMode('normal')
        }
        setKey('')
    }, setKeyEnableDefine(keymap['appendToLine'].enable))

    useHotkeys(keymap['insertToLine'].keys, (e) => {
        const line = parseInt(key)
        if (moveToLine(line)) {
            setTodos(todoFunc.add(line - 1, todos, { project: currentProject, viewCompletionTask: viewCompletionTask }))
            setCurrentIndex(line - 1)
            setMode('edit')
        } else {
            setMode('normal')
        }
        setKey('')
    }, setKeyEnableDefine(keymap['insertToLine'].enable))


    useHotkeys(keymap['editProjectLine'].keys, (e) => {
        const line = parseInt(key)
        if (moveToLine(line)) {
            setPrefix('project')
            setMode('edit')
        } else {
            setMode('normal')
        }
        setKey('')
    }, setKeyEnableDefine(keymap['editProjectLine'].enable))

    useHotkeys(keymap['editContextLine'].keys, (e) => {
        const line = parseInt(key)
        if (moveToLine(line)) {
            setPrefix('context')
            setMode('edit')
        } else {
            setMode('normal')
        }
        setKey('')
    }, setKeyEnableDefine(keymap['editContextLine'].enable))

    useHotkeys(keymap['editPriorityLine'].keys, (e) => {
        const line = parseInt(key)
        if (moveToLine(line)) {
            setPrefix('priority')
            setMode('edit')
        } else {
            setMode('normal')
        }
        setKey('')
    }, setKeyEnableDefine(keymap['editPriorityLine'].enable))

    useHotkeys(keymap['editTextLine'].keys, (e) => {
        const line = parseInt(key)
        if (moveToLine(line)) {
            setMode('edit')
        } else {
            setMode('normal')
        }
        setKey('')
    }, setKeyEnableDefine(keymap['editTextLine'].enable))

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

    /*******************
     * 
     * Command mode
     * 
     *******************/
    // useHotkeys('*', (e) => {
    //     if (!['Enter', 'Escape', 'Backspace'].includes(e.key)) setKey(key + e.key)
    // }, enabled.command)

    // useHotkeys(['Enter'], (e) => {
    //     e.preventDefault()
    //     setLog(`Not found command:${key}`)
    //     setMode('normal')
    //     setKey("")
    // }, enabled.command)

    // useHotkeys('Esc', (e) => {
    //     e.preventDefault()
    //     setMode('normal')
    //     setPrefix('text')
    //     setKey("")
    // }, enabled.command)


    // const handleTodoChange = (e: ChangeEvent<HTMLInputElement>) => {
    // const val = e.target?.value
    // if (val) {
    // setTodos(todos.map((t, i) => {
    // if (i === currentIndex) t.text = val
    // return t
    // }))
    // }
    // }

    const handleFocus = (index: number) => setCurrentIndex(index)
    const handleMainMouseDown = (e: MouseEvent<HTMLDivElement>) => e.preventDefault()
    const handleTodoAreaMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation();
    }

    return (
        <div className="flex flex-col h-screen justify-between text-sm" id="main" onMouseDown={handleMainMouseDown}>
            <div onMouseDown={e => e.preventDefault()} className="flex flex-col">
                <div onMouseDown={e => e.preventDefault()} className="flex justify-between">
                    <div onMouseDown={handleTodoAreaMouseDown} className="w-3/4 overflow-auto bg-gray-50">
                        <button className={`border-r-2 border-t-2 p-1 ${!currentProject || !projects.length ? "bg-blue-100" : "bg-white"}`}>All</button>
                        {projects.map(p => {
                            return (
                                <button key={p} className={`border-r-2 border-t-2 p-1 ${currentProject === p ? "bg-blue-100" : ""}`}>{p}</button>
                            )
                        })}
                        {currentSort !== undefined &&
                            <div className="flex items-center border-b truncate bg-white">
                                <div className="w-[45px]" />
                                <input
                                    tabIndex={-1}
                                    className={`text-left truncate outline-none bg-transparent focus:bg-gray-100 focus:h-auto h-0`}
                                    type="text"
                                    maxLength={prefix === 'priority' ? 1 : -1}
                                    {...register(`newtask`)}
                                // onFocus={e => e.currentTarget.setSelectionRange(t[prefix].length, t.text.length)}
                                />
                            </div>
                        }
                        {filterdTodos.length === 0 &&
                            <div>No task. good!</div>
                        }
                        {filterdTodos.map((t, index) => {
                            return (
                                <div key={t.id} className={`flex w-full border-b truncate focus-within:bg-blue-100 ${searchResultIndex[index] ? "bg-yellow-100" : "bg-white"}`}>
                                    <span className="w-[15px] text-center text-xs text-gray-900 border-r border-r-blue-200"> {index + 1}</span>
                                    <div className="w-full">
                                        <div className="flex items-center w-full">
                                            <span className="w-[15px] text-center"> {t.isCompletion ? "x" : ""}</span>
                                            <Item
                                                t={t}
                                                index={index}
                                                currentIndex={currentIndex}
                                                prefix={"priority"}
                                                currentPrefix={prefix}
                                                mode={mode}
                                                width="w-[25px]"
                                                label={t.priority ? `(${t.priority})` : ""}
                                                handleFocus={handleFocus}
                                                register={register} />
                                            <Item
                                                t={t}
                                                index={index}
                                                currentIndex={currentIndex}
                                                prefix={"text"}
                                                currentPrefix={prefix}
                                                mode={mode}
                                                label={t.text}
                                                handleFocus={handleFocus}
                                                register={register} />
                                        </div>
                                        <div className="flex w-full gap-3 justify-between text-xs">
                                            <div className="flex gap-3 text-xs text-gray-400 pl-8">
                                                <Item
                                                    t={t}
                                                    index={index}
                                                    currentIndex={currentIndex}
                                                    prefix={"project"}
                                                    currentPrefix={prefix}
                                                    mode={mode}
                                                    label={t.project ? ` :${t.project}` : ""}
                                                    handleFocus={handleFocus}
                                                    register={register} />
                                                <Item
                                                    t={t}
                                                    index={index}
                                                    currentIndex={currentIndex}
                                                    prefix={"context"}
                                                    currentPrefix={prefix}
                                                    mode={mode}
                                                    label={t.context ? ` @${t.context}` : ""}
                                                    handleFocus={handleFocus}
                                                    register={register} />
                                            </div>
                                            {t.creationDate}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <div className="text-gray-400">CompletionTask: {todos.filter(t => !currentProject ? true : t.project === currentProject).filter(t => t.isCompletion).length}</div>
                    </div>
                    <div className="border bg-gray-200 w-1/4 h-full break-words">
                        <div className="border rounded-md">
                            <ul>
                                {/* <li>id: {todos[currentIndex].id}</li> */}
                                {/* <li>isCompletion: {todos[currentIndex].isCompletion ? "完了" : "未完了"}</li> */}
                                {/* <li>priority(A&gt;Z):{filterdTodos[currentIndex].priority}</li> */}
                                {/* <li>completionDate: {filterdTodos[currentIndex].completionDate}</li> */}
                                {/* <li>creationDate: {filterdTodos[currentIndex].creationDate}</li> */}
                                {/* <li>text: {filterdTodos[currentIndex].text}</li> */}
                                {/* <li>+project: {filterdTodos[currentIndex].project}</li> */}
                                {/* <li>@context: {filterdTodos[currentIndex].context}</li> */}
                            </ul>
                        </div>
                        debug area:
                        <div className="border rounded-sm bg-green-50 h-[400px] overflow-auto">
                            {
                                todos.map((t, i) => {
                                    return (
                                        <div key={`debug:${t.id}`} className="py-2 border-b-2">
                                            {Object.entries(t).map(([key, val]) => key === "id" || key === "text" ? <div key={`debug:${key}`}>{key}:{val}</div> : undefined)}
                                        </div>
                                    )
                                })
                            }
                        </div>
                        filterdTodos
                        <div className="border rounded-sm bg-green-50 h-[500px] overflow-auto">
                            {
                                filterdTodos.map((t, i) => {
                                    return (
                                        <div key={`debug:${t.id}`} className="py-2 border-b-2">
                                            {Object.entries(t).map(([key, val]) => (key === "id" || key === "text" || key === "priority" || key === "project") ? <div key={`debug:${key}`}>{key}:{val ?? "undefined or null"}</div> : undefined)}
                                        </div>
                                    )
                                })
                            }
                        </div>

                    </div>
                </div>
            </div>
            <div>
                <div className="bg-sky-300 py-2 px-2">
                    Usage space
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8  gap-4 b">
                        {
                            Object.entries(keymap).map(([key, value]) => {
                                if (
                                    value.enable?.mode.includes(mode)
                                    && (value.enable.sort === undefined || value.enable.sort?.includes(currentSort))
                                    && (filterdTodos.length > 0 ? true : (value.enable.withoutTask === undefined || value.enable.withoutTask))
                                ) {
                                    return (
                                        <div key={key} className="flex items-center gap-2">
                                            {value.keysDisp !== undefined ? (
                                                value.keysDisp.map((k, i) => <kbd key={`usage${k}${i}`} className="flex items-center h-[25px] px-2 py-0.5 text-xs font-semibold bg-sky-100 shadow-lg rounded-md">{k}</kbd>)
                                            ) : (
                                                value.keys.map(k => <kbd key={k} className="flex items-center h-[25px] px-2 py-0.5 text-xs font-semibold bg-sky-100 shadow-lg rounded-md">{k}</kbd>)
                                            )}
                                            :{value.description}
                                        </div>
                                    )
                                }
                            })
                        }
                    </div>
                </div>
                <div className="flex gap-3 bg-black text-white">
                    <span>press:{key}</span>
                    <div className="flex">search keyword:<input {...register("search")} className={`text-left truncate outline-none bg-transparent focus:bg-gray-100 focus:text-black`} type="text" /></div>
                    <span>current index:{currentIndex}</span>
                    <span>current id:{currentId}</span>
                    <span>current mode:{mode}</span>
                    <span>current sort:{currentSort}</span>
                    <span>current log:{log}</span>
                </div>
            </div>
        </div>
    )
}

const Item = (
    {
        t,
        index,
        mode,
        currentIndex,
        prefix,
        currentPrefix,
        width = '',
        height = '',
        label,
        handleFocus,
        register
    }: {
        t: TodoProps
        index: number
        currentIndex: number
        prefix: "text" | "priority" | "project" | "context"
        currentPrefix: string
        mode: string
        width?: string
        height?: string
        label: string | undefined
        handleFocus: (index: number) => void
        register: any
    }
) => {
    const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation()
    return (
        <>
            <div onMouseDown={handleMouseDown} className={`${!(currentIndex === index && currentPrefix === prefix && mode === "edit") ? width : "hidden"}`}>
                <button
                    className={`w-full text-left truncate outline-none`}
                    onClick={_ => handleFocus(index)}
                    autoFocus={currentIndex === index}
                    {...register(`${prefix}-${t.id}`)}
                >
                    <span className={`${t.isCompletion ? "line-through text-gray-600" : ""}`}>
                        {label}
                    </span>
                </button>
            </div>
            <div onMouseDown={handleMouseDown} className={`focus-within:font-medium ${currentIndex === index && currentPrefix === prefix && mode === "edit" ? width : "hidden"}`}>
                <input
                    tabIndex={-1}
                    className={`w-full text-left truncate outline-none bg-transparent focus:bg-gray-100`}
                    type="text"
                    maxLength={prefix === 'priority' ? 1 : -1}
                    {...register(`edit-${prefix}-${t.id}`, { value: t[prefix] })}
                // onFocus={e => e.currentTarget.setSelectionRange(t[prefix].length, t.text.length)}
                />
            </div >
        </>
    )
}