'use client'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar,
} from "@/components/ui/sidebar"
import { Bell, Bike, ExternalLink, LineChart, PanelLeftClose, PawPrint } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { NavUser } from "./app-sidebar-user"
import React, { useEffect, useState } from "react"
import useSWRImmutable from "swr/immutable"
import { useLocalStorage } from "@/hook/useLocalStrorage"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { FaXTwitter } from "react-icons/fa6"
import { usePathname } from "next/navigation"
import { toast } from "sonner"
import { Button } from "./ui/button"

export function AppSidebar() {
    const {
        open,
        toggleSidebar,
    } = useSidebar()

    const [checkInfoDate, setCheckInfoDate] = useLocalStorage<number | undefined>("todo_info_date", undefined)
    const [isBadge, setIsBadge] = useState(false)
    const { data: pullRequests, error } = useSWRImmutable(
        'https://api.github.com/repos/nkita/vim-keybind-todo/pulls?state=closed&per_page=20&sort=updated&direction=desc',
        url => fetch(url).then(res => res.json())
    );

    useEffect(() => {
        if (pullRequests && pullRequests.length > 0) {
            const latestDate = new Date(pullRequests[0].closed_at).getTime()
            if (checkInfoDate === undefined || latestDate > checkInfoDate) {
                toast.custom((id) => {
                    return (
                        <div className="p-4 border-primary border rounded-lg">
                            <span>最新バージョンがリリースされています🎉 <br /> 画面の更新をお願いします✨</span>
                            <div className="flex justify-between pt-2">
                                <Button variant={"outline"} onClick={() => toast.dismiss(id)}>閉じる</Button>
                                <Button onClick={() => {
                                    setCheckInfoDate(new Date(pullRequests[0].closed_at).getTime())
                                    location.reload()
                                }} className="w-full ml-4" >更新する</Button>
                            </div>
                        </div>
                    )
                }, { duration: Infinity, action: { label: "close", onClick: () => toast.dismiss() }, closeButton: true })
            }
        }
    }, [checkInfoDate, pullRequests])

    return (
        <Sidebar collapsible="icon" className="border-r-sidebar-border" >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="flex items-center hover:bg-transparent" asChild>
                            <a href="/lp">
                                <Image width={25} height={25} src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`} alt={"todo logo"} />
                                <span>Shiba Todo</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent className="overflow-hidden">
                <SidebarGroup >
                    <SidebarMenu>
                        <SidebarGroupLabel>Menu</SidebarGroupLabel>
                        <SidebarMenuItem>
                            <ExSidebarMenuButton href="/app/t">
                                <Bike />
                                <span>タスク管理</span>
                            </ExSidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <ExSidebarMenuButton href="/app/history">
                                <LineChart className="w-4 h-4" />
                                <span>実績</span>
                            </ExSidebarMenuButton>
                        </SidebarMenuItem>
                        {/* <SidebarMenuItem>
                            <ExSidebarMenuButton href="#" disabled>
                                <Settings className="w-4 h-4" />
                                <span>設定</span>
                            </ExSidebarMenuButton>
                        </SidebarMenuItem> */}
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup >
                    <SidebarMenu>
                        <SidebarGroupLabel>Link</SidebarGroupLabel>
                        <SidebarMenuItem >
                            <SidebarMenuButton asChild>
                                <a href="https://github.com/nkita" target="_blank">
                                    <GitHubLogoIcon className="w-4 h-4 " />
                                    <span>nkita repos</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem >
                            <SidebarMenuButton asChild>
                                <a href="https://x.com/nkitao7" target="_blank">
                                    <FaXTwitter className="w-4 h-4 " />
                                    <span>nkita X</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem >
                            <SidebarMenuButton asChild>
                                <a href="https://shiba-tools.dev/" target="_blank">
                                    <PawPrint className="w-4 h-4 " />
                                    <span className="flex gap-1 items-center">Shiba Tools <ExternalLink className="w-3 h-3" /></span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter >
                <SidebarMenu>
                    <SidebarMenuItem >
                        <SidebarMenuButton asChild>
                            <Link href="/lp#update">
                                <Bell className={`w-4 h-4`} />
                                {(!open && isBadge) && <span className="absolute right-1 top-1 bg-primary2 rounded-full text-xs w-2 h-2"></span>}
                                <div className="flex justify-between text-nowrap w-full items-center"><span>お知らせ</span>{isBadge && <span className="text-start bg-primary2 rounded-full text-xs w-2 h-2" />}</div>
                            </Link>
                        </SidebarMenuButton>
                        <SidebarMenuBadge></SidebarMenuBadge>
                    </SidebarMenuItem>
                    <SidebarMenuItem >
                        <SidebarMenuButton onClick={_ => toggleSidebar()}>
                            <PanelLeftClose className={`w-4 h-4 ${open ? "rotate-0" : "rotate-180"} transition-transform`} />
                            <div className="flex justify-between text-nowrap w-full items-center">
                                <span>閉じる</span><kbd className="flex items-center h-6  border-sidebar-border">Alt + b</kbd></div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    )
}

const ExSidebarMenuButton = ({ href, disabled, children }: { href: string, disabled?: boolean, children: React.ReactNode }) => {
    const pathname = usePathname()
    return (
        <SidebarMenuButton disabled className={`flex items-center ${pathname === href && "bg-sidebar-accent text-sidebar-accent-foreground"} ${disabled && "text-primary-foreground/70 hover:text-primary-foreground/70 hover:bg-primary "}`} asChild>
            <Link href={href}>
                {children}
            </Link>
        </SidebarMenuButton>
    )
}