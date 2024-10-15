'use client'

import { useLocalStorage } from "@/hook/useLocalStrorage";
import { redirect, useRouter } from "next/navigation";
import Image from "next/image"
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { FaXTwitter, FaGithub } from "react-icons/fa6";
import { Heart } from "lucide-react";
import { useAuth0 } from "@auth0/auth0-react";

export default function Home() {
    const { loginWithRedirect, user, isLoading } = useAuth0();
    const [_, setIsFirstVisit] = useLocalStorage<undefined | boolean>("todo_is_first_visit", undefined)

    const router = useRouter()
    const handleonClick = (isLogin?: boolean) => {
        setIsFirstVisit(false)
        isLogin ? loginWithRedirect() : redirectTodo()
    }
    const redirectTodo = () => { router.push("/t") }
    return (
        <div className={`flex justify-center w-full bg-[url('https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png')] `}>
            <div className="w-full max-w-[1024px]">
                <header className={`flex justify-end items-center w-full px-8 h-[60px]`}>
                    <nav className="flex items-center gap-1">
                        <span className="flex items-center text-xs"> Feel free to follow me<Heart size={14} className="text-rose-400" /></span>
                        <Link target="_blank" href={"https://x.com/nkitao7"} className={`flex items-center gap-1 px-3 py-2 rounded-full hover:bg-secondary transition-all fade-in-5`} ><FaXTwitter /></Link>
                        <Link target="_blank" href={"https://github.com/nkita"} className={`flex items-center gap-1 px-3 py-2 rounded-full hover:bg-secondary transition-all fade-in-5`} ><FaGithub /></Link>
                    </nav>
                </header>
                <main className="flex flex-col items-center justify-center gap-6">
                    <section className="pt-16 w-[390px] sm:pt-20 sm:w-[550px]">
                        <div className="text-center animate-fade ease-in animate-delay-75 ">
                            <h1 className="text-4xl sm:text-7xl">Shiba ToDo</h1>
                            <h1 className="pt-16 py-4 text-muted-foreground">
                                {"Shiba Todoはキーボードファーストな最短でシンプルなタスク管理サービスです。ホームポジションから動かずにタスクの作成から完了まで最短であなたをサポートします。"}
                            </h1>
                        </div>
                    </section>
                    <section className="flex justify-center w-full h-[100px] sm:h-[150px]">
                        <div className={`absolute top-10 opacity-5 -z-50`} onMouseDown={e => e.preventDefault()}>
                            <Image
                                src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`}
                                alt="Shiba Todo Logo"
                                className="w-[400px] sm:w-[500px]"
                                width={400} // 実際の画像サイズを指定しますが、表示サイズはTailwindで制御
                                height={400} // 実際の画像サイズ
                            />
                        </div>
                        <p className={`flex gap-4 ${isLoading ? "hidden" : ""} animate-fade-up sm:block hidden`}>
                            {user ? (
                                <>
                                    <Button disabled={isLoading} className="w-[200px]" onClick={_ => redirectTodo()}>はじめる</Button>
                                </>
                            ) : (
                                <>
                                    <Button disabled={isLoading} variant={"secondary"} onClick={_ => handleonClick()} className="w-[280px] m-3 hover:border hover:border-primary transition-all">ログインせずに使う</Button>
                                    <Button disabled={isLoading} className="w-[280px] m-3" onClick={_ => handleonClick(true)} >ログインしてフルに使う</Button>
                                </>
                            )}
                        </p>
                    </section>
                    <section className="flex justify-center w-full">
                        <p className={`flex gap-4 flex-col sm:flex-row  ${isLoading ? "hidden" : "visible"} items-center animate-fade-up sm:hidden block w-[80%]`}>
                            {user ? (
                                <>
                                    <Button disabled={isLoading} className="" onClick={_ => redirectTodo()}>はじめる</Button>
                                </>
                            ) : (
                                <>
                                    <Button disabled={isLoading} variant={"secondary"} onClick={_ => handleonClick()} className="w-full hover:border hover:border-primary transition-all">ログインせずに使う</Button>
                                    <Button disabled={isLoading} onClick={_ => handleonClick(true)} className="w-full">ログインしてフルに使う</Button>
                                </>
                            )}
                        </p>
                    </section>
                    <article className="flex flex-col gap-6 pt-16 text-lg w-[93%] items-center">
                        <section className="flex flex-col items-center pb-8">
                            <h2 className="text-center py-8 text-4xl ">Welcome <span className="animate-wiggle-more animate-infinite animate-ease-in inline-block">👋</span> Shiba ToDo</h2>
                            <div className="shadow-xl py-3 bg-primary/30 p-3 border border-primary/30 rounded-md">
                                <Image
                                    src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/service_image.png`}
                                    alt="Shiba Todo Image"
                                    className="w-[300px] sm:w-[800px] rounded-md"
                                    width={1242} // 実際の画像サイズを指定しますが、表示サイズはTailwindで制御
                                    height={818} // 実際の画像サイズ
                                />
                            </div>
                        </section>
                        <section className="flex flex-col content-center w-[80%] ">
                            <h2 className="text-2xl font-bold text-center pb-8 pt-16">Shiba ToDoって何？</h2>
                            <p className="text-center ">
                                {"タスク管理ツール"}<br />
                                {"いわゆるToDoアプリのようなタスク管理ツールをWebサービスとして提供します。"}<br />
                                {"他アプリとの差異は、よりタスク管理に集中してもらうためシンプルで最短で管理できるようUIに工夫をこらしています。"}
                            </p>
                        </section>
                        {/* <section className="flex flex-col w-[80%] ">
                            <h2 className="text-2xl font-bold text-center pb-8 pt-16">Shiba ToDoを選ぶ理由</h2>
                            <section className="flex flex-col gap-32">
                                <div className="flex justify-between">
                                    <div className="p-8">
                                        <h3 className="font-bold">その１</h3>
                                        <p className="overflow-hidden">効率重視<br />ホームポジションで完結</p>
                                    </div>
                                    <div className="w-[70%] h-[300px] bg-secondary">
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="w-[30%] h-[300px] bg-secondary"></div>
                                    <div className="p-8 w-[80%]">
                                        <h3 className="font-bold">その2</h3>
                                        <p className="overflow-hidden">シンプルだから<br />タスクだけに集中</p>
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <div className="p-8 w-[80%]">
                                        <h3 className="font-bold">その3</h3>
                                        <p className="overflow-hidden">効率性向上を支援する<br />豊富なショートカット<br /><span className="text-sm text-secondary-foreground"> ※今後も増加する予定</span></p>
                                    </div>
                                    <div className="w-[20%] h-[300px] bg-secondary"></div>
                                </div>
                            </section>
                        </section> */}
                    </article>
                </main>
                <div className="flex justify-center w-full pt-36">
                    <hr className="w-[93%]" />
                </div>
                <footer className="flex flex-col-reverse gap-3 sm:flex-row justify-between items-start w-full h-[100px]  p-8">
                    <div className="flex items-center gap-1 ">
                        <Image
                            src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`}
                            alt="Shiba Todo Logo"
                            className="w-[30px]"
                            width={500} // 実際の画像サイズを指定しますが、表示サイズはTailwindで制御
                            height={500} // 実際の画像サイズ
                        />
                        <span className="text-sm">Copyright©2024 Shiba Tools</span>
                    </div>
                    <div className="flex flex-wrap justify-start sm:justify-end gap-3 py-8">
                        <ExLink href="/" >利用規約</ExLink>
                        <ExLink href="/" >プライバシーポリシー</ExLink>
                        <ExLink href="/" >お問い合わせ </ExLink>
                    </div>
                </footer>
            </div >
        </div >
    )
}

const ExLink = ({ href, target, children, ...props }: { href: string, target?: string, children: React.ReactNode }) => {
    return (
        <Link href={href} target={target} className={`text-sm text-primary hover:underline hover:cursor-pointer transition-all`} {...props} >
            {children}
        </Link >
    )
}