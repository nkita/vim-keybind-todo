'use client'

import { useLocalStorage } from "@/hook/useLocalStrorage";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaXTwitter,FaGithub } from "react-icons/fa6";

export default function Home() {
    const [isFirstVisit, setIsFirstVisit] = useLocalStorage("todo_is_first_visit", true)

    useEffect(() => {
        if (!isFirstVisit) redirect("/t")
    }, [isFirstVisit])

    return (
        <div className={`flex justify-center w-full bg-[url('https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png')] `}>
            <div className="w-full max-w-[1280px]">
                <div className={`flex justify-end items-center w-full px-8 h-[60px]`}>
                    <div className="flex items-center">
                        <Link href={"/"} className={`flex items-center gap-1 px-3 py-2 rounded-full hover:bg-secondary transition-all fade-in-5`} >yokatt</Link>
                        <Link href={"/"} className={`flex items-center gap-1 px-3 py-2 rounded-full hover:bg-secondary transition-all fade-in-5`} ><FaXTwitter /></Link>
                        <Link href={"/"} className={`flex items-center gap-1 px-3 py-2 rounded-full hover:bg-secondary transition-all fade-in-5`} ><FaGithub/></Link>
                    </div>
                </div>
                <main className="flex flex-col items-center justify-center gap-6">
                    <header className="pt-16 sm:pt-20">
                        <div>
                            <h1 className="text-5xl sm:text-7xl">Shiba ToDo</h1>
                            <h2 className="text-xl sm:text-2xl">キーボードを爆速でタスクを管理する</h2>
                        </div>
                    </header>
                    <div className="flex justify-center w-full">
                        <div className={`absolute top-10 opacity-5 -z-50`} onMouseDown={e => e.preventDefault()}>
                            <Image
                                src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`}
                                alt="Shiba Todo Logo"
                                className="w-[400px] sm:w-[500px]"
                                width={500} // 実際の画像サイズを指定しますが、表示サイズはTailwindで制御
                                height={500} // 実際の画像サイズ
                            />
                        </div>
                        <div className="flex gap-4 flex-col sm:flex-row">
                            <Button variant={"secondary"} className="w-[180px]">ログインせずに使う</Button>
                            <Button className="w-[200px]" >ログインしてフルに使う</Button>
                        </div>
                    </div>
                </main >
            </div>

        </div>
    )
}