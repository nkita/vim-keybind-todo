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
import { Bell, CircleCheck, CircleHelp, ExternalLink, Folder, History, Home, MoreHorizontal, PanelLeft, PanelLeftClose, Settings, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { DropdownMenuItem, DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { NavUser } from "./app-sidebar-user"
import { useEffect, useState } from "react"
import useSWRImmutable from "swr/immutable"
import { useLocalStorage } from "@/hook/useLocalStrorage"
import { GitHubLogoIcon } from "@radix-ui/react-icons"

export function AppSidebar() {
    const {
        state,
        open,
        setOpen,
        openMobile,
        setOpenMobile,
        isMobile,
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
            setIsBadge(checkInfoDate === undefined || latestDate > checkInfoDate)
        }
    }, [checkInfoDate, pullRequests])

    const handleClickBell = () => {
        if (pullRequests && pullRequests.length > 0) {
            setCheckInfoDate(new Date(pullRequests[0].closed_at).getTime())
        }
    }
    return (
        <Sidebar collapsible="icon" className="border-sidebar-border">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton className="flex items-center" asChild>
                            <a href="/lp">
                                <Image width={20} height={20} src={`https://${process.env.NEXT_PUBLIC_S3_DOMAIN}/logo.png`} alt={"todo logo"} className="" />
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
                            <SidebarMenuButton className="flex items-center" asChild>
                                <Link href="/app/t">
                                    <CircleCheck />
                                    <span>タスク管理</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton className="flex items-center" asChild>
                                <Link href="/app/me">
                                    <History className="w-4 h-4" />
                                    <span>履歴</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton className="flex items-center" asChild>
                                <Link href="/app/setting">
                                    <Settings className="w-4 h-4" />
                                    <span>設定</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
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
                                    <X className="w-4 h-4 " />
                                    <span>nkita X</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem >
                            <SidebarMenuButton asChild>
                                <a href="https://shiba-tools.dev/" target="_blank">
                                    <ExternalLink className="w-4 h-4 " />
                                    <span>Shiba Tools</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter >
                <SidebarMenu>
                    <SidebarMenuItem >
                        <SidebarMenuButton>
                            <Bell className={`w-4 h-4`} />
                            {(!open && isBadge) && <span className="absolute right-1 top-1 bg-destructive rounded-full text-xs w-2 h-2"></span>}
                            <div className="flex justify-between text-nowrap w-full items-center"><span>お知らせ</span>{isBadge && <span className="text-start bg-destructive rounded-full text-xs w-2 h-2" />}</div>
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
