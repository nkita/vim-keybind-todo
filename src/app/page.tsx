'use client'

import { useLocalStorage } from "@/hook/useLocalStrorage";
import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const [isFirstVisit, _] = useLocalStorage("todo_is_first_visit", undefined)

    useEffect(() => {
        console.log(isFirstVisit)
        if (isFirstVisit === undefined) return
        if (isFirstVisit) {
            redirect("/lp")
        } else {
            redirect("/t")
        }
    }, [isFirstVisit])

    return <></>
}