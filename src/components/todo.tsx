'use client'
import { useState, useRef, createRef, RefObject, useEffect, forwardRef, InputHTMLAttributes, MouseEvent, ChangeEvent, } from "react"
import { useHotkeys } from "react-hotkeys-hook"
export const Todo = () => {
    const [key, setKey] = useState("")
    const [todos, setTodos] = useState(['apple', 'banana', 'orange', 'lemon', 'grape'])
    const todosRefs = useRef<RefObject<HTMLButtonElement>[]>([])
    const todosInputRefs = useRef<RefObject<HTMLInputElement>[]>([])
    const [currentFocus, setCurrentFocus] = useState<number>(0)
    const [mode, setMode] = useState('normal')
    useEffect(() => {
        todos.forEach((_, index) => {
            todosRefs.current[index] = createRef<HTMLButtonElement>()
            todosInputRefs.current[index] = createRef<HTMLInputElement>()
        })
        return () => { }
    }, [])
    useHotkeys(['h', 'j', 'k', 'l', 'e', 'Enter', 'Esc'], (e) => {
        setKey(e.key)
        if (mode === "edit") {
            switch (e.key) {
                case 'Escape':
                    setMode('normal')
                    const _ref = todosRefs.current[currentFocus].current
                    if (_ref) _ref.focus()
                    break;
            }

        } else {
            switch (e.key) {
                case 'j':
                    if (currentFocus < todos.length - 1) {
                        setFocus(currentFocus + 1)
                    }
                    break;
                case 'k':
                    if (0 < currentFocus) {
                        setFocus(currentFocus - 1)
                    }
                    break;
                case 'e':
                    setMode('edit')
                    const _ref = todosInputRefs.current[currentFocus].current
                    if (_ref) {
                        _ref.focus()
                        const end = _ref.value.length
                        _ref.setSelectionRange(end, end)
                        // preventDeafultしておかないと、そのままinputエリアに文字が入力されてしまうため
                        e.preventDefault()
                    }
                    break;
                case 'Escape':
                    setMode('normal')
                    break;
            }
        }
    }, { enabled: true, enableOnContentEditable: true, enableOnFormTags: true })


    const handleFocus = (index: number) => setCurrentFocus(index)
    const setFocus = (index: number) => todosRefs.current[index].current?.focus()
    const handleTodoChange = (e: ChangeEvent) => {
        todosInputRefs.current[currentFocus].current?.focus()
        const val = todosInputRefs.current[currentFocus].current?.value
        if (val) {
            setTodos(todos.map((t, i) => i === currentFocus ? val : t))
        }
    }

    const handleMainMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault()
        // if (e.target ? === "main") {
        // }
    }

    const handleTodoMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation(); // マウスダウンイベントの伝搬を停止
    };
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
                                    className={`focus:bg-gray-300 truncate`}
                                    type="text" defaultValue={t} ref={todosInputRefs.current[index]} onChange={handleTodoChange} onBlur={_ => setMode('normal')} />
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

