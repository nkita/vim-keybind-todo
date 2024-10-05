'use client'

import { useLocalStorage } from "@/hook/useLocalStrorage";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const [isFirstVisit, setIsFirstVisit] = useLocalStorage("todo_is_first_visit", true)

    useEffect(() => {
        if (isFirstVisit) {
            redirect("/lp")
        } else {
            redirect("/t")
        }
    }, [isFirstVisit])

    return <></>
}