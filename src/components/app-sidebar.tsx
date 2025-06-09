'use client'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Bell, Bike, ExternalLink, GanttChart, LineChart, List, ListTodo, PanelLeftClose, PawPrint, ChevronDown, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { NavUser } from "./app-sidebar-user"
import React, { useEffect, useState } from "react"
import { GitHubLogoIcon } from "@radix-ui/react-icons"
import { FaXTwitter } from "react-icons/fa6"
import { usePathname } from "next/navigation"
import { useTodoContext } from "@/hook/useTodoContext"
import { useOfflineTodoContext } from "@/provider/offline-todo"
import { createAppMode } from "@/types/todo-context"
import { Modal } from "./ui/modal"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
import { Input } from "./ui/input"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { getFetch, postFetch, deleteFetch, useFetchList } from "@/lib/fetch";
import { mutate } from "swr";
import { toast } from "sonner"

const listSchema = z.object({
    name: z.string().min(1, { message: "リスト名を入力してください" }),
})

const baseUrl = `${process.env.NEXT_PUBLIC_API}/api/list`

export function AppSidebar() {
    const {
        open,
        toggleSidebar,
    } = useSidebar()

    // オフライン対応のコンテキストを使用
    const context = useOfflineTodoContext()
    const { currentList, lists, auth, mode, actions, computed } = context
    
    // 互換性のための変数マッピング
    const list = currentList
    const isLoading = computed.isLoading
    const isLogin = computed.isAuthenticated
    const isOffline = computed.isOffline || false
    const listData = lists.status === 'success' ? lists.data : []
    const setListId = actions.setListId
    const setMode = actions.setMode
    const [isListOpen, setIsListOpen] = useState(true)

    // モーダル関連の状態
    const [modalType, setModalType] = useState<'add' | 'edit' | 'delete' | null>(null)
    const [selectedList, setSelectedList] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const form = useForm<z.infer<typeof listSchema>>({
        resolver: zodResolver(listSchema),
        defaultValues: {
            name: "",
        },
    })

    // モーダルを開く関数
    const openModal = (type: 'add' | 'edit' | 'delete', listItem?: any) => {
        setModalType(type)
        setSelectedList(listItem || null)
        setIsModalOpen(true)
        setMode(createAppMode('modal'))

        if (type === 'edit' && listItem) {
            form.setValue('name', listItem.name)
        } else {
            form.reset()
        }
    }

    // モーダルを閉じる関数
    const closeModal = () => {
        setModalType(null)
        setSelectedList(null)
        setIsModalOpen(false)
        setMode(null)
        form.reset()
    }

    // フォーム送信処理
    const onSubmit = async (values: z.infer<typeof listSchema>) => {
        try {
            if (modalType === 'add') {
                // リスト追加のロジック
                await actions.createList(values.name)
                if (!isLogin || !navigator.onLine) {
                    toast.success(`リスト「${values.name}」を追加しました（オフライン）`)
                } else {
                    toast.success(`リスト「${values.name}」を追加しました`)
                }
                // リストを再読み込み
                await actions.refreshLists()
            } else if (modalType === 'edit' && selectedList) {
                // リスト編集のロジック
                await actions.updateList(selectedList.id, values.name)
                if (!isLogin || !navigator.onLine) {
                    toast.success(`リスト「${values.name}」を更新しました（オフライン）`)
                } else {
                    toast.success(`リスト「${values.name}」を更新しました`)
                }
                // リストを再読み込み
                await actions.refreshLists()
            }
            closeModal()
        } catch (error) {
            console.error('API call failed:', error)
            toast.error('処理中にエラーが発生しました')
        }
    }

    // 削除処理
    const handleDelete = async () => {
        if (selectedList) {
            try {
                await actions.deleteList(selectedList.id)
                if (!isLogin || !navigator.onLine) {
                    toast.success(`リスト「${selectedList.name}」を削除しました（オフライン）`)
                } else {
                    toast.success(`リスト「${selectedList.name}」を削除しました`)
                }
                // リストを再読み込み
                await actions.refreshLists()
                closeModal()
            } catch (error) {
                console.error('Delete failed:', error)
                toast.error('削除処理中にエラーが発生しました')
            }
        }
    }

    // モーダルタイトルとボタンテキストを取得
    const getModalTitle = () => {
        switch (modalType) {
            case 'add': return '新しいリスト'
            case 'edit': return 'リストを編集'
            case 'delete': return 'リストを削除'
            default: return ''
        }
    }

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
                        <SidebarGroupLabel>List {(!isLogin || !navigator.onLine) && <span className="text-xs text-muted-foreground ml-1">(オフライン)</span>}</SidebarGroupLabel>
                        {listData && listData.length > 0 && (
                            <>
                                <SidebarMenuItem>
                                    <SidebarMenuButton onClick={() => setIsListOpen(!isListOpen)}>
                                        <List className="w-4 h-4" />
                                        <span>リスト</span>
                                        <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${isListOpen ? "rotate-180" : ""}`} />
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                {isListOpen && open &&
                                    <>
                                        {listData.map(l => (
                                            <SidebarMenuItem key={l.id} className="group relative">
                                                <SidebarMenuButton onClick={() => setListId(l.id)} className={`${list === l.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""} pr-20`}>
                                                    <span className="w-4 h-4 flex items-center justify-center font-medium border rounded-full p-2">{l.name.charAt(0)}</span>
                                                    <span>{l.name}</span>
                                                </SidebarMenuButton>
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                                                    <button
                                                        className="h-4 w-4 flex items-center justify-center transition-colors group"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openModal('edit', l);
                                                        }}
                                                        title="リストを編集"
                                                    >
                                                        <Pencil className="h-4 w-4 hover:scale-110" />
                                                    </button>
                                                    <button
                                                        className="h-4 w-4 flex items-center justify-center transition-colors group"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            openModal('delete', l);
                                                        }}
                                                        title="リストを削除"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive/90 hover:scale-110 transition-colors" />
                                                    </button>
                                                </div>
                                            </SidebarMenuItem>
                                        ))}
                                        <SidebarMenuItem>
                                            <SidebarMenuButton
                                                onClick={() => openModal('add')}
                                                className="text-accent hover:text-foreground hover:border-primary/50 transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>新しいリスト</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    </>
                                }
                            </>
                        )}
                        {/* リストがない場合の表示 */}
                        {(!listData || listData.length === 0) && (
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    onClick={() => openModal('add')}
                                    className="text-sidebar-primary-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>最初のリストを作成</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )}
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
                                <div className="flex justify-between text-nowrap w-full items-center"><span>お知らせ</span></div>
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

            {/* モーダル */}
            <Modal
                buttonLabel=""
                dialogTitle={getModalTitle()}
                className="hidden"
                open={isModalOpen}
                onClickOpen={() => { }}
                onClickChange={closeModal}
            >
                {modalType === 'delete' ? (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            リスト「{selectedList?.name}」を削除しますか？
                            <br />
                            削除したリストは復元できません。
                        </p>
                        <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={closeModal}>
                                キャンセル
                            </Button>
                            <Button variant="destructive" onClick={handleDelete}>
                                削除する
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>リスト名</FormLabel>
                                        <FormControl>
                                            <Input placeholder="リスト名を入力" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={closeModal}>
                                    キャンセル
                                </Button>
                                <Button type="submit">
                                    {modalType === 'add' ? '作成' : '更新'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </Modal>
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