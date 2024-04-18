'use client'
import { Todo } from "@/components/todo";
import { useState, MouseEvent, ChangeEvent, useEffect, } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import { Usage } from "@/components/usage";
import { useHotkeys } from "react-hotkeys-hook";
export default function Home() {
  const [todos, setTodos] = useState<TodoProps[]>([
    { id: 0, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
    { id: 1, text: 'プロジェクトAの締め切り日に対してメールする', priority: 'b', project: "job", context: "family" },
    { id: 2, text: '締切日までに作品仕上げる', priority: 'A', project: "hobby", },
    { id: 3, text: '材料を買う', project: "hobby" },
    { id: 4, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
    { id: 14, text: 'プロジェクトAの締め切り日に対してメールする', priority: 'b', project: "job", context: "family" },
    { id: 12, text: '締切日までに作品仕上げる', priority: 'A', project: "hobby", },
    { id: 13, text: '材料を買う', project: "hobby" },
    { id: 10, text: '家に帰って電話する', priority: 'c', project: "private", context: "family" },
  ])
  const [filterdTodos, setFilterdTodos] = useState<TodoProps[]>(todos)
  const [mode, setMode] = useState<Mode>('normal')
  const [sort, setSort] = useState<Sort>(undefined)

  return (
    <>
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
      <Usage
        sort={sort}
        mode={mode}
        isTodos={filterdTodos.length > 0}
      />
    </>
  );
}
