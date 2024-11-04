import * as React from "react"

import { cn } from "@/lib/utils"
import { ArrowLeftRight, ArrowUpDown, Check, Edit, Plus } from "lucide-react"


type exTableProps = {
  index?: number | undefined
}
export interface TableProps
  extends React.InputHTMLAttributes<HTMLTableElement>,
  exTableProps { }

const Table = React.forwardRef<
  HTMLTableElement,
  TableProps
>(({ className, index, ...props }, ref) => {
  const _ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (_ref.current && index !== undefined && index < 3) _ref.current.scrollTop = 0
  }, [index])

  return (
    <>
      <div className={cn("flex flex-col justify-between overflow-auto scroll-bar", className)} ref={_ref}>
        <table
          ref={ref}
          className={"w-full caption-bottom text-sm table-fixed"}
          {...props}
        />
        <section className="w-full h-[150px] hidden sm:flex gap-8 md:gap-4 text-xs text-muted-foreground truncate justify-center items-center">
          <div className="flex flex-col h-full justify-center items-center gap-2">
            <kbd>k</kbd>
            <span className="flex flex-col items-center"><ArrowUpDown className="h-4" /><span className="hidden md:inline">タスクの移動</span></span>
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
      </div>
    </>
  )
})
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b sticky", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-8 px-1 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-1 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
