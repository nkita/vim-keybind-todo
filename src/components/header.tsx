'use client'

import { useAuth0, User } from "@auth0/auth0-react";
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
import Image from "next/image"

import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import * as React from "react";
import { CircleCheck, CloudUpload } from "lucide-react";
import { M_PLUS_1p } from "next/font/google";
const titleFont = M_PLUS_1p({ weight: "700", subsets: ["latin"] })

export default function Header({ user, userLoading, list, isSave, isUpdate, height, onClickSaveButton }: { height: string, user: User | undefined, userLoading: boolean, list: any, isSave: boolean, isUpdate: boolean, onClickSaveButton: () => void }) {
    const { loginWithRedirect, logout } = useAuth0();
    const [addList, setAddList] = React.useState(false)
    const h = `h-[60px]`
    return (
        <div className={`flex justify-between items-center w-full py-3 px-8 ${h}`}>
            <div className="flex items-center gap-1 h-9">
                <Image width={20} height={20} src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`} alt={"todo logo"} className="" />
                <h1 className={`pr-1 border-primary text-sm font-semibold text-gray-500 ${titleFont.className}`}>キーボードでTODO</h1>
            </div>
            <div className="gap-1 hidden">
                {addList ? (
                    <input type="text" placeholder="新しいタスクを追加" className={`p - 1`}></input>
                ) : (
                    <div>
                        <Select>
                            <SelectTrigger className="w-[250px] truncate text-muted-foreground">
                                <SelectValue placeholder="タスクを選択 (⌘ + T)" />
                            </SelectTrigger>
                            <SelectContent>
                                {list && list.map((l: any) => {
                                    return <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
            {userLoading ? (
                <Spinner className="m-2 w-8 h-8" />
            ) :
                !user ? (
                    <Button onClick={_ => loginWithRedirect()} variant={"default"}>Log In</Button>
                ) : (
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
                    </div>
                )
            }
        </div >
    )
}


const AddListDialog = () => {
    return (
        <Dialog>
            <DialogTrigger className="flex items-center text-sm">
                追加する
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>新しいTodoリストを追加する</DialogTitle>
                    <DialogDescription>
                        新しいTodoを追加します。
                    </DialogDescription>
                </DialogHeader>
                <input className="w-full outline rounded-sm p-1" />
                <DialogFooter className="sm:justify-start">
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}