'use client'

import { useLocalStorage } from "@/hook/useLocalStrorage";
import { useRouter } from "next/navigation";
import Image from "next/image"
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import NormalPageTemplate from "@/components/normal-page-template";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
    const { loginWithRedirect, user, isLoading } = useAuth0();
    const [_, setIsFirstVisit] = useLocalStorage<undefined | boolean>("todo_is_first_visit", undefined)

    const router = useRouter()
    const handleonClick = (isLogin?: boolean) => {
        setIsFirstVisit(false)
        isLogin ? loginWithRedirect() : redirectTodo()
    }
    const redirectTodo = () => {
        setIsFirstVisit(false)
        router.push("/t")
    }
    return (
        <NormalPageTemplate>
            <main className="flex flex-col items-center justify-center gap-6">
                <section className="pt-16  sm:pt-20 md:w-[680px] sm:w-[580px] w-[450px]">
                    <div className="text-center animate-fade ease-in animate-delay-75 ">
                        <h1 className="md:text-6xl sm:text-5xl text-4xl py-6">
                            ホームポジションで完結<br />
                            最速のタスク管理
                        </h1>
                        <p className="py-8 text-muted-foreground">
                            {"Shiba Todoはキーボードファーストな最短でシンプルなタスク管理サービスです。ホームポジションから動かずにタスクの作成から完了まで最短であなたをサポートします。"}
                        </p>
                    </div>
                </section>
                <section className="flex justify-center w-full ">
                    <div className={`absolute top-10 opacity-5 -z-50`} onMouseDown={e => e.preventDefault()}>
                        <Image
                            src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`}
                            alt="Shiba Todo Logo"
                            className="w-[400px] sm:w-[500px]"
                            width={400} // 実際の画像サイズを指定しますが、表示サイズはTailwindで制御
                            height={400} // 実際の画像サイズ
                        />
                    </div>
                    <div className={`flex justify-center w-full ${isLoading ? "block" : "hidden"}`}>
                        <Skeleton className={`w-[80%] sm:w-[280px] h-10 rounded-full bg-primary/30`} />
                    </div>
                    <p className={`flex gap-4 ${isLoading ? "hidden" : "hidden sm:block"} animate-fade-up `}>
                        {user ? (
                            <>
                                <Button disabled={isLoading} className="w-[280px]" onClick={_ => redirectTodo()}>はじめる</Button>
                            </>
                        ) : (
                            <>
                                <Button disabled={isLoading} variant={"secondary"} onClick={_ => handleonClick()} className="w-[240px] m-3 hover:border hover:border-primary transition-all">ログインせずに使う</Button>
                                <Button disabled={isLoading} className="w-[240px] m-3" onClick={_ => handleonClick(true)} >ログインしてフルに使う</Button>
                            </>
                        )}
                    </p>
                </section>
                <section className="flex justify-center w-full">
                    <p className={`flex gap-4 flex-col sm:flex-row  ${isLoading ? "hidden" : "sm:hidden block"} items-center animate-fade-up  w-[80%]`}>
                        {user ? (
                            <>
                                <Button disabled={isLoading} className="w-[80%]" onClick={_ => redirectTodo()}>はじめる</Button>
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
                    <section className="content-center px-8">
                        <h2 className="text-2xl font-bold text-left pb-8 pt-16">Shiba ToDoって何？</h2>
                        <p className="text-left ">
                            {"タスク管理ツールです。"}<br />
                            {"いわゆるToDoアプリのようなタスク管理ツールをWebサービスとして提供します。"}<br />
                            {"他アプリとの差異は、よりタスク管理に集中してもらうためシンプルで最短で管理できるようUIに工夫をこらしています。"}
                        </p>
                    </section>
                </article>
            </main >
        </NormalPageTemplate >
    )
}