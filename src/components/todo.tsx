'use client'
import * as React from "react"
import { useState } from "react"
import { useHotkeys } from "react-hotkeys-hook"
export default function Todo() {
    const [pressKey, setPressKey] = useState("")
    const [mode, setMode] = useState("normal")
    const [focus, setFocus] = useState()
    const handleFocus = (e) => {
        console.log(e)
    }
    useHotkeys(['h', 'i', 'j', 'k', 'l', 'Esc', 'Tab'], (e) => {
        setPressKey(e.key)
        if (e.key === 'Escape') {
        }
        e.preventDefault()
    }, { enabled: true, enableOnContentEditable: true, enableOnFormTags: true })
    return (
        <div className="flex flex-col gap-1 w-1/4">
            <h1>Todo</h1>
            <Input onFocus={handleFocus} />
            <Input />
            <Input />
            <Input />
            <span>press:{pressKey}</span>
            <span>mode:{mode}</span>
        </div>
    )
}



export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={"border "}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }