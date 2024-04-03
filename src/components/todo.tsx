'use client'
import { useState, MouseEvent, ChangeEvent, useEffect, } from "react"
import { useHotkeys, } from "react-hotkeys-hook"
import { useForm } from "react-hook-form"
import { keymap } from './config'
import { dispKey } from "@/libs/dispkeyname"
import { TodoProps, Sort, Mode } from "@/types"
import { todoFunc } from "@/libs/todo"
import { yyyymmddhhmmss } from "@/libs/time"
export const Todo = () => {
    const [key, setKey] = useState("")
    const [todos, setTodos] = useState<TodoProps[]>([
        { id: 0, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
        { id: 1, text: 'プロジェクトAの締め切り日に対してメールする', priority: 'b', project: "job", context: "family" },
        { id: 2, text: '締切日までに作品仕上げる', priority: 'A', project: "hobby", },
        { id: 3, text: '材料を買う', project: "hobby" }
    ])
    const [filterdTodos, setFilterdTodos] = useState<TodoProps[]>(todos)
    const [projects, setProjects] = useState<string[]>([])
    const [currentProject, setCurrentProject] = useState("")
    const [currentSort, setCurrentSort] = useState<Sort>(undefined)
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [mode, setMode] = useState<Mode>('normal')
    const [prefix, setPrefix] = useState('text')
    const [log, setLog] = useState("")
    const { register, setFocus, getValues } = useForm()

    const setKeyEnableDefine = (keyConf: { mode?: Mode[], sort?: Sort[] } | undefined) => {
        let enabledMode = false
        let enabledSort = true
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
        }
        return { enabled: enabledMode && enabledSort, enableOnContentEditable: true, enableOnFormTags: true, preventDefault: true }
    }

    useEffect(() => {
        const _todos = !currentProject ? [...todos] : todos.filter(t => t.project === currentProject)
        if (currentSort !== undefined) {
            _todos.sort((a, b) => {
                const _a = a[currentSort]
                const _b = b[currentSort]
                if (_a === undefined) return 1
                if (_b === undefined) return -1
                return _a.localeCompare(_b); // 文字列の比較にする
            });
        }
        setFilterdTodos(_todos)
    }, [todos, currentProject, currentSort])

    useEffect(() => {
        const filteredProjects = todos.map(t => t.project).filter(p => p !== undefined && p !== "") as string[];
        setProjects(Array.from(new Set(filteredProjects)));
    }, [todos])

    useEffect(() => {
        if (mode === 'edit') setFocus(`edit-${prefix}-${filterdTodos[currentIndex >= filterdTodos.length ? filterdTodos.length - 1 : currentIndex].id}`, { shouldSelect: true })
        if (mode === 'normal') setFocus(`${prefix}-${filterdTodos[currentIndex >= filterdTodos.length ? filterdTodos.length - 1 : currentIndex].id}`)
    }, [filterdTodos, mode, currentIndex, prefix, setFocus])
    /*****
     * common func
     */
    const toNormalMode = () => {
        const replace = {
            id: filterdTodos[currentIndex].id,
            isCompletion: filterdTodos[currentIndex].isCompletion,
            priority: getValues(`edit-priority-${filterdTodos[currentIndex].id}`).toUpperCase(),
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
    }, setKeyEnableDefine(keymap['up'].enable))

    // move to down
    useHotkeys(keymap['down'].keys, (e) => {
        if (currentIndex < filterdTodos.length - 1) setCurrentIndex(currentIndex + 1)
    }, setKeyEnableDefine(keymap['down'].enable))

    // insert task 
    useHotkeys(keymap['insert'].keys, (e) => {
        setTodos(todoFunc.add(currentIndex, todos, { project: currentProject }))
        setMode('edit')
    }, setKeyEnableDefine(keymap['insert'].enable))

    // add task to Top
    useHotkeys(keymap['insertTop'].keys, (e) => {
        setTodos(todoFunc.add(0, todos, { project: currentProject }))
        setCurrentIndex(0)
        setMode('edit')
    }, setKeyEnableDefine(keymap['insertTop'].enable))

    // append task 
    useHotkeys(keymap['append'].keys, (e) => {
        setTodos(todoFunc.add(currentIndex + 1, todos, { project: currentProject }))
        setCurrentIndex(currentIndex + 1)
        setMode('edit')
    }, setKeyEnableDefine(keymap['append'].enable))

    // append task to bottom
    useHotkeys(keymap['appendBottom'].keys, (e) => {
        setMode('edit')
        setTodos(todoFunc.add(todos.length, todos, { project: currentProject }))
        setCurrentIndex(filterdTodos.length)
    }, setKeyEnableDefine(keymap['appendBottom'].enable))

    // change to edit mode
    useHotkeys(keymap['editTextMode'].keys, (e) => {
        setMode('edit')
    }, setKeyEnableDefine(keymap['editTextMode'].enable))

    // change to priority edit mode
    useHotkeys(keymap['editPriorityMode'].keys, (e) => {
        setPrefix('priority')
        setMode('edit')
    }, setKeyEnableDefine(keymap['editPriorityMode'].enable))

    // change to project edit mode
    useHotkeys(keymap['editProjectMode'].keys, (e) => {
        setPrefix('project')
        setMode('edit')
    }, setKeyEnableDefine(keymap['editProjectMode'].enable))

    // change to context edit mode
    useHotkeys(keymap['editContextMode'].keys, (e) => {
        setPrefix('context')
        setMode('edit')
    }, setKeyEnableDefine(keymap['editContextMode'].enable))

    // move to right project
    useHotkeys(keymap['moveProjectRight'].keys, (e) => {
        if (projects.length > 0) {
            if (!currentProject) {
                setCurrentProject(projects[0])
                setCurrentIndex(0)
            } else {
                const _index = projects.indexOf(currentProject)
                if (_index < projects.length - 1) {
                    setCurrentProject(projects[_index + 1])
                    setCurrentIndex(0)
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
            }
        }
    }, setKeyEnableDefine(keymap['moveProjectLeft'].enable))

    // change to edit mode
    useHotkeys(keymap['completion'].keys, (e) => {
        setTodos(todoFunc.modify(todos, {
            id: filterdTodos[currentIndex].id,
            isCompletion: !filterdTodos[currentIndex].isCompletion,
            priority: filterdTodos[currentIndex].priority,
            completionDate: !filterdTodos[currentIndex].isCompletion ? yyyymmddhhmmss(new Date()) : "",
            creationDate: filterdTodos[currentIndex].creationDate,
            text: filterdTodos[currentIndex].text,
            project: filterdTodos[currentIndex].project,
            context: filterdTodos[currentIndex].context
        }))
    }, setKeyEnableDefine(keymap['completion'].enable))

    // change sort mode
    useHotkeys(keymap['sortMode'].keys, (e) => {
        setMode("sort")
    }, setKeyEnableDefine(keymap['sortMode'].enable))

    /*******************
     * 
     * Sort mode
     * 
     *******************/

    useHotkeys(keymap['sortPriorityMode'].keys, (e) => {
        setCurrentSort("priority")
        setMode("normal")
    }, setKeyEnableDefine(keymap['sortPriorityMode'].enable))

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
    }, setKeyEnableDefine(keymap['normalMode'].enable))

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
    const handleTodoAreaMouseDown = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation();

    return (
        <div className="flex flex-col h-screen justify-between text-sm" id="main" onMouseDown={handleMainMouseDown}>
            <div className="flex flex-col ">
                <div className="flex justify-between">
                    <div onMouseDown={handleTodoAreaMouseDown} className="w-3/4 overflow-auto bg-gray-50">
                        <button className={`border-r-2 border-t-2 p-1 ${!currentProject || !projects.length ? "bg-blue-100" : "bg-white"}`}>All</button>
                        {projects.map(p => {
                            return (
                                <button key={p} className={`border-r-2 border-t-2 p-1 ${currentProject === p ? "bg-blue-100" : ""}`}>{p}</button>
                            )
                        })}
                        {filterdTodos.map((t, index) => {
                            return (
                                <div key={t.id} className="flex items-center border-b truncate focus-within:bg-blue-100 bg-white">
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
                                    <Item
                                        t={t}
                                        index={index}
                                        currentIndex={currentIndex}
                                        prefix={"project"}
                                        currentPrefix={prefix}
                                        mode={mode}
                                        label={t.project ? ` +${t.project}` : ""}
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
                            )
                        })}
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
                                            {Object.entries(t).map(([key, val]) => key === "id" || key === "text" ? <div key={`debug:${key}`}>{key}:{val}</div> : undefined)}
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
                                if (value.enable?.mode.includes(mode) && (value.enable.sort === undefined || value.enable.sort?.includes(currentSort))) {
                                    return (
                                        <div key={key} className="flex items-center gap-2">
                                            {value.keys.map(k => <kbd key={k} className="flex items-center h-[25px] px-2 py-0.5 text-xs font-semibold bg-sky-100 shadow-lg rounded-md">{dispKey(k)}</kbd>)}:{value.description}
                                        </div>
                                    )
                                }
                            })
                        }
                    </div>
                </div>
                <div className="flex gap-3 bg-black text-white">
                    <span>press:{key}</span>
                    <span>current index:{currentIndex}</span>
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
            <div onMouseDown={handleMouseDown} className={`${!(currentIndex === index && currentPrefix === prefix && mode === "edit") ? width : "w-0"}`}>
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
            <div onMouseDown={handleMouseDown} className={`focus-within:font-medium ${currentIndex === index && currentPrefix === prefix && mode === "edit" ? width : "w-0"}`}>
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