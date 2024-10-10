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
                    <div className="flex items-center gap-1">
                        <span className="flex items-center text-xs"> Feel free to follow me<Heart size={14} className="text-rose-400" /></span>
                        <Link href={"/"} className={`flex items-center gap-1 px-3 py-2 rounded-full hover:bg-secondary transition-all fade-in-5`} ><FaXTwitter /></Link>
                        <Link href={"/"} className={`flex items-center gap-1 px-3 py-2 rounded-full hover:bg-secondary transition-all fade-in-5`} ><FaGithub /></Link>
                    </div>
                </div>
                <main className="flex flex-col items-center justify-center gap-6">
                    <header className="pt-16 sm:pt-20 w-[500px]">
                        <div className="text-center animate-fade ease-in animate-delay-75 ">
                            <h1 className="text-4xl sm:text-7xl">Shiba ToDo</h1>
                            <h1 className="py-4 text-muted-foreground">
                                {" A lightning-fast task management system with Vim-like key bindings. Let's stop clicking around with the mouse."}
                            </h1>
                        </div>
                    </header>
                    <div className="flex justify-center w-full h-[200px]">
                        <div className={`absolute top-10 opacity-5 -z-50`} onMouseDown={e => e.preventDefault()}>
                            <Image
                                src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`}
                                alt="Shiba Todo Logo"
                                className="w-[400px] sm:w-[500px]"
                                width={400} // 実際の画像サイズを指定しますが、表示サイズはTailwindで制御
                                height={400} // 実際の画像サイズ
                            />
                        </div>
                        <div className="flex gap-4 flex-col sm:flex-row animate-fade-up">
                            <Button variant={"secondary"} className="w-[180px] hover:border hover:border-primary transition-all">ログインせずに使う</Button>
                            <Button className="w-[200px]" >ログインしてフルに使う</Button>
                        </div>
                    </div>
                    <section className="pt-16 text-lg w-[93%]">
                        <h2 className="text-center py-8 text-4xl">Welcome 👋 Shiba ToDo</h2>
                        <div className="flex justify-center pb-8">
                            <div className="shadow-xl py-3 bg-primary/30 p-3 border border-primary/30 rounded-md">
                                <Image
                                    src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/service_image.png`}
                                    alt="Shiba Todo Image"
                                    className="w-[300px] sm:w-[800px]  rounded-md "
                                    width={1242} // 実際の画像サイズを指定しますが、表示サイズはTailwindで制御
                                    height={818} // 実際の画像サイズ
                                />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-center py-8">Shiba ToDoを選ぶ理由</h2>
                        <div className="flex justify-between py-8">
                            <div className="p-8 w-[20%]">
                                <h3 className="font-bold">その１</h3>
                                <p className="overflow-hidden">効率重視<br />ホームポジションで完結</p>
                            </div>
                            <div className="w-[80%] h-[300px] bg-secondary">
                                <Image
                                    src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/tutorial01.gif`}
                                    alt="Shiba Todo Logo"
                                    className="w-[400px] sm:w-[500px]"
                                    width={500} // 実際の画像サイズを指定しますが、表示サイズはTailwindで制御
                                    height={500} // 実際の画像サイズ
                                />
                            </div>
                        </div>

                        <div className="flex justify-between py-8">
                            <div className="w-[80%] h-[300px] bg-secondary"></div>
                            <div className="p-8 w-[20%]">
                                <h3 className="font-bold">その2</h3>
                                <p className="overflow-hidden">シンプルだからTodoだけに集中</p>
                            </div>
                        </div>

                        <div className="flex justify-between py-8">
                            <div className="p-8 w-[20%]">
                                <h3 className="font-bold">その3</h3>
                                <p className="overflow-hidden">保存先はローカルでもクラウドでも無料で使い続けます</p>
                            </div>
                            <div className="w-[80%] h-[300px] bg-secondary"></div>
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