'use client'

import { Todo } from "@/components/todo";
import { useState, useEffect, useContext } from "react"
import { TodoProps, SaveTodosReturnProps } from "@/types"
import Header from "@/components/header";
import { useAuth0 } from "@auth0/auth0-react";
import { useFetchTodo, postFetch } from "@/lib/fetch";
import { debounce } from "@/lib/utils";
import { postSaveTodos } from "@/lib/todo";
import { TodoContext } from "@/provider/todo";
import { useLocalStorage } from "@/hook/useLocalStrorage";

export default function Home() {
  const [todos, setTodos] = useState<TodoProps[]>([])
  const [todosLS, setTodosLS] = useLocalStorage<TodoProps[]>("todo_data", [])
  const [prevTodos, setPrevTodos] = useState<TodoProps[]>([])
  const [isSave, setIsSave] = useState(false)
  const [isUpdate, setIsUpdate] = useState(false)

  const [todosLoading, setTodosLoading] = useState(true)
  const config = useContext(TodoContext)

  const { data: fetch_todo, isLoading: fetch_todo_loading } = useFetchTodo(config.list, config.token)
  const { user, isLoading: userLoading } = useAuth0();

  useEffect(() => {
    if (!userLoading && user === undefined) setTodosLoading(false)
  }, [user, userLoading])

  useEffect(() => {
    try {
      if (fetch_todo && config.token && config.list) {
        setTodos(fetch_todo)
        setPrevTodos(fetch_todo)
        setTodosLoading(false)
      }
    } catch (e) {
      console.error(e)
      setTodosLoading(false)
    }
  }, [fetch_todo, config, todosLoading])


  const handleSaveTodos = async (
    todos: TodoProps[],
    prevTodos: TodoProps[],
    listID: string | null,
    token: string | null,
    isUpdate: boolean,
  ) => {
    try {
      if (isUpdate) {
        setIsSave(true)
        postSaveTodos(todos, prevTodos, listID, token).then((r: SaveTodosReturnProps) => {
          if (r['action'] === 'save') {
            setIsUpdate(false)
            setPrevTodos([...todos])
          }
        }).finally(() => {
          setIsSave(false)
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * オートセーブ
   * */
  const saveTodos = debounce((todos, prevTodos, listID, token, isUpdate) => handleSaveTodos(todos, prevTodos, listID, token, isUpdate), 5000)

  useEffect(() => {
    if (config.token && config.list && isUpdate) {
      saveTodos(todos, prevTodos, config.list, config.token, isUpdate)
    }
  }, [saveTodos, isUpdate, todos, config, prevTodos])
  //***

  const handleClickSaveButton = () => handleSaveTodos(todos, prevTodos, config.list, config.token, isUpdate)
  const mainPCHeight = `h-[calc(100vh-70px)]` // 100vh - headerHeight
  return (
    <>
      <Header user={user} userLoading={userLoading} isSave={isSave} isUpdate={isUpdate} onClickSaveButton={handleClickSaveButton} />
      <article className={`${mainPCHeight} bg-muted/10`}>
        <div className={`w-full h-full`}>
          <Todo
            todos={!userLoading && user ? todos : todosLS}
            prevTodos={prevTodos}
            loading={todosLoading || userLoading || fetch_todo_loading}
            setTodos={!userLoading && user ? setTodos : setTodosLS}
            setIsUpdate={setIsUpdate}
            onClickSaveButton={handleClickSaveButton}
          />
        </div>
      </article >
    </>
  );
}
