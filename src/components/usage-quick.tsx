'use client'
import { ArrowLeftRight, ArrowDown, Edit, Check, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export const QuickUsage = ({ className }: { className?: string }) => {

    return (
        <section className={cn(" w-full hidden sm:flex gap-8 md:gap-4 text-4sm text-muted-foreground truncate justify-center items-center  opacity-80", className)}>
            <div className="flex flex-col h-full justify-center items-center gap-2">
                <kbd>k</kbd>
                <span className="flex flex-col items-center"><ArrowDown className="h-4" /><span className="hidden md:inline">タスクの移動</span></span>
                <kbd>j</kbd>
            </div>
            <div className="flex flex-col justify-center items-center gap-2 h-full">
                <div className="flex gap-2 items-center">
                    <kbd>h</kbd>
                    <ArrowLeftRight className="h-4" />
                    <kbd>l</kbd>
                </div>
                <span className="hidden md:inline">プロジェクトの移動</span>
            </div>
            <div className="flex flex-col justify-center items-start gap-2 h-full">
                <div className="flex gap-2 items-center">
                    <Edit className="h-4" />
                    <kbd>Enter</kbd>
                    <span className="hidden md:inline">タスクの編集</span>
                </div>
                <div className="flex gap-2 items-center">
                    <Check className="h-4" />
                    <kbd>Space</kbd>
                    <span className="hidden md:inline">タスクの完了</span>
                </div>
                <div className="flex gap-2 items-center">
                    <Plus className="h-4" />
                    <kbd>I</kbd>
                    <span className="hidden md:inline">タスクの追加（先頭へ）</span>
                </div>
            </div>
        </section>
    )
}