'use client'
import { useState, MouseEvent, ChangeEvent, useEffect, } from "react"
import { useHotkeys, } from "react-hotkeys-hook"
import { useForm } from "react-hook-form"
import { keymap } from './config'
import { dispKey } from "@/libs/dispkeyname"
import { TodoProps } from "@/types"
import { todoFunc } from "@/libs/todo"
import { yyyymmddhhmmss } from "@/libs/time"
export const Todo = () => {
    const [key, setKey] = useState("")
    const [todos, setTodos] = useState<TodoProps[]>([
        { id: 0, text: '家に帰って電話する', priority: 'A', project: "private", context: "family" },
        { id: 1, text: 'プロジェクトAの締め切り日に対してメールする', priority: 'b', project: "job", context: "family" },
        { id: 2, text: '締切日までに作品仕上げる', priority: 'c', project: "hobby", },
        { id: 3, text: '材料を買う', project: "hobby" }
    ])
    const [projects, setProjects] = useState<string[]>([])
    const [currentProject, setCurrentProject] = useState("")
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [mode, setMode] = useState('normal')
    const [prefix, setPrefix] = useState('text')
    const [log, setLog] = useState("")
    const { register, setFocus, getValues } = useForm()
    const enabled = {
        normal: { enabled: mode === "normal", enableOnContentEditable: true, enableOnFormTags: false, ignoreModifiers: true, preventDefault: true },
        edit: { enabled: mode === "edit", enableOnContentEditable: true, enableOnFormTags: true, ignoreModifiers: true, preventDefault: true },
        command: { enabled: mode === "command", enableOnContentEditable: true, enableOnFormTags: true, ignoreModifiers: true, preventDefault: true },
        always: { enabled: true, enableOnContentEditable: true, enableOnFormTags: true, preventDefault: true }
    }
    useEffect(() => {
        if (mode === 'edit') setFocus(`edit-${prefix}-${todos[currentIndex].id}`, { shouldSelect: true })
        if (mode === 'normal') setFocus(`${prefix}-${todos[currentIndex].id}`)
    }, [todos, mode, prefix, currentIndex, setFocus])

    useEffect(() => {
        const filteredProjects = todos.map(t => t.project).filter(p => p !== undefined && p !== "") as string[];
        setProjects(Array.from(new Set(filteredProjects)));
        console.log(todos)
    }, [todos])
    /*******************
     * 
     * Normal mode
     * 
     *******************/
    // move to up 
    useHotkeys(keymap['up'].keys, (e) => {
        if (0 < currentIndex) setCurrentIndex(currentIndex - 1)
    }, enabled[keymap['up'].mode])

    // move to down
    useHotkeys(keymap['down'].keys, (e) => {
        if (currentIndex < todos.length - 1) setCurrentIndex(currentIndex + 1)
    }, enabled[keymap['down'].mode])

    // insert task 
    useHotkeys(keymap['insert'].keys, (e) => {
        setTodos(todoFunc.add(currentIndex, todos, { project: currentProject }))
        setMode('edit')
    }, enabled[keymap['insert'].mode])

    // add task to Top
    useHotkeys(keymap['insertTop'].keys, (e) => {
        setTodos(todoFunc.add(0, todos, { project: currentProject }))
        setCurrentIndex(0)
        setMode('edit')
    }, enabled[keymap['insertTop'].mode])

    // append task 
    useHotkeys(keymap['append'].keys, (e) => {
        setTodos(todoFunc.add(currentIndex + 1, todos, { project: currentProject }))
        setCurrentIndex(currentIndex + 1)
        setMode('edit')
    }, enabled[keymap['append'].mode])

    // append task to bottom
    useHotkeys(keymap['appendBottom'].keys, (e) => {
        setTodos(todoFunc.add(todos.length, todos, { project: currentProject }))
        setCurrentIndex(todos.length)
        setMode('edit')
    }, enabled[keymap['appendBottom'].mode])

    // change to edit mode
    useHotkeys(keymap['editTextMode'].keys, (e) => {
        setMode('edit')
    }, enabled[keymap['editTextMode'].mode])

    // change to priority edit mode
    useHotkeys(keymap['editPriorityMode'].keys, (e) => {
        setPrefix('priority')
        setMode('edit')
    }, enabled[keymap['editPriorityMode'].mode])

    // change to project edit mode
    useHotkeys(keymap['editProjectMode'].keys, (e) => {
        setPrefix('project')
        setMode('edit')
    }, enabled[keymap['editProjectMode'].mode])

    // change to context edit mode
    useHotkeys(keymap['editContextMode'].keys, (e) => {
        setPrefix('context')
        setMode('edit')
    }, enabled[keymap['editContextMode'].mode])

    // move to right project
    useHotkeys(keymap['moveProjectRight'].keys, (e) => {
        if (projects.length > 0) {
            if (!currentProject) {
                setCurrentProject(projects[0])
            } else {
                const _index = projects.indexOf(currentProject)
                if (_index < projects.length - 1) {
                    setCurrentProject(projects[_index + 1])
                }
            }
        }
    }, enabled[keymap['moveProjectRight'].mode])

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
            }
        }
    }, enabled[keymap['moveProjectLeft'].mode])

    // change to edit mode
    useHotkeys(keymap['completion'].keys, (e) => {
        setTodos(todoFunc.modify(todos, {
            id: todos[currentIndex].id,
            isCompletion: !todos[currentIndex].isCompletion,
            priority: todos[currentIndex].priority,
            completionDate: !todos[currentIndex].isCompletion ? yyyymmddhhmmss(new Date()) : "",
            creationDate: todos[currentIndex].creationDate,
            text: todos[currentIndex].text,
            project: todos[currentIndex].project,
            context: todos[currentIndex].context
        }))
    }, enabled[keymap['completion'].mode])

    // change command mode
    useHotkeys(':', (e) => {
        setMode('command')
        setKey(e.key)
    }, enabled.normal)

    /*******************
     * 
     * Edit mode
     * 
     *******************/
    // change to normal mode
    useHotkeys(keymap['normalMode'].keys, (e) => {
        if (!e.isComposing) {
            const replace = {
                id: todos[currentIndex].id,
                isCompletion: todos[currentIndex].isCompletion,
                priority: getValues(`edit-priority-${todos[currentIndex].id}`).toUpperCase(),
                completionDate: todos[currentIndex].completionDate,
                creationDate: todos[currentIndex].creationDate,
                text: getValues(`edit-text-${todos[currentIndex].id}`),
                project: getValues(`edit-project-${todos[currentIndex].id}`),
                context: getValues(`edit-context-${todos[currentIndex].id}`)
            }
            if (todoFunc.isEmpty(replace)) {
                setTodos(todoFunc.delete(todos, todos[currentIndex].id))
                setCurrentIndex(currentIndex === 0 ? 0 : currentIndex - 1)
            } else {
                setTodos(todoFunc.modify(todos, replace))
            }
            setPrefix('text')
            setMode('normal')
        }
    }, enabled[keymap['normalMode'].mode])

    /*******************
     * 
     * Command mode
     * 
     *******************/
    useHotkeys('*', (e) => {
        if (!['Enter', 'Escape', 'Backspace'].includes(e.key)) setKey(key + e.key)
    }, enabled.command)

    useHotkeys(['Enter'], (e) => {
        e.preventDefault()
        setLog(`Not found command:${key}`)
        setMode('normal')
        setKey("")
    }, enabled.command)

    useHotkeys('Esc', (e) => {
        e.preventDefault()
        setMode('normal')
        setPrefix('text')
        setKey("")
    }, enabled.command)


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
    // const handleMainMouseDown = (e: MouseEvent<HTMLDivElement>) => e.preventDefault()
    const handleMainMouseDown = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation()
    const handleTodoMouseDown = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation(); // マウスダウンイベントの伝搬を停止
    const handleBlur = () => {
        setMode('normal')
        setFocus(`text-${todos[currentIndex].id}`)
    }
    return (
        <div className="flex flex-col h-screen justify-between text-sm" id="main" onMouseDown={handleMainMouseDown}>
            <div className="flex flex-col ">
                <div className="flex justify-between">
                    <div onMouseDown={handleTodoMouseDown} className="w-3/4 overflow-auto">
                        <button className={`border-r-2 border-t-2 p-1 ${!currentProject || !projects.length ? "bg-blue-100" : ""}`}>All</button>
                        {projects.map(p => {
                            return (
                                <button key={p} className={`border-r-2 border-t-2 p-1 ${currentProject === p ? "bg-blue-100" : ""}`}>{p}</button>
                            )
                        })}
                        {todos.filter(t => !currentProject ? true : t.project === currentProject).map((t, index) => {
                            return (
                                <div key={t.id} className="flex items-center border-b truncate focus-within:bg-blue-100">
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
                                        handleBlur={handleBlur}
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
                                        handleBlur={handleBlur}
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
                                        handleBlur={handleBlur}
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
                                        handleBlur={handleBlur}
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
                                <li>priority(A&gt;Z):{todos[currentIndex].priority}</li>
                                <li>completionDate: {todos[currentIndex].completionDate}</li>
                                <li>creationDate: {todos[currentIndex].creationDate}</li>
                                <li>text: {todos[currentIndex].text}</li>
                                <li>+project: {todos[currentIndex].project}</li>
                                <li>@context: {todos[currentIndex].context}</li>
                            </ul>
                        </div>
                        <div>
                            new are
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
                                if (value.mode === mode) {
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
        handleBlur,
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
        handleBlur: () => void
        register: any
    }
) => {
    return (
        <>
            <div className={`${!(currentIndex === index && currentPrefix === prefix && mode === "edit") ? width : "w-0"}`}>
                <button
                    className={`w-full text-left truncate outline-none`}
                    onFocus={_ => handleFocus(index)}
                    autoFocus={currentIndex === index}
                    {...register(`${prefix}-${t.id}`)}
                >
                    <span className={`${t.isCompletion ? "line-through text-gray-600" : ""}`}>
                        {label}
                    </span>
                </button>
            </div>
            <div className={`focus-within:font-medium ${currentIndex === index && currentPrefix === prefix && mode === "edit" ? width : "w-0"}`}>
                <input
                    tabIndex={-1}
                    className={`w-full text-left truncate outline-none bg-transparent focus:bg-gray-100`}
                    type="text"
                    maxLength={prefix === 'priority' ? 1 : -1}
                    {...register(`edit-${prefix}-${t.id}`, { value: t[prefix] })}
                    // onFocus={e => e.currentTarget.setSelectionRange(t[prefix].length, t.text.length)}
                    onBlur={handleBlur} />
            </div >
        </>
    )
}