'use client'
import { useState, useRef, createRef, RefObject, useEffect, forwardRef, InputHTMLAttributes, MouseEvent, ChangeEvent, } from "react"
import { useHotkeys, useRecordHotkeys } from "react-hotkeys-hook"
export const Todo = () => {
    const [key, setKey] = useState("")
    const [todos, setTodos] = useState(['apple', 'banana', 'orange', 'lemon', 'grape'])
    const todosRefs = useRef<RefObject<HTMLButtonElement>[]>([])
    const todosInputRefs = useRef<RefObject<HTMLInputElement>[]>([])
    const [currentFocus, setCurrentFocus] = useState<number>(0)
    const [mode, setMode] = useState('normal')
    const [keys, { start, stop, isRecording }] = useRecordHotkeys()

    useEffect(() => {
        todos.forEach((_, index) => {
            todosRefs.current[index] = createRef<HTMLButtonElement>()
            todosInputRefs.current[index] = createRef<HTMLInputElement>()
        })
        return () => { }
    }, [todos])
    const enabled = {
        normal: { enabled: mode === "normal", enableOnContentEditable: true, enableOnFormTags: false },
        edit: { enabled: mode === "edit", enableOnContentEditable: true, enableOnFormTags: true },
        always: { enabled: true, enableOnContentEditable: true, enableOnFormTags: true }
    }
    /**
     * Normal mode
     */
    // check press key name
    useHotkeys('*', (e) => {
        setKey(e.key)
    }, enabled.always)

    // move to up 
    useHotkeys(['k', 'ArrowUp'], (e) => {
        setKey(e.key)
        if (mode !== "edit" && 0 < currentFocus) setFocus(currentFocus - 1)
    }, enabled.normal)

    // move to down
    useHotkeys(['j', 'ArrowDown'], (e) => {
        setKey(e.key)
        if (mode !== "edit" && currentFocus < todos.length - 1) setFocus(currentFocus + 1)
    }, enabled.normal)

    // change mode to edit
    useHotkeys(['e', 'Enter'], (e) => {
        setKey(e.key)
        setMode('edit')
        const _ref = todosInputRefs.current[currentFocus].current
        if (_ref) {
            _ref.focus()
            const end = _ref.value.length
            _ref.setSelectionRange(end, end)
            // preventDeafultしておかないと、そのままinputエリアに文字が入力されてしまうため
            e.preventDefault()
        }
    }, enabled.normal)

    // Insert a task  
    useHotkeys(['i'], (e) => {
        setKey(e.key)
    }, enabled.normal)

    // Insert a task to Top
    useHotkeys(['shift+i'], (e) => {
        setKey(e.key)
        alert("shift+i")
    }, enabled.normal)

    /**
     * Edit mode
     */
    // change mode to normal 
    useHotkeys(['Esc'], (e) => {
        setKey(e.key)
        setMode('normal')
        const _ref = todosRefs.current[currentFocus].current
        if (_ref) _ref.focus()
    }, enabled.edit)


    const handleTodoChange = (e: ChangeEvent) => {
        todosInputRefs.current[currentFocus].current?.focus()
        const val = todosInputRefs.current[currentFocus].current?.value
        if (val) {
            setTodos(todos.map((t, i) => i === currentFocus ? val : t))
        }
    }

    const handleFocus = (index: number) => setCurrentFocus(index)
    const setFocus = (index: number) => todosRefs.current[index].current?.focus()
    const handleMainMouseDown = (e: MouseEvent<HTMLDivElement>) => e.preventDefault()
    const handleTodoMouseDown = (e: MouseEvent<HTMLDivElement>) => e.stopPropagation(); // マウスダウンイベントの伝搬を停止
    const handleBlur = () => {
        setMode('normal')
        setFocus(currentFocus)
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
                                    ref={todosRefs.current[index]}
                                    onFocus={_ => handleFocus(index)}
                                    autoFocus={currentFocus === index}
                                >
                                    {t}
                                </button>
                            </div>
                            <div className={`overflow-hidden ${currentFocus === index && mode === "edit" ? "w-full" : "w-0"}`}>
                                <input
                                    tabIndex={-1}
                                    className={`focus:bg-gray-300 truncate w-full`}
                                    type="text" defaultValue={t} ref={todosInputRefs.current[index]} onChange={handleTodoChange} onBlur={handleBlur} />
                            </div>
                        </div>
                    )
                    // }
                })}
            </div>
            <span>press:{key}</span>
            <span>current index:{currentFocus}</span>
            <span>current mode:{mode}</span>
        </div >
    )
}



export interface InputProps
    extends InputHTMLAttributes<HTMLInputElement> { }
const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={className}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

