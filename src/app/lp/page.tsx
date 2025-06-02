'use client'

import { useLocalStorage } from "@/hook/useLocalStrorage";
import { useRouter } from "next/navigation";
import Image from "next/image"
import { Button } from "@/components/ui/button";
import { useAuth0 } from "@auth0/auth0-react";
import NormalPageTemplate from "@/components/normal-page-template";
import { Skeleton } from "@/components/ui/skeleton";
import useSWRImmutable from "swr/immutable";
import { SimpleSpinner, Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { ExternalLink, Keyboard, Zap, CheckCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
    const { loginWithRedirect, user, isLoading } = useAuth0();
    const [_, setIsFirstVisit] = useLocalStorage<undefined | boolean>("is_first_visit", undefined)

    const router = useRouter()
    const handleonClick = (isLogin?: boolean) => {
        setIsFirstVisit(false)
        isLogin ? loginWithRedirect() : redirectTodo()
    }
    const redirectTodo = () => {
        setIsFirstVisit(false)
        router.push("/app/t")
    }

    const { data: pullRequests, error, isLoading: updateLoading } = useSWRImmutable(
        'https://api.github.com/repos/nkita/vim-keybind-todo/pulls?state=closed&per_page=20&sort=updated&direction=desc',
        url => fetch(url).then(res => res.json())
    );

    return (
        <NormalPageTemplate>
            <main className="flex flex-col items-center justify-center gap-12 ">
                {/* Hero Section */}
                <section className="pt-20 sm:pt-28 md:w-[800px] sm:w-[700px] w-[400px] relative">
                    <div className="text-center animate-fade-up animate-delay-75 ">
                        <h1 className="md:text-6xl sm:text-5xl text-4xl py-4 font-bold leading-tight">
                            ホームポジションをキープ<br />
                            <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">最速のタスク管理</span>
                        </h1>
                        <p className="text-lg sm:text-xl px-4 sm:px-0 py-6 text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                            {"キーボードから手を離すたびに、集中力は途切れる。Shiba Todoなら、思考の流れを止めずにタスクを管理。プログラマーのために作られた、真のキーボードファースト体験。"}
                        </p>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="flex flex-col items-center w-full gap-8 relative">
                    <div className={`absolute top-0 opacity-[0.03] -z-50`} onMouseDown={e => e.preventDefault()}>
                        <Image
                            src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`}
                            alt="Shiba Todo Logo"
                            className="w-[300px] sm:w-[400px]"
                            width={400}
                            height={400}
                        />
                    </div>

                    <div className={`flex justify-center w-full ${isLoading ? "block" : "hidden"}`}>
                        <Skeleton className={`w-[80%] sm:w-[320px] h-12 rounded-full bg-primary/30`} />
                    </div>

                    {/* Desktop CTA */}
                    <div className={`flex gap-6 ${isLoading ? "hidden" : "hidden sm:flex"} animate-fade-up items-center`}>
                        {user ? (
                            <Button disabled={isLoading} size="lg" className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 group" onClick={_ => redirectTodo()}>
                                はじめる
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        ) : (
                            <>
                                <Button disabled={isLoading} variant="outline" size="lg" onClick={_ => handleonClick()} className="px-8 py-6 text-lg border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-300">
                                    ログインせずに使う
                                </Button>
                                <Button disabled={isLoading} size="lg" className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 group" onClick={_ => handleonClick(true)}>
                                    ログインしてフルに使う
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile CTA */}
                    <div className={`flex flex-col gap-4 ${isLoading ? "hidden" : "sm:hidden flex"} items-center animate-fade-up w-[85%] max-w-sm`}>
                        {user ? (
                            <Button disabled={isLoading} size="lg" className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transition-all duration-300 group" onClick={_ => redirectTodo()}>
                                はじめる
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        ) : (
                            <>
                                <Button disabled={isLoading} variant="outline" size="lg" onClick={_ => handleonClick()} className="w-full py-6 text-lg border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all duration-300">
                                    ログインせずに使う
                                </Button>
                                <Button disabled={isLoading} size="lg" onClick={_ => handleonClick(true)} className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg transition-all duration-300 group">
                                    ログインしてフルに使う
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </>
                        )}
                    </div>
                </section>

                {/* Features Section */}
                <section className="w-full max-w-6xl px-6 py-16">
                    <div className="text-center mb-12 animate-fade-up animate-delay-300">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">生産性を阻害する3つの問題を解決</h2>
                        <p className="text-muted-foreground text-base max-w-2xl mx-auto">
                            マウスに手を伸ばす、複雑なUI、機能の多さ。これらすべてが集中力を奪っている。
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-up animate-delay-500">
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-card to-card/50">
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Keyboard className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle className="text-lg font-semibold">完全キーボード操作</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-center text-sm leading-relaxed">
                                    マウスに手を伸ばした瞬間、フローは止まる。hjklで移動、Enterで決定。思考の速度でタスクを操る。
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-card to-card/50">
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Zap className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle className="text-lg font-semibold">瞬間的な記録</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-center text-sm leading-relaxed">
                                    アイデアが浮かんだ瞬間に記録。複雑なフォームも、冗長なステップも不要。2秒でタスク作成完了。
                                </CardDescription>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-card to-card/50">
                            <CardHeader className="text-center pb-4">
                                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8 text-primary" />
                                </div>
                                <CardTitle className="text-lg font-semibold">認知負荷ゼロ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-center text-sm leading-relaxed">
                                    選択肢は最小限、画面はクリーン。UIを学ぶ時間をタスクに集中する時間に変える。
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Product Demo Section */}
                <article className="flex flex-col gap-16 pt-20 w-full max-w-6xl px-6">
                    <section className="flex flex-col items-center animate-fade-up animate-delay-700">
                        <h2 className="text-center py-8 text-2xl sm:text-3xl font-bold">
                            実際の画面を見てみよう <span className="animate-wiggle-more animate-infinite animate-ease-in inline-block">👀</span>
                        </h2>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                            <div className="relative shadow-2xl bg-gradient-to-br from-primary/20 to-primary/10 p-4 border border-primary/20 rounded-xl backdrop-blur-sm">
                                <Image
                                    src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/service_image.png`}
                                    alt="Shiba Todo Image"
                                    className="w-[400px] sm:w-[900px] rounded-lg shadow-lg"
                                    width={1242}
                                    height={818}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="content-center px-4 sm:px-8 animate-fade-up animate-delay-1000">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-xl sm:text-2xl font-bold text-center pb-6 pt-8">他のTodoアプリに疲れたあなたへ</h2>
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
                                <CardContent className="p-6">
                                    <p className="text-base leading-relaxed text-center text-muted-foreground">
                                        {"マウスを握る時間、メニューを探す時間、設定に迷う時間。"}<br />
                                        {"それらはすべて、本当にやるべきタスクから目を逸らせている。"}<br />
                                        {"Shiba Todoは違う。開いた瞬間から、あなたの手はキーボードの上にある。"}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Updates Section */}
                    <section className="content-center w-full px-4 sm:px-8 animate-fade-up animate-delay-1200">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-xl sm:text-2xl font-bold text-center pb-6 pt-8" id="update">
                                最新の改善 🚀
                            </h2>
                            <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
                                <CardContent className="p-1">
                                    <div className="overflow-auto max-h-96 p-6 hidden-scrollbar">
                                        {(!pullRequests && updateLoading) &&
                                            <div className="flex justify-center py-8">
                                                <SimpleSpinner />
                                            </div>
                                        }
                                        {
                                            error ? (
                                                <div className="text-red-500 text-center py-8">アップデート情報の取得に失敗しました</div>
                                            ) : (
                                                <div>
                                                    {pullRequests &&
                                                        <ul className="space-y-4">
                                                            {pullRequests.map((pr: any) => (
                                                                <li key={pr.id} className="group">
                                                                    <Card className="border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:shadow-md bg-gradient-to-r from-secondary/30 to-secondary/20">
                                                                        <CardContent className="p-4">
                                                                            <div className="flex justify-between items-start gap-4">
                                                                                <div className="flex-1">
                                                                                    <div className="text-xs py-1 text-muted-foreground font-medium">
                                                                                        {new Date(pr.created_at).toLocaleDateString('ja-JP', {
                                                                                            year: 'numeric',
                                                                                            month: 'long',
                                                                                            day: 'numeric'
                                                                                        })}
                                                                                    </div>
                                                                                    <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                                                                        {pr.title}
                                                                                    </span>
                                                                                </div>
                                                                                <Link
                                                                                    href={pr.html_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex gap-1 items-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-xs border border-primary/20 rounded-full px-3 py-2 hover:shadow-md group/link"
                                                                                >
                                                                                    GitHubで確認
                                                                                    <ExternalLink className="h-3 w-3 group-hover/link:translate-x-0.5 transition-transform" />
                                                                                </Link>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                </li>
                                                            ))}
                                                            <li className="group">
                                                                <Card className="border border-primary/20 bg-gradient-to-r from-primary/10 to-primary/5">
                                                                    <CardContent className="p-4">
                                                                        <div className="text-xs py-1 text-muted-foreground font-medium">
                                                                            2024年11月1日
                                                                        </div>
                                                                        <span className="text-sm font-medium text-foreground">
                                                                            🎉リリースしました！
                                                                        </span>
                                                                    </CardContent>
                                                                </Card>
                                                            </li>
                                                        </ul>
                                                    }
                                                </div>
                                            )
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </section>
                </article>
            </main >
        </NormalPageTemplate >
    )
}