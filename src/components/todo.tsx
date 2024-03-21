'use client'
import { useState, MouseEvent, ChangeEvent, } from "react"
import { useHotkeys, } from "react-hotkeys-hook"
import { useForm } from "react-hook-form"
export const Todo = () => {
    const [key, setKey] = useState("")
    const [todos, setTodos] = useState(['apple', 'banana', 'orange', 'lemon', 'grape'])
    const [currentFocus, setCurrentFocus] = useState<number>(0)
    const [mode, setMode] = useState('normal')
    const [log, setLog] = useState("")
    const { register, setFocus } = useForm()
    const enabled = {
        normal: { enabled: mode === "normal", enableOnContentEditable: true, enableOnFormTags: false },
        edit: { enabled: mode === "edit", enableOnContentEditable: true, enableOnFormTags: true },
        command: { enabled: mode === "command", enableOnContentEditable: true, enableOnFormTags: true },
        always: { enabled: true, enableOnContentEditable: true, enableOnFormTags: true }
    }
    /**
     * Normal mode
     */
    // move to up 
    useHotkeys(['k', 'ArrowUp', 'ctrl+p'], (e) => {
        e.preventDefault()
        setKey(e.key)
        if (mode !== "edit" && 0 < currentFocus) setFocus(`text-${currentFocus - 1}`)
    }, enabled.normal)

    // move to down
    useHotkeys(['j', 'ArrowDown', 'ctrl+n'], (e) => {
        e.preventDefault()
        setKey(e.key)
        if (mode !== "edit" && currentFocus < todos.length - 1) setFocus(`text-${currentFocus + 1}`)
        e.preventDefault()
    }, enabled.normal)

    // change mode to edit
    useHotkeys(['Enter'], (e) => {
        e.preventDefault()
        setMode('edit')
        setFocus(`edit-${currentFocus}`, { shouldSelect: true })
        // preventDeafultしておかないと、そのままinputエリアに文字が入力されてしまうため
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
        setFocus(`text-${currentFocus}`)
        setMode('normal')
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
            setTodos(todos.map((t, i) => i === currentFocus ? val : t))
        }
    }

    const handleFocus = (index: number) => setCurrentFocus(index)
    const handleMainMouseDown = (e: MouseEvent<HTMLDivElement>) => e.preventDefault()
    const handleTodoMouseDown = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation(); // マウスダウンイベントの伝搬を停止
    const handleBlur = () => {
        setMode('normal')
        setFocus(`text-${currentFocus}`)
    }
    return (
        <div className="flex flex-col w-full h-screen" id="main" onMouseDown={handleMainMouseDown}>
            <div onMouseDown={handleTodoMouseDown}>
                {todos.map((t, index) => {
                    return (
                        <div key={`${index}`} className="flex border">
                            <div className={`overflow-hidden  ${!(currentFocus === index && mode === "edit") ? "w-full" : "w-0"}`}>
                                <button
                                    className={`focus:bg-blue-500 w-full text-left truncate`}
                                    onFocus={_ => handleFocus(index)}
                                    autoFocus={currentFocus === index}
                                    {...register(`text-${index}`)}
                                >
                                    {t}
                                </button>
                            </div>
                            <div className={`overflow-hidden ${currentFocus === index && mode === "edit" ? "w-full" : "w-0"}`}>
                                <input
                                    tabIndex={-1}
                                    className={`focus:bg-gray-300 truncate w-full`}
                                    type="text" defaultValue={t}
                                    {...register(`edit-${index}`)}
                                    onChange={handleTodoChange}
                                    onBlur={handleBlur} />
                            </div>
                        </div>
                    )
                    // }
                })}
            </div>
            <span>press:{key}</span>
            <span>current index:{currentFocus}</span>
            <span>current mode:{mode}</span>
            <span>current log:{log}</span>
        </div >
    )
}