import { useEffect, useState, Dispatch, SetStateAction } from "react"

export const useLocalStorage = <T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>] => {

    const [value, setValue] = useState(defaultValue)

    useEffect(() => {
        const data = localStorage.getItem(key)
        if (data) {
            setValue(JSON.parse(data))
        }
    }, [key])

    const setValueAndStorage: Dispatch<SetStateAction<T>> = (v) => {
        localStorage.setItem(key, JSON.stringify(v))
        setValue(v)
    }

    return [value, setValueAndStorage]
}