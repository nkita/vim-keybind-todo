"use client"

import {
    ChevronsUpDown,
    LogIn,
    LogOut,
    UserRound,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button"
import { SimpleSpinner } from "./ui/spinner"

export function NavUser() {
    const { isMobile } = useSidebar()
    const { user, isLoading: userLoading, logout, loginWithRedirect } = useAuth0();

    return (
        <SidebarMenu>
            {(!user && userLoading) &&
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <a className="w-full h-14 flex items-center justify-center sidebar-border" href="#">
                            <SimpleSpinner className="h-4 w-4 border-primary-foreground border-t-transparent" />
                        </a>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            }
            {(!user && !userLoading) &&
                <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                        <Button className="w-full h-12 bg-primary border-sidebar-border" variant={"outline"} onClick={_ => loginWithRedirect()}>
                            <LogIn className="h-4 w-4" />
                            <span>Log in</span>
                        </Button>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            }
            {(user && !userLoading) &&
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <Avatar className="h-8 w-8 rounded-lg">
                                    <AvatarImage src={user?.picture} alt={user?.name} />
                                    <AvatarFallback className="rounded-lg"><UserRound /></AvatarFallback>
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user?.name}</span>
                                    <span className="truncate text-xs">{user?.email}</span>
                                </div>
                                <ChevronsUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                            side={isMobile ? "bottom" : "right"}
                            align="end"
                            sideOffset={4}
                        >
                            <DropdownMenuLabel className="p-0 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage src={user?.picture} alt={user?.name} />
                                        <AvatarFallback className="rounded-lg">A</AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">{user?.name}</span>
                                        <span className="truncate text-xs">{user?.email}</span>
                                    </div>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-sm" onClick={_ => logout({ logoutParams: { returnTo: process.env.NEXT_PUBLIC_DOMAIN } })}>
                                <LogOut className="h-4 w-4" />
                                Log out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                </SidebarMenuItem>
            }
        </SidebarMenu>
    )
}
