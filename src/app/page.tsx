'use client'
import { Todo } from "@/components/todo";
import { useState, MouseEvent, ChangeEvent, useEffect, } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import { Usage } from "@/components/usage";
import { FaUser, FaGear, FaArrowRightFromBracket, FaRegSquarePlus, FaPlus, FaRotate, FaTrash } from "react-icons/fa6";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { FaPlusCircle } from "react-icons/fa";

export default function Home() {
  const [todos, setTodos] = useState<TodoProps[]>([
    { id: 0, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 1, text: 'プロジェクトAの締め切り日に対してメールするがどうなるんだろう。おかしいな', priority: 'b', project: "job", context: "family", creationDate: "2024-01-10" },
    { id: 2, text: '締切日までに作品仕上げる', priority: 'A', project: "hobby", },
    { id: 3, text: '材料を買う', project: "hobby", creationDate: "2024-01-10" },
    { id: 4, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 14, text: 'プロジェクトAの締め切り日に対してメールする', priority: 'b', project: "job", context: "family", creationDate: "2024-01-10" },
    { id: 12, text: '締切日までに作品仕上げる', priority: 'A', project: "hobby", },
    { id: 13, text: '材料を買う', project: "hobby", creationDate: "2024-01-10" },
    { id: 10, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", completionDate: "2024-01-12", creationDate: "2024-01-10" },
    { id: 20, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 21, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 30, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 31, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 40, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 41, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 50, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 52, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 60, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 80, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
    { id: 90, text: '家に帰って電話する', priority: 'c', project: "private", context: "family", creationDate: "2024-01-10" },
  ])
  const [filterdTodos, setFilterdTodos] = useState<TodoProps[]>(todos)
  const [mode, setMode] = useState<Mode>('normal')
  const [sort, setSort] = useState<Sort>(undefined)
  const [isHelp, setHelp] = useState(true)

  const handleToggleHelp = () => setHelp(!isHelp)

  return (
    <article className="flex flex-col justify-between h-screen bg-sky-50/50">
      <div className="flex justify-between items-center w-full py-2 px-4">
        <div className="flex  items-center gap-2">
          <h1 className="border p-1 rounded-md bg-primary text-primary-foreground">Fast Todo</h1>
          <h2 className="font-medium">新しいタスク</h2>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full">
            <Avatar>
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-2 w-56">
            <DropdownMenuLabel className=" text-center">
              <div className="flex justify-center p-4">
                <Avatar className="scale-125">
                  <AvatarImage src="" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </div>
              <span>
                Your Name
              </span>
              <br />
              <span className="text-muted-foreground font-light">sample@example.com</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <FaRotate className="mr-2 h-4 w-4" /><span>Todoを切り替え</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FaPlus className="mr-2 h-4 w-4" /><span>新しいTodoを作成</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FaTrash className="mr-2 h-4 w-4" /><span>現在のTodoを削除</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <FaGear className="mr-2 h-4 w-4" /><span>設定</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FaArrowRightFromBracket className="mr-2 h-4 w-4" /><span>ログアウト</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className={`px-4 w-full ${isHelp ? "h-screen sm:h-[calc(100vh-350px)]" : "h-screen"} `}>
        <Todo
          todos={todos}
          filterdTodos={filterdTodos}
          mode={mode}
          sort={sort}
          setTodos={setTodos}
          setFilterdTodos={setFilterdTodos}
          setMode={setMode}
          setSort={setSort}
          toggleHelp={handleToggleHelp}
        />
      </div>
      <div className={`w-full p-4 ${isHelp ? "hidden sm:block sm:h-[350px]" : "hidden"} border-t shadow-lg rounded-t-3xl bg-popover text-popover-foreground`}>
        <h1 className="p-2 text-sm font-semibold text-center">ショートカット</h1>
        <Usage
          sort={sort}
          mode={mode}
          isTodos={filterdTodos.length > 0}
        />
      </div>
    </article >
  );
}
