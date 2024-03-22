'use client'
import { useState, MouseEvent, ChangeEvent, useEffect, } from "react"
import { useHotkeys, } from "react-hotkeys-hook"
import { useForm } from "react-hook-form"
interface Todo {
    id: number,
    isCompletion?: boolean
    priority?: string    // a character. A-Z Uppercase
    completionDate?: string    // format yyyy-mm-dd
    creationDate?: string    // format yyyy-mm-dd
    text: string
    project?: string    // +projctname
    context?: string    // @context    
}

export const Todo = () => {
    const [key, setKey] = useState("")
    const [todos, setTodos] = useState<Todo[]>([{ id: 0, text: 'new task1' }])
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [mode, setMode] = useState('normal')
    const [log, setLog] = useState("")
    const { register, setFocus } = useForm()
    const enabled = {
        normal: { enabled: mode === "normal", enableOnContentEditable: true, enableOnFormTags: false },
        edit: { enabled: mode === "edit", enableOnContentEditable: true, enableOnFormTags: true },
        command: { enabled: mode === "command", enableOnContentEditable: true, enableOnFormTags: true },
        always: { enabled: true, enableOnContentEditable: true, enableOnFormTags: true }
    }
    useEffect(() => {
        if (mode === 'edit') setFocus(`edit-${todos[currentIndex].id}`)
        if (mode === 'normal') setFocus(`text-${todos[currentIndex].id}`)
    }, [todos, mode, currentIndex, setFocus])
    /**
     * Normal mode
     */
    // move to up 
    useHotkeys(['k', 'ArrowUp', 'ctrl+p'], (e) => {
        e.preventDefault()
        if (0 < currentIndex) setCurrentIndex(currentIndex - 1)
    }, enabled.normal)

    // move to down
    useHotkeys(['j', 'ArrowDown', 'ctrl+n'], (e) => {
        e.preventDefault()
        if (currentIndex < todos.length - 1) setCurrentIndex(currentIndex + 1)
    }, enabled.normal)

    // insert task 
    useHotkeys(['i'], (e) => {
        e.preventDefault()
        const newId = todos.length === 0 ? 1 : Math.max(...todos.map((t: Todo) => t.id)) + 1
        setTodos([...todos.slice(0, currentIndex), { id: newId, text: "" }, ...todos.slice(currentIndex)])
        setMode('edit')
    }, enabled.normal)

    // add task to Top
    useHotkeys(['shift+i'], (e) => {
        e.preventDefault()
        const newId = todos.length === 0 ? 1 : Math.max(...todos.map((t: Todo) => t.id)) + 1
        setTodos([{ id: newId, text: "" }, ...todos])
        setCurrentIndex(0)
        setMode('edit')
    }, enabled.normal)

    // append task 
    useHotkeys(['a'], (e) => {
        e.preventDefault()
        const newId = todos.length === 0 ? 1 : Math.max(...todos.map((t: Todo) => t.id)) + 1
        setTodos([...todos.slice(0, currentIndex + 1), { id: newId, text: "" }, ...todos.slice(currentIndex + 1)])
        setCurrentIndex(currentIndex + 1)
        setMode('edit')
    }, enabled.normal)

    // append task to bottom
    useHotkeys(['shift+a'], (e) => {
        e.preventDefault()
        const newId = todos.length === 0 ? 1 : Math.max(...todos.map((t: Todo) => t.id)) + 1
        setTodos([...todos, { id: newId, text: "" }])
        setCurrentIndex(todos.length)
        setMode('edit')
    }, enabled.normal)

    // change to edit mode
    useHotkeys(['Enter'], (e) => {
        e.preventDefault()
        setMode('edit')
    }, enabled.normal)


    // change command mode
    useHotkeys(':', (e) => {
        e.preventDefault()
        setMode('command')
        setKey(e.key)
    }, enabled.normal)

    /**
     * Edit mode
     */
    // change mode to normal 
    useHotkeys(['Esc', 'Enter'], (e) => {
        e.preventDefault()
        if (!e.isComposing) setMode('normal')
    }, enabled.edit)


    /**
     * Command Mode 
     */
    useHotkeys('*', (e) => {
        e.preventDefault()
        if (!['Enter', 'Escape'].includes(e.key)) setKey(key + e.key)
    }, enabled.command)

    useHotkeys(['Enter'], (e) => {
        e.preventDefault()
        setLog(`Not found command:${key}`)
        setMode('normal')
    }, enabled.command)

    useHotkeys('Esc', (e) => {
        e.preventDefault()
        setMode('normal')
    }, enabled.command)



    const handleTodoChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target?.value
        if (val) {
            setTodos(todos.map((t, i) => {
                if (i === currentIndex) t.text = val
                return t
            }))
        }
    }



    const handleFocus = (index: number) => setCurrentIndex(index)
    const handleMainMouseDown = (e: MouseEvent<HTMLDivElement>) => e.preventDefault()
    const handleTodoMouseDown = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation(); // マウスダウンイベントの伝搬を停止
    const handleBlur = () => {
        setMode('normal')
        setFocus(`text-${todos[currentIndex].id}`)
    }
    return (
        <div className="flex flex-col w-full h-screen" id="main" onMouseDown={handleMainMouseDown}>
            <div onMouseDown={handleTodoMouseDown}>
                {todos.map((t, index) => {
                    return (
                        <div key={t.id} className="flex border">
                            <div className={`overflow-hidden focus-within:bg-blue-500  ${!(currentIndex === index && mode === "edit") ? "w-full" : "w-0"}`}>
                                <button
                                    className={`w-full text-left truncate`}
                                    onFocus={_ => handleFocus(index)}
                                    autoFocus={currentIndex === index}
                                    {...register(`text-${t.id}`)}
                                >
                                    {t.text}
                                </button>
                            </div>
                            <div className={`overflow-hidden ${currentIndex === index && mode === "edit" ? "w-full" : "w-0"}`}>
                                <input
                                    tabIndex={-1}
                                    className={`focus:bg-gray-300 truncate w-full`}
                                    type="text"
                                    placeholder="please input your task"
                                    {...register(`edit-${t.id}`, { value: t.text })}
                                    onChange={handleTodoChange}
                                    onFocus={e => e.currentTarget.setSelectionRange(t.text.length, t.text.length)}
                                    onBlur={handleBlur} />
                            </div>
                        </div>
                    )
                    // }
                })}
            </div>
            <span>press:{key}</span>
            <span>current index:{currentIndex}</span>
            <span>current mode:{mode}</span>
            <span>current log:{log}</span>
        </div >
    )
}