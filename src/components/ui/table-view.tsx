import * as React from "react"

import { cn } from "@/lib/utils"

type exTableViewProps = {
  index?: number | undefined
}
export interface TableViewProps
  extends React.InputHTMLAttributes<HTMLDivElement>,
  exTableViewProps { }

const TableView = React.forwardRef<
  HTMLDivElement,
  TableViewProps
>(({ className, index, ...props }, ref) => {

  return (
    <div
      ref={ref}
      className={cn("w-full text-sm ", className)}
      {...props}
    />
  )
})
TableView.displayName = "TableView"

const TableViewHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("[&_tr]:border-b sticky", className)} {...props} />
))
TableViewHeader.displayName = "TableViewHeader"

const TableViewBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("", className)}
    {...props}
  />
))
TableViewBody.displayName = "TableViewBody"

const TableViewFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium",
      className
    )}
    {...props}
  />
))
TableViewFooter.displayName = "TableViewFooter"

const TableViewRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      " flex items-center border-b",
      className
    )}
    {...props}
  />
))
TableViewRow.displayName = "TableViewRow"

const TableViewHead = React.forwardRef<
  HTMLDivElement,
  React.ThHTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "h-8 px-1 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
))
TableViewHead.displayName = "TableViewHead"

const TableViewCell = React.forwardRef<
  HTMLDivElement,
  React.TdHTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(" ", className)}
    {...props}
  />
))
TableViewCell.displayName = "TableViewCell"


export {
  TableView,
  TableViewHeader,
  TableViewBody,
  TableViewFooter,
  TableViewHead,
  TableViewRow,
  TableViewCell,
}
