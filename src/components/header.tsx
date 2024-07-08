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
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import * as React from "react";

export default function Header({ list }: { list: any }) {
    const { loginWithRedirect, logout, user, isLoading, getAccessTokenSilently } = useAuth0();
    const [open, setOpen] = React.useState(false)
    const handleAddList = () => {
        setOpen(true)
    }
    return (
        <div className="flex justify-between items-center w-full py-3 px-4">
            <div className="flex  items-center gap-2 h-9">
                <h1 className="border p-1 rounded-md bg-primary text-primary-foreground">Fast Todo</h1>
                <Select>
                    <SelectTrigger className="w-[250px] truncate text-muted-foreground">
                        <SelectValue placeholder="タスクを選択 (⌘ + T)" />
                    </SelectTrigger>
                    <SelectContent>
                        {list && list.map(l => {
                            return <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                        })}
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
                            <DropdownMenuItem onClick={handleAddList}>
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
            <AddListDialog open={open} setOpen={setOpen} />
        </div >
    )
}


const AddListDialog = ({ open, setOpen }: { open: boolean, setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
    return (
        <Dialog open={open}>
            <DialogContent className="sm:max-w-md" onEscapeKeyDown={_ => setOpen(false)}>
                <DialogHeader>
                    <DialogTitle>Share link</DialogTitle>
                    <DialogDescription>
                        Anyone who has this link will be able to view this.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" onClick={_ => setOpen(false)}>
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}