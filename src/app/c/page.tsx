'use client'

import { Todo } from "@/components/todo";
import { useState, useEffect, useContext } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import Header from "@/components/header";
import { useFetchCompletedTodo, postFetch } from "@/lib/fetch";
import { debounce } from "@/lib/utils";
import { todoFunc } from "@/lib/todo";
import { useLocalStorage } from "@/hook/useLocalStrorage";
import { TodoContext } from "@/provider/todo";
import { useAuth0 } from "@auth0/auth0-react";
export default function Home() {
  const [todos, setTodos] = useState<TodoProps[]>([])
  const [todosLS, setTodosLS] = useLocalStorage<TodoProps[]>("todo_data", [])
  const [prevTodos, setPrevTodos] = useState<TodoProps[]>([])
  const [isSave, setIsSave] = useState(false)
  const [isUpdate, setIsUpdate] = useState(false)
  const [filterdTodos, setFilterdTodos] = useState<TodoProps[]>(todos)
  const [mode, setMode] = useState<Mode>('normal')
  const [sort, setSort] = useLocalStorage<Sort>("sort-ls-key", undefined)

  const [projects, setProjects] = useState<string[]>([])
  const [labels, setLabels] = useState<string[]>([])
  const [currentProject, setCurrentProject] = useState("")

  const [todosLoading, setTodosLoading] = useState(true)
  const config = useContext(TodoContext)
  const { data: fetch_todo, isLoading: fetch_todo_loading } = useFetchCompletedTodo(config.list, 1, config.token)
  const { user, isLoading: userLoading } = useAuth0();

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


  useEffect(() => {
    let projects: (string | undefined)[] = []
    let labels: (string | undefined)[] = []
    todos.forEach(t => {
      projects.push(t.project)
      labels.push(t.context)
    })
    const _p = projects.filter(p => p !== undefined && p !== "") as string[];
    const _l = labels.filter(l => l !== undefined && l !== "") as string[];
    setProjects(Array.from(new Set([..._p])));
    setLabels(Array.from(new Set([..._l])))
  }, [todos])


  const handleSaveTodos = async (
    todos: TodoProps[],
    prevTodos: TodoProps[],
    listID: string | null,
    token: string | null,
    isUpdate: boolean,
  ) => {
    try {
      if (!isUpdate) return
      setIsSave(true)
      const api = `${process.env.NEXT_PUBLIC_API}/api/list/${listID}/todo`
      const postData = todoFunc.diff(todos, prevTodos).filter(d => !todoFunc.isEmpty(d))
      if (postData.length > 0) {
        postFetch(api, token, postData).then(_ => {
          setPrevTodos([...todos])
          setIsUpdate(false)
        }).catch(e => console.error(e)).finally(() => {
          setIsSave(false)
          // mutate(api)
        })
      } else {
        setIsSave(false)
        setIsUpdate(false)
      }
    } catch (e) {
      console.error(e)
    }
  }

  /**
   * オートセーブ
   * */
  const saveTodos = debounce((todos, prevTodos, listID, token, isUpdate) => handleSaveTodos(todos, prevTodos, listID, token, isUpdate), 3000)

  useEffect(() => {
    if (config.token && config.list && isUpdate) {
      saveTodos(todos, prevTodos, config.list, config.token, isUpdate)
    }
  }, [saveTodos, isUpdate, todos, config, prevTodos])
  //***

  const handleClickSaveButton = () => handleSaveTodos(todos, prevTodos, config.list, config.token, isUpdate)
  const mainPCHeight = `h-[calc(100vh-90px)]` // 100vh - headerHeight
  return (
    <>
      <Header user={user} userLoading={userLoading} isSave={isSave} isUpdate={isUpdate} onClickSaveButton={handleClickSaveButton} />
      <article className={`${mainPCHeight} bg-muted/10`}>
        <div className={`w-full h-full`}>
          <Todo
            todos={!userLoading && user ? todos : []}
            prevTodos={prevTodos}
            filterdTodos={filterdTodos}
            mode={mode}
            sort={sort}
            loading={todosLoading || userLoading || fetch_todo_loading}
            currentProject={currentProject}
            setTodos={!userLoading && user ? setTodos : setTodosLS}
            projects={projects}
            labels={labels}
            setFilterdTodos={setFilterdTodos}
            setMode={setMode}
            setSort={setSort}
            setIsUpdate={setIsUpdate}
            setCurrentProject={setCurrentProject}
            onClickSaveButton={handleClickSaveButton}
            completionOnly
          />
        </div>
      </article >
    </>
  );
}
