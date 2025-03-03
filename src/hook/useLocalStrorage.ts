import { useEffect, useState, Dispatch, SetStateAction } from "react"
import { LOCAL_STORAGE_KEY } from "@/constants"
export const useLocalStorage = <T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] => {

    const [value, setValue] = useState(defaultValue)

    useEffect(() => {
        const data = localStorage.getItem(LOCAL_STORAGE_KEY + key)
        if (data !== null && data !== "undefined") {
            setValue(JSON.parse(data))
        }
    }, [key])

    const setValueAndStorage: Dispatch<SetStateAction<T>> = (v) => {
        const valueToStore = typeof v === 'function' ? (v as Function)(value) : v;
        localStorage.setItem(LOCAL_STORAGE_KEY + key, JSON.stringify(valueToStore))
        setValue(v)
    }

    return [value, setValueAndStorage]
}