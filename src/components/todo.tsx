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
    const [todos, setTodos] = useState<TodoProps[]>([{ id: 0, text: 'new task1' }])
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    const [mode, setMode] = useState('normal')
    const [log, setLog] = useState("")
    const { register, setFocus, getValues } = useForm()
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
    /*******************
     * 
     * Normal mode
     * 
     *******************/
    // move to up 
    useHotkeys(keymap['up'].keys, (e) => {
        e.preventDefault()
        if (0 < currentIndex) setCurrentIndex(currentIndex - 1)
    }, enabled[keymap['up'].mode])

    // move to down
    useHotkeys(keymap['down'].keys, (e) => {
        e.preventDefault()
        if (currentIndex < todos.length - 1) setCurrentIndex(currentIndex + 1)
    }, enabled[keymap['down'].mode])

    // insert task 
    useHotkeys(keymap['insert'].keys, (e) => {
        e.preventDefault()
        setTodos(todoFunc.add(currentIndex, todos))
        setMode('edit')
    }, enabled[keymap['insert'].mode])

    // add task to Top
    useHotkeys(keymap['insertTop'].keys, (e) => {
        e.preventDefault()
        setTodos(todoFunc.add(0, todos))
        setCurrentIndex(0)
        setMode('edit')
    }, enabled[keymap['insertTop'].mode])

    // append task 
    useHotkeys(keymap['append'].keys, (e) => {
        e.preventDefault()
        setTodos(todoFunc.add(currentIndex + 1, todos))
        setCurrentIndex(currentIndex + 1)
        setMode('edit')
    }, enabled[keymap['append'].mode])

    // append task to bottom
    useHotkeys(keymap['appendBottom'].keys, (e) => {
        e.preventDefault()
        setTodos(todoFunc.add(todos.length, todos))
        setCurrentIndex(todos.length)
        setMode('edit')
    }, enabled[keymap['appendBottom'].mode])

    // change to edit mode
    useHotkeys(keymap['editMode'].keys, (e) => {
        e.preventDefault()
        setMode('edit')
    }, enabled[keymap['editMode'].mode])

    // change to edit mode
    useHotkeys(keymap['completion'].keys, (e) => {
        e.preventDefault()
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
        e.preventDefault()
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
        e.preventDefault()
        if (!e.isComposing) {
            const replace = {
                id: todos[currentIndex].id,
                isCompletion: todos[currentIndex].isCompletion,
                priority: todos[currentIndex].priority,
                completionDate: todos[currentIndex].completionDate,
                creationDate: todos[currentIndex].creationDate,
                text: getValues(`edit-${todos[currentIndex].id}`),
                project: todos[currentIndex].project,
                context: todos[currentIndex].context
            }
            if (todoFunc.isEmpty(replace)) {
                setTodos(todoFunc.delete(todos, todos[currentIndex].id))
                setCurrentIndex(currentIndex === 0 ? 0 : currentIndex - 1)
            } else {
                setTodos(todoFunc.modify(todos, replace))
            }
            setMode('normal')
        }
    }, enabled[keymap['normalMode'].mode])

    /*******************
     * 
     * Command mode
     * 
     *******************/
    useHotkeys('*', (e) => {
        e.preventDefault()
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
                        {todos.map((t, index) => {
                            return (
                                <div key={t.id} className="flex border-b truncate">
                                    <div className={`overflow-hidden focus-within:bg-blue-50  ${!(currentIndex === index && mode === "edit") ? "w-full" : "w-0"}`}>
                                        <div className={`flex gap-1`}>
                                            <span className="w-[15px] px-1 h-[15px]">{t.isCompletion ? "x" : ""}</span>
                                            <button
                                                className={`w-full text-left truncate outline-none`}
                                                onFocus={_ => handleFocus(index)}
                                                autoFocus={currentIndex === index}
                                                {...register(`text-${t.id}`)}
                                            >
                                                <span className={`${t.isCompletion ? "line-through text-gray-600" : ""}`}>
                                                    {t.text}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className={`overflow-hidden focus-within:bg-gray-100 focus-within:font-medium ${currentIndex === index && mode === "edit" ? "w-full" : "w-0"}`}>
                                        <div className="flex gap-1">
                                            <span className="w-[15px] px-1 h-[15px]">{t.isCompletion ? "x" : ""}</span>
                                            <input
                                                tabIndex={-1}
                                                className={`outline-none bg-gray-100 truncate w-full ${t.isCompletion ? "line-through" : ""}`}
                                                type="text"
                                                placeholder="please input your task"
                                                {...register(`edit-${t.id}`, { value: t.text })}
                                                // onChange={handleTodoChange}
                                                onFocus={e => e.currentTarget.setSelectionRange(t.text.length, t.text.length)}
                                                onBlur={handleBlur} />
                                        </div>
                                    </div>
                                </div>
                            )
                            // }
                        })}
                    </div>
                    <div className="border bg-gray-200 w-1/4 h-full break-words">
                        <div className="border rounded-md">
                            <ul>
                                {/* <li>id: {todos[currentIndex].id}</li> */}
                                {/* <li>isCompletion: {todos[currentIndex].isCompletion ? "完了" : "未完了"}</li> */}
                                <li>priority: {todos[currentIndex].priority}</li>
                                <li>completionDate: {todos[currentIndex].completionDate}</li>
                                <li>creationDate: {todos[currentIndex].creationDate}</li>
                                <li>text: {todos[currentIndex].text}</li>
                                <li>project: {todos[currentIndex].project}</li>
                                <li>context: {todos[currentIndex].context}</li>
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