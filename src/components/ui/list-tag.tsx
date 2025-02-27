import { cn } from "@/lib/utils";

export const ListTag = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={cn(`whitespace-nowrap gap-1 flex items-center text-4sm px-2 bg-card backdrop-blur-sm text-muted-foreground border shadow-sm rounded-sm`, className)}>
            {children}
        </div>
    )
}