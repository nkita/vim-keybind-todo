'use client'

import { useAuth0, User } from "@auth0/auth0-react";
import { FaRegUser, FaArrowRightFromBracket } from "react-icons/fa6";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Check, CircleCheck, CloudUpload, ExternalLink, List, Lock, User2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Header({
    user,
    userLoading,
    isSave,
    isUpdate,
    onClickSaveButton
}: {
    user: User | undefined,
    userLoading: boolean,
    isSave?: boolean | undefined,
    isUpdate?: boolean | undefined,
    onClickSaveButton?: () => void
}) {

    const h = `h-[60px]`
    return (
        <div className={`flex justify-between items-center w-full px-8 ${h}`}>
            <div className="flex items-center gap-1 h-9">
                <Image width={20} height={20} src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`} alt={"todo logo"} className="" />
                <h1 className={`pr-1 border-primary text-secondary-foreground font-semibold text-sm`}>Shiba ToDo</h1>
            </div>
            <div className="flex gap-2 items-center border p-1 rounded-full text-xs m-3 truncate bg-card">
                <ExLink path={"/t"}><List size={13} /> 進行中タスク</ExLink>
                <ExLink path={"/c"} lock={!user}>{!user ? <Lock size={13} /> : <Check size={13} />} 完了タスク</ExLink>
                <ExLink path={"https://shiba-tools.dev"} target="_blank" className="underline font-bold"> Shiba Tools<ExternalLink size={13} /></ExLink>
            </div>
            <div className="flex gap-1 items-center  justify-end ">
                {isSave !== undefined && isUpdate !== undefined && onClickSaveButton !== undefined && user &&
                    <SaveButton isSave={isSave} isUpdate={isUpdate} onClickSaveButton={onClickSaveButton} />
                }
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

const SaveButton = ({ isUpdate, isSave, onClickSaveButton }: { isUpdate: boolean, isSave: boolean, onClickSaveButton: () => void }) => {
    return (
        <div className="flex gap-2">
            {isUpdate ? (
                <Button onClick={onClickSaveButton} size={"default"} className="gap-1">
                    {isSave ? (
                        <div className="pr-1">
                            <div className="animate-spin h-4 w-4 border-2 p-1 border-white rounded-full border-t-transparent"></div>
                        </div>
                    ) : (
                        <CloudUpload className="scale-75" />
                    )}
                    保存する<kbd className="flex items-center h-full text-primary-foreground">Ctrl</kbd>+<kbd className="flex items-center h-full text-primary-foreground">S</kbd>
                </Button>
            ) : (
                <Button onClick={_ => { }} size={"default"} variant={"outline"} className="bg-muted text-muted-foreground gap-1" disabled><CircleCheck className="scale-75" />保存済み</Button>
            )}
        </div>
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