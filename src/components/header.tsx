'use client'

import { useAuth0 } from "@auth0/auth0-react";
import { FaRegUser, FaGear, FaArrowRightFromBracket, FaPlus, FaRotate, FaTrash } from "react-icons/fa6";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

export default function Header() {
    const { loginWithRedirect, logout, user, isLoading } = useAuth0();
    return (
        <div className="flex justify-between items-center w-full py-3 px-4">
            <div className="flex  items-center gap-2 h-9">
                <h1 className="border p-1 rounded-md bg-primary text-primary-foreground">Fast Todo</h1>
                <Select>
                    <SelectTrigger className="w-[250px] truncate text-muted-foreground">
                        <SelectValue placeholder="タスクを選択 (⌘ + T)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="abcdefg">仕事</SelectItem>
                        <SelectItem value="dddddd">プライベート</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {isLoading ? (
                <Spinner className="p-1 w-9 h-9" />
            ) :
                !user ? (
                    <Button onClick={_ => loginWithRedirect()} size={"sm"} variant={"default"}>Log In</Button>
                ) : (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="rounded-full">
                            <Avatar className="w-9 h-9 ring-1 ring-muted-foreground">
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
                            <DropdownMenuItem>
                                <FaRotate className="mr-2 h-4 w-4" /><span>Todoを切り替え</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <FaPlus className="mr-2 h-4 w-4" /><span>新しいTodoを作成</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <FaTrash className="mr-2 h-4 w-4" /><span>現在のTodoを削除</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <FaGear className="mr-2 h-4 w-4" /><span>設定</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={_ => logout({ logoutParams: { returnTo: process.env.NEXT_PUBLIC_DOMAIN } })}>
                                <FaArrowRightFromBracket className="mr-2 h-4 w-4" /><span>ログアウト</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu >
                )
            }
        </div >
    )
}