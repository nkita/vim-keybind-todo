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
            {/* Background Effects */}
            <div className="fixed inset-0 -z-50 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5"></div>
                <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
                <div className="absolute -top-4 -right-4 w-96 h-96 bg-primary/15 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-primary/8 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{animationDelay: '4s'}}></div>
            </div>

            <main className="flex flex-col items-center justify-center gap-16 relative">
                {/* Hero Section */}
                <section className="pt-24 sm:pt-32 md:pt-40 max-w-7xl mx-auto px-6 relative">
                    {/* Floating elements */}
                    <div className="absolute top-20 left-10 w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute top-32 right-16 w-3 h-3 bg-primary/30 rounded-full animate-bounce" style={{animationDelay: '1s'}}></div>
                    <div className="absolute top-44 left-32 w-1.5 h-1.5 bg-primary/50 rounded-full animate-bounce" style={{animationDelay: '1.5s'}}></div>
                    
                    <div className="text-center animate-fade-up animate-delay-75 space-y-8">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary">
                                <Zap className="w-4 h-4" />
                                キーボードファースト体験
                            </div>
                            
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                                <span className="block bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                                    ホームポジションをキープ
                                </span>
                                <span className="block mt-2 bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                                    最速のタスク管理
                                </span>
                            </h1>
                            
                            <p className="text-lg sm:text-xl lg:text-2xl px-4 sm:px-0 text-muted-foreground leading-relaxed max-w-4xl mx-auto font-light">
                                キーボードから手を離すたびに、<span className="text-foreground font-medium">集中力は途切れる</span>。<br className="hidden sm:block" />
                                Shiba Todoなら、思考の流れを止めずにタスクを管理。<br className="hidden sm:block" />
                                <span className="text-primary font-medium">プログラマーのために作られた</span>、真のキーボードファースト体験。
                            </p>
                        </div>

                        {/* Keyboard visual hint */}
                        <div className="flex justify-center gap-2 animate-fade-up animate-delay-200">
                            <kbd className="text-xs">h</kbd>
                            <kbd className="text-xs">j</kbd>
                            <kbd className="text-xs">k</kbd>
                            <kbd className="text-xs">l</kbd>
                            <span className="text-muted-foreground text-sm self-center ml-2">で移動</span>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="flex flex-col items-center w-full gap-12 relative max-w-4xl mx-auto px-6">
                    {/* Floating logo background */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] -z-10 pointer-events-none">
                        <Image
                            src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`}
                            alt="Shiba Todo Logo"
                            className="w-[400px] sm:w-[600px] animate-pulse"
                            width={600}
                            height={600}
                        />
                    </div>

                    {/* Loading state */}
                    <div className={`flex justify-center w-full ${isLoading ? "block" : "hidden"}`}>
                        <div className="flex gap-4">
                            <Skeleton className="w-40 h-14 rounded-full bg-primary/20" />
                            <Skeleton className="w-48 h-14 rounded-full bg-primary/30" />
                        </div>
                    </div>

                    {/* Desktop CTA */}
                    <div className={`flex gap-6 ${isLoading ? "hidden" : "hidden sm:flex"} animate-fade-up items-center`}>
                        {user ? (
                            <Button
                                disabled={isLoading}
                                size="lg"
                                className="px-12 py-7 text-xl font-bold bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary/90 hover:to-primary/85 shadow-2xl hover:shadow-primary/25 transition-all duration-500 group border-0 rounded-2xl transform hover:scale-105"
                                onClick={_ => redirectTodo()}
                            >
                                <Zap className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                                今すぐはじめる
                                <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                            </Button>
                        ) : (
                            <>
                                <Button
                                    disabled={isLoading}
                                    variant="outline"
                                    size="lg"
                                    onClick={_ => handleonClick()}
                                    className="px-10 py-7 text-lg font-semibold border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:shadow-lg transition-all duration-500 rounded-2xl backdrop-blur-sm"
                                >
                                    ログインせずに使う
                                </Button>
                                <Button
                                    disabled={isLoading}
                                    size="lg"
                                    className="px-12 py-7 text-xl font-bold bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary/90 hover:to-primary/85 shadow-2xl hover:shadow-primary/25 transition-all duration-500 group border-0 rounded-2xl transform hover:scale-105"
                                    onClick={_ => handleonClick(true)}
                                >
                                    <Zap className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform" />
                                    フル機能で使う
                                    <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile CTA */}
                    <div className={`flex flex-col gap-6 ${isLoading ? "hidden" : "sm:hidden flex"} items-center animate-fade-up w-full max-w-xs`}>
                        {user ? (
                            <Button
                                disabled={isLoading}
                                size="lg"
                                className="w-full py-7 text-lg font-bold bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary/90 hover:to-primary/85 shadow-2xl hover:shadow-primary/25 transition-all duration-500 group border-0 rounded-2xl"
                                onClick={_ => redirectTodo()}
                            >
                                <Zap className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                                今すぐはじめる
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        ) : (
                            <>
                                <Button
                                    disabled={isLoading}
                                    variant="outline"
                                    size="lg"
                                    onClick={_ => handleonClick()}
                                    className="w-full py-6 text-lg font-semibold border-2 border-primary/30 hover:border-primary hover:bg-primary/10 hover:shadow-lg transition-all duration-500 rounded-2xl backdrop-blur-sm"
                                >
                                    ログインせずに使う
                                </Button>
                                <Button
                                    disabled={isLoading}
                                    size="lg"
                                    onClick={_ => handleonClick(true)}
                                    className="w-full py-7 text-lg font-bold bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/95 hover:via-primary/90 hover:to-primary/85 shadow-2xl hover:shadow-primary/25 transition-all duration-500 group border-0 rounded-2xl"
                                >
                                    <Zap className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                                    フル機能で使う
                                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Trust indicators */}
                    <div className="flex flex-col items-center gap-4 animate-fade-up animate-delay-300">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-primary" />
                                無料で使用可能
                            </div>
                            <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-primary" />
                                アカウント登録不要
                            </div>
                            <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-primary" />
                                即座に開始
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="w-full max-w-7xl px-6 py-24 relative">
                    {/* Section background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent rounded-3xl"></div>
                    
                    <div className="text-center mb-16 animate-fade-up animate-delay-300 relative">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-full text-sm font-medium text-destructive mb-6">
                            ❌ 従来のTodoアプリの問題点
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                            生産性を阻害する3つの問題を解決
                        </h2>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                            マウスに手を伸ばす、複雑なUI、機能の多さ。<br className="hidden sm:block" />
                            これらすべてが<span className="text-destructive font-medium">集中力を奪っている</span>。
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 animate-fade-up animate-delay-500 relative">
                        {/* Feature 1 */}
                        <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <CardHeader className="text-center pb-6 relative">
                                <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                                    <Keyboard className="w-10 h-10 text-primary group-hover:text-primary/90" />
                                </div>
                                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">完全キーボード操作</CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <CardDescription className="text-center text-base leading-relaxed mb-6">
                                    マウスに手を伸ばした瞬間、フローは止まる。<br />
                                    <span className="text-primary font-medium">hjkl</span>で移動、<span className="text-primary font-medium">Enter</span>で決定。<br />
                                    思考の速度でタスクを操る。
                                </CardDescription>
                                <div className="flex justify-center gap-1">
                                    <kbd className="text-xs px-2 py-1">h</kbd>
                                    <kbd className="text-xs px-2 py-1">j</kbd>
                                    <kbd className="text-xs px-2 py-1">k</kbd>
                                    <kbd className="text-xs px-2 py-1">l</kbd>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feature 2 */}
                        <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <CardHeader className="text-center pb-6 relative">
                                <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                                    <Zap className="w-10 h-10 text-primary group-hover:text-primary/90 group-hover:rotate-12" />
                                </div>
                                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">瞬間的な記録</CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <CardDescription className="text-center text-base leading-relaxed mb-6">
                                    アイデアが浮かんだ瞬間に記録。<br />
                                    複雑なフォームも、冗長なステップも不要。<br />
                                    <span className="text-primary font-bold text-lg">2秒</span>でタスク作成完了。
                                </CardDescription>
                                <div className="flex justify-center">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                        ⚡ 超高速入力
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Feature 3 */}
                        <Card className="group border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <CardHeader className="text-center pb-6 relative">
                                <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
                                    <CheckCircle className="w-10 h-10 text-primary group-hover:text-primary/90" />
                                </div>
                                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">認知負荷ゼロ</CardTitle>
                            </CardHeader>
                            <CardContent className="relative">
                                <CardDescription className="text-center text-base leading-relaxed mb-6">
                                    選択肢は最小限、画面はクリーン。<br />
                                    UIを学ぶ時間を<br />
                                    <span className="text-primary font-medium">タスクに集中する時間</span>に変える。
                                </CardDescription>
                                <div className="flex justify-center">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                        🧠 シンプル設計
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Comparison highlight */}
                    <div className="mt-16 text-center animate-fade-up animate-delay-700">
                        <Card className="inline-block border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm">
                            <CardContent className="p-6">
                                <p className="text-sm text-muted-foreground mb-2">他のTodoアプリとの違い</p>
                                <p className="text-lg font-semibold">
                                    <span className="text-destructive">マウス操作 → </span>
                                    <span className="text-primary">キーボードのみ</span> ｜
                                    <span className="text-destructive"> 複雑UI → </span>
                                    <span className="text-primary">最小限UI</span> ｜
                                    <span className="text-destructive"> 多機能 → </span>
                                    <span className="text-primary">本質特化</span>
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Product Demo Section */}
                <article className="flex flex-col gap-20 pt-24 w-full max-w-7xl px-6">
                    <section className="flex flex-col items-center animate-fade-up animate-delay-700">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-6">
                                👀 ライブデモ
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                実際の操作感を体験
                            </h2>
                            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                百聞は一見に如かず。<span className="text-primary font-medium">シンプルで直感的な操作</span>を<br className="hidden sm:block" />
                                実際の画面で確認してください。
                            </p>
                        </div>
                        
                        <div className="relative group w-full max-w-5xl">
                            {/* Glowing background effect */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-all duration-700 animate-pulse"></div>
                            
                            {/* Floating elements around demo */}
                            <div className="absolute -top-8 -left-8 w-16 h-16 bg-primary/20 rounded-full blur-xl animate-pulse" style={{animationDelay: '0s'}}></div>
                            <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-primary/15 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
                            <div className="absolute top-1/2 -left-12 w-12 h-12 bg-primary/25 rounded-full blur-xl animate-pulse" style={{animationDelay: '4s'}}></div>
                            
                            <div className="relative bg-gradient-to-br from-card/90 via-card to-card/80 p-6 sm:p-8 border border-primary/20 rounded-3xl backdrop-blur-md shadow-2xl group-hover:shadow-primary/25 transition-all duration-500">
                                <div className="relative overflow-hidden rounded-2xl">
                                    <Image
                                        src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/service_image.png`}
                                        alt="Shiba Todo 実際の操作画面"
                                        className="w-full max-w-[900px] mx-auto rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                                        width={1242}
                                        height={818}
                                    />
                                    {/* Overlay hint */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                                </div>
                            </div>
                        </div>

                        {/* Key features highlight */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-12 w-full max-w-3xl">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">hjkl</div>
                                <div className="text-sm text-muted-foreground">vim操作</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">2秒</div>
                                <div className="text-sm text-muted-foreground">タスク作成</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">0%</div>
                                <div className="text-sm text-muted-foreground">マウス使用</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">100%</div>
                                <div className="text-sm text-muted-foreground">フォーカス</div>
                            </div>
                        </div>
                    </section>

                    <section className="content-center px-4 sm:px-8 animate-fade-up animate-delay-1000">
                        <div className="max-w-5xl mx-auto text-center">
                            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                他のTodoアプリに疲れたあなたへ
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                                <Card className="border border-destructive/20 bg-gradient-to-br from-destructive/5 to-transparent">
                                    <CardContent className="p-6 text-center">
                                        <div className="text-destructive text-lg font-semibold mb-2">従来のTodoアプリ</div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div>❌ マウス操作必須</div>
                                            <div>❌ 複雑な設定</div>
                                            <div>❌ 機能が多すぎ</div>
                                        </div>
                                    </CardContent>
                                </Card>
                                
                                <div className="flex items-center justify-center">
                                    <ArrowRight className="w-8 h-8 text-primary animate-pulse" />
                                </div>
                                
                                <Card className="border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                                    <CardContent className="p-6 text-center">
                                        <div className="text-primary text-lg font-semibold mb-2">Shiba Todo</div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <div>✅ 完全キーボード操作</div>
                                            <div>✅ 設定不要</div>
                                            <div>✅ 本質のみ</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm">
                                <CardContent className="p-8">
                                    <p className="text-lg sm:text-xl leading-relaxed text-muted-foreground">
                                        マウスを握る時間、メニューを探す時間、設定に迷う時間。<br className="hidden sm:block" />
                                        <span className="text-destructive font-medium">それらはすべて、本当にやるべきタスクから目を逸らせている</span>。<br />
                                        <span className="text-primary font-semibold text-xl">Shiba Todoは違う</span>。<br className="hidden sm:block" />
                                        開いた瞬間から、あなたの手はキーボードの上にある。
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </section>

                    {/* Updates Section */}
                    <section className="content-center w-full px-4 sm:px-8 animate-fade-up animate-delay-1200">
                        <div className="max-w-6xl mx-auto">
                            <div className="text-center mb-12">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-6">
                                    🚀 継続的改善
                                </div>
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent" id="update">
                                    最新の改善とアップデート
                                </h2>
                                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                                    ユーザーフィードバックを基に、<span className="text-primary font-medium">日々改善を重ねています</span>。<br className="hidden sm:block" />
                                    すべての更新をリアルタイムで確認できます。
                                </p>
                            </div>
                            
                            <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm relative overflow-hidden">
                                {/* Background decoration */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
                                
                                <CardContent className="p-2 relative">
                                    <div className="overflow-auto max-h-[500px] p-6 hidden-scrollbar">
                                        {(!pullRequests && updateLoading) &&
                                            <div className="flex flex-col items-center justify-center py-16">
                                                <SimpleSpinner />
                                                <p className="text-muted-foreground mt-4">最新情報を取得中...</p>
                                            </div>
                                        }
                                        {
                                            error ? (
                                                <div className="text-center py-16">
                                                    <div className="text-destructive text-lg font-semibold mb-2">アップデート情報の取得に失敗しました</div>
                                                    <p className="text-muted-foreground">しばらく時間をおいて再度お試しください。</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {pullRequests &&
                                                        <>
                                                            <div className="grid gap-4">
                                                                {pullRequests.map((pr: any) => (
                                                                    <Card key={pr.id} className="group border border-primary/10 hover:border-primary/30 transition-all duration-500 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-r from-secondary/20 to-secondary/10 backdrop-blur-sm">
                                                                        <CardContent className="p-6">
                                                                            <div className="flex justify-between items-start gap-6">
                                                                                <div className="flex-1 space-y-2">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                                                                                            {new Date(pr.created_at).toLocaleDateString('ja-JP', {
                                                                                                year: 'numeric',
                                                                                                month: 'short',
                                                                                                day: 'numeric'
                                                                                            })}
                                                                                        </Badge>
                                                                                        <Badge variant="secondary" className="text-xs">
                                                                                            改善
                                                                                        </Badge>
                                                                                    </div>
                                                                                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
                                                                                        {pr.title}
                                                                                    </h3>
                                                                                </div>
                                                                                <Link
                                                                                    href={pr.html_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="flex gap-2 items-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 text-sm border border-primary/20 rounded-xl px-4 py-3 hover:shadow-lg group/link backdrop-blur-sm"
                                                                                >
                                                                                    詳細を見る
                                                                                    <ExternalLink className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                                                                                </Link>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                ))}
                                                            </div>
                                                            
                                                            {/* Release milestone */}
                                                            <Card className="border border-primary/30 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 relative overflow-hidden">
                                                                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full blur-2xl"></div>
                                                                <CardContent className="p-6 relative">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                                                                            <span className="text-2xl">🎉</span>
                                                                        </div>
                                                                        <div className="flex-1">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30">
                                                                                    2024年11月1日
                                                                                </Badge>
                                                                                <Badge className="text-xs bg-primary text-primary-foreground">
                                                                                    マイルストーン
                                                                                </Badge>
                                                                            </div>
                                                                            <h3 className="text-lg font-bold text-primary">
                                                                                Shiba Todo 正式リリース！
                                                                            </h3>
                                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                                プログラマーのための究極のキーボードファーストTodoアプリが誕生
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </CardContent>
                                                            </Card>
                                                        </>
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