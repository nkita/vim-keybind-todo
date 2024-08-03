import { useEffect, useState } from "react"

export const useLocalStorage = (key: string, defaultValue: any) => {

    const [value, setValue] = useState(defaultValue)

    useEffect(() => {
        const data = localStorage.getItem(key)
        if (data) {
            setValue(JSON.parse(data))
        }
    }, [key])

    const setValueAndStorage = (v: Object) => {
        localStorage.setItem(key, JSON.stringify(v))
        setValue(v)
    }

    return [value, setValueAndStorage]
}