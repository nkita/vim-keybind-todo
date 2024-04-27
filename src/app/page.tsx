'use client'
import { Todo } from "@/components/todo";
import { useState, MouseEvent, ChangeEvent, useEffect, } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import { Usage } from "@/components/usage";
export default function Home() {
  const [todos, setTodos] = useState<TodoProps[]>([
    { id: 0, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
    { id: 1, text: 'プロジェクトAの締め切り日に対してメールするがどうなるんだろう。おかしいな', priority: 'b', project: "job", context: "family" },
    { id: 2, text: '締切日までに作品仕上げる', priority: 'A', project: "hobby", },
    { id: 3, text: '材料を買う', project: "hobby" },
    { id: 4, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
    { id: 14, text: 'プロジェクトAの締め切り日に対してメールする', priority: 'b', project: "job", context: "family" },
    { id: 12, text: '締切日までに作品仕上げる', priority: 'A', project: "hobby", },
    { id: 13, text: '材料を買う', project: "hobby" },
    { id: 10, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
    { id: 20, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
    { id: 21, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
    { id: 30, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
    { id: 31, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
    { id: 40, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
    { id: 41, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
    { id: 50, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
    { id: 52, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
    { id: 60, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
    { id: 80, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
    { id: 90, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
  ])
  const [filterdTodos, setFilterdTodos] = useState<TodoProps[]>(todos)
  const [mode, setMode] = useState<Mode>('normal')
  const [sort, setSort] = useState<Sort>(undefined)

  return (
    <article className="flex justify-between">
      <div className="p-4 max-w-[1000px] h-screen">
        <Todo
          todos={todos}
          filterdTodos={filterdTodos}
          mode={mode}
          sort={sort}
          setTodos={setTodos}
          setFilterdTodos={setFilterdTodos}
          setMode={setMode}
          setSort={setSort}
        />
      </div>
      <div>
        <Usage
          sort={sort}
          mode={mode}
          isTodos={filterdTodos.length > 0}
        />
      </div>
    </article>
  );
}
