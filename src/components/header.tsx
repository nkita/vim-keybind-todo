'use client'

import { useAuth0, User } from "@auth0/auth0-react";
import { FaRegUser, FaArrowRightFromBracket } from "react-icons/fa6";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import * as React from "react";
import { Bell, Check, ExternalLink, List, Lock } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLocalStorage } from "@/hook/useLocalStrorage";
import useSWRImmutable from "swr/immutable";

export default function Header({
    user,
    userLoading,
}: {
    user: User | undefined,
    userLoading: boolean,
}) {
    const [checkInfoDate, setCheckInfoDate] = useLocalStorage<number | undefined>("todo_info_date", undefined)
    const [isBadge, setIsBadge] = React.useState(false)
    const { data: pullRequests, error } = useSWRImmutable(
        'https://api.github.com/repos/nkita/vim-keybind-todo/pulls?state=closed&per_page=20&sort=updated&direction=desc',
        url => fetch(url).then(res => res.json())
    );

    React.useEffect(() => {
        if (pullRequests && pullRequests.length > 0) {
            const latestDate = new Date(pullRequests[0].closed_at).getTime()
            setIsBadge(checkInfoDate === undefined || latestDate > checkInfoDate)
        }
    }, [checkInfoDate, pullRequests])

    const handleClickBell = () => {
        if (pullRequests && pullRequests.length > 0) {
            setCheckInfoDate(new Date(pullRequests[0].closed_at).getTime())
        }
    }

    const h = `h-[60px]`

    return (
        <div className={`flex justify-between items-center w-full px-2 sm:px-8 ${h}`}>
            <div className="flex items-center gap-1 h-9 w-[260px]">
                <Image width={20} height={20} src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`} alt={"todo logo"} className="" />
                <Link href="/lp"><h1 className={`pr-1 border-primary text-secondary-foreground font-semibold text-sm hover:text-primary transition-all delay-200`}>Shiba ToDo</h1></Link>
            </div>
            <div className="hidden sm:flex gap-2 items-center border p-1 rounded-full text-xs m-3 truncate bg-card">
                <ExLink path={"/t"}><List size={13} /> 進行中</ExLink>
                <ExLink path={"/c"} lock={!user}>{!user ? <Lock size={13} /> : <Check size={13} />} 完了</ExLink>
            </div>
            <div className="flex gap-5 items-center justify-end w-[260px]">
                <div className="relative">
                    {isBadge && <span className="absolute right-1 top-1 bg-destructive rounded-full text-xs w-2 h-2"></span>}
                    <Popover onOpenChange={handleClickBell}>
                        <PopoverTrigger className="rounded-full p-1 text-secondary-foreground"><Bell className="h-7" /></PopoverTrigger>
                        <PopoverContent align="end" className="shadow-xl">
                            {
                                error ? (
                                    <div className="text-red-500">Failed</div>
                                ) : (
                                    <div>
                                        {pullRequests ? (
                                            <ul className="space-y-2">
                                                {pullRequests.map((pr: any) => (
                                                    <li key={pr.id} className="p-2 bg-secondary/50 text-secondary-foreground rounded-md shadow-sm">
                                                        <div className="text-xs py-1 text-secondary-foreground/70">
                                                            {new Date(pr.created_at).toLocaleDateString()}
                                                        </div>
                                                        <span className="text-sm pl-2">
                                                            {pr.title}
                                                        </span>
                                                        <div className="flex justify-end pt-2">
                                                            <Link href={pr.html_url} target="_blank" rel="noopener noreferrer" className="flex gap-1 items-center hover:border-primary transition-all animate-fade-in text-xs border rounded-full px-3 py-1">
                                                                GitHubで確認  <ExternalLink className="h-3 w-3" />
                                                            </Link>
                                                        </div>
                                                    </li>
                                                ))}
                                                <li className="p-2 bg-secondary/50 text-secondary-foreground rounded-md shadow-sm">
                                                    <div className="text-xs py-1 text-secondary-foreground/70">
                                                        2024/11/01
                                                    </div>
                                                    <span className="text-sm pl-2">
                                                        🎉リリースしました！
                                                    </span>
                                                    <div className="flex justify-end pt-2" />
                                                </li>
                                            </ul>
                                        ) : (
                                            <Spinner className="m-2 w-8 h-8" />
                                        )}
                                    </div>
                                )
                            }
                        </PopoverContent>
                    </Popover>
                    <Link href="/info" target="_blank" className="text-muted-foreground hover:text-card-foreground">
                    </Link>
                </div>
                <UserMenu user={user} userLoading={userLoading} />
            </div>
        </div >
    )
}



const UserMenu = ({ user, userLoading }: { user: User | undefined, userLoading: boolean }) => {
    const { loginWithRedirect, logout } = useAuth0();
    if (userLoading) return <Spinner className="m-2 w-8 h-8" />
    return (
        <>
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-full focus:outline-none">
                        <Avatar className="w-9 h-9 ring-2 ring-muted-foreground">
                            <AvatarImage src={user?.picture} alt={user?.name} />
                            <AvatarFallback><FaRegUser /></AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger >
                    <DropdownMenuContent className="mr-2 w-56">
                        <DropdownMenuLabel className=" text-center">
                            <div className="flex justify-center p-4">
                                <Avatar className="scale-150">
                                    <AvatarImage src={user?.picture} alt={user?.name} />
                                    <AvatarFallback><FaRegUser /></AvatarFallback>
                                </Avatar>
                            </div>
                            <span>
                                {user?.name}
                            </span>
                            <br />
                            <span className="text-muted-foreground font-light">{user?.email}</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {/* <DropdownMenuItem >
                                    <Link href={"/setting"} className="flex w-full"><FaGear className="mr-2 h-4 w-4" /><span>情報・設定</span></Link>
                                </DropdownMenuItem> */}
                        <DropdownMenuItem onClick={_ => logout({ logoutParams: { returnTo: process.env.NEXT_PUBLIC_DOMAIN } })} className="cursor-pointer">
                            <FaArrowRightFromBracket className="mr-2 h-4 w-4" /><span>ログアウト</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu >
            ) : (
                <Button onClick={_ => loginWithRedirect()} variant={"default"}>Log In</Button>
            )
            }
        </>
    )
}

const ExLink = ({ path, className = "", target, lock, children, ...props }: { path: string, className?: string | undefined, target?: string, lock?: boolean, children: React.ReactNode }) => {
    const pathname = usePathname()
    if (lock) {
        return (
            <button disabled className="flex text-muted-foreground items-center gap-1 px-3 py-2 rounded-full">{children}</button>
        )
    }
    return (
        <Link href={path} target={target} className={cn(`${pathname === path ? "primary-gradient text-primary-foreground" : ""} flex items-center gap-1 px-3 py-2 rounded-full hover:bg-secondary transition-all fade-in-5`, className)} {...props} >
            {children}
        </Link>
    )
}