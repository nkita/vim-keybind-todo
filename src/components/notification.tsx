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

import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import * as React from "react";
import { Bell, Check, ExternalLink, List, Lock, LogOutIcon, Sidebar, Sparkle } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLocalStorage } from "@/hook/useLocalStrorage";
import useSWRImmutable from "swr/immutable";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { GearIcon } from "@radix-ui/react-icons";

export default function Notification() {
    const [checkInfoDate, setCheckInfoDate] = useLocalStorage<number | undefined>("todo_info_date", undefined)
    const { data: pullRequests, error } = useSWRImmutable(
        'https://api.github.com/repos/nkita/vim-keybind-todo/pulls?state=closed&per_page=20&sort=updated&direction=desc',
        url => fetch(url).then(res => res.json())
    );


    const handleClickBell = () => {
        if (pullRequests && pullRequests.length > 0) {
            setCheckInfoDate(new Date(pullRequests[0].closed_at).getTime())
        }
    }


    return (
        <>
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
        </>
    )
}



const UserMenu = ({ user, userLoading }: { user: User | undefined, userLoading: boolean }) => {
    const { loginWithRedirect, logout } = useAuth0();
    if (userLoading) return <Spinner className="m-2 w-4 h-4" />
    return (
        <>
            {user ? (
                <DropdownMenu>
                    <DropdownMenuTrigger className="rounded-full focus:outline-none">
                        <Avatar className="w-6 h-6 ring-2 ring-muted-foreground">
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
                        <DropdownMenuItem >
                            <Link href={"/app/setting"} className="flex w-full items-center"><GearIcon className="mr-2 h-4 w-4" /><span>情報・設定</span></Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={_ => logout({ logoutParams: { returnTo: process.env.NEXT_PUBLIC_DOMAIN } })} className="flex items-center">
                            <LogOutIcon className="mr-2 h-4 w-4" /><span>ログアウト</span>
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

const ExLink = ({ path, label, className = "", target, lock, children, ...props }: { path: string, label?: string, className?: string | undefined, target?: string, lock?: boolean, children: React.ReactNode }) => {
    const pathname = usePathname()
    if (lock) {
        return (
            <TooltipProvider>
                <Tooltip delayDuration={100}>
                    <TooltipTrigger asChild>
                        <button disabled className="flex text-muted-foreground items-center gap-1 px-3 py-2 rounded-full">{children}</button>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs">
                        {label}
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    }
    return (
        <TooltipProvider>
            <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                    <Link href={path} target={target} className={cn(`${pathname === path ? "primary-gradient text-primary-foreground" : ""} flex items-center gap-1 px-3 py-2 rounded-full hover:bg-secondary transition-all fade-in-5`, className)} {...props} >
                        {children}
                    </Link>
                </TooltipTrigger>
                <TooltipContent className="text-xs">
                    {label}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}