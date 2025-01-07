'use client'

import { redirect } from "next/navigation";
import { useEffect } from "react";

export default function Home() {

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("todo_is_first_visit") || "null")
        if (data || data === null) {
            redirect("/lp")
        } else {
            redirect("/app/t")
        }
    }, [])

    return <></>
}