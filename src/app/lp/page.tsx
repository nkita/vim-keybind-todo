'use client'

import { useLocalStorage } from "@/hook/useLocalStrorage";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image"
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaXTwitter, FaGithub } from "react-icons/fa6";
import { Heart } from "lucide-react";

export default function Home() {
    const [isFirstVisit, setIsFirstVisit] = useLocalStorage("todo_is_first_visit", true)

    useEffect(() => {
        if (!isFirstVisit) redirect("/t")
    }, [isFirstVisit])

    return (
        <div className={`flex justify-center w-full bg-[url('https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png')] `}>
            <div className="w-full max-w-[1024px]">
                <div className={`flex justify-end items-center w-full px-8 h-[60px]`}>
                    <div className="flex items-center">
                        <span className="text-xs pr-1"> Feel free to follow me</span><Heart size={14} className="text-rose-400" />
                        <Link href={"/"} className={`flex items-center gap-1 px-3 py-2 rounded-full hover:bg-secondary transition-all fade-in-5`} ><FaXTwitter /></Link>
                        <Link href={"/"} className={`flex items-center gap-1 px-3 py-2 rounded-full hover:bg-secondary transition-all fade-in-5`} ><FaGithub /></Link>
                    </div>
                </div>
                <main className="flex flex-col items-center justify-center gap-6">
                    <header className="pt-16 sm:pt-20 w-[500px]">
                        <div className="text-center ">
                            <h1 className="text-4xl sm:text-3xl">Shiba ToDo</h1>
                            <h1 className="py-4 text-muted-foreground">
                                A lightning-fast task management system with Vim-like key bindings. Let's stop clicking around with the mouse.
                            </h1>
                        </div>
                    </header>
                    <div className="flex justify-center w-full h-[200px]">
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

                    <section className="pt-16 text-lg w-[93%]">
                        <h2 className="text-2xl font-bold text-center py-8">Shiba ToDoを選ぶ理由</h2>
                        <div className="flex justify-between py-8">
                            <div className="w-[300px] h-[300px] bg-secondary"></div>
                            <p className="p-8">
                                <span>爆速でタスクを管理する、マウスの手間を減らす。心地よい体験を感じてみませんか？</span>
                            </p>
                        </div>

                        <div className="flex justify-between py-8">
                            <p className="p-8">
                                <span>爆速でタスクを管理する、マウスの手間を減らす。心地よい体験を感じてみませんか？</span>
                            </p>
                            <div className="w-[300px] h-[300px] bg-secondary"></div>
                        </div>


                    </section>

                </main>
                <div className="flex justify-center w-full pt-36">
                    <hr className="w-[93%]" />
                </div>
                <footer className="w-full h-[100px]  p-8">
                    <div className="flex items-center gap-1">
                        <Image
                            src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`}
                            alt="Shiba Todo Logo"
                            className="w-[30px]"
                            width={500} // 実際の画像サイズを指定しますが、表示サイズはTailwindで制御
                            height={500} // 実際の画像サイズ
                        />
                        <span className="text-primary font-extrabold">Shiba ToDo</span>
                    </div>
                </footer>
            </div>
        </div>
    )
}