'use client'

import { Todo } from "@/components/todo";
import { useState, useEffect, useCallback } from "react"
import { TodoProps, Sort, Mode } from "@/types"
import Header from "@/components/header";
import { mutate } from "swr";
import { useAuth0 } from "@auth0/auth0-react";
import { useFetchList, useFetchTodo, useFetchCompletedTodo, postFetch } from "@/lib/fetch";
import { debounce } from "@/lib/utils";
import { todoFunc } from "@/lib/todo";
import { useLocalStorage } from "@/hook/useLocalStrorage";
import { completionTaskProjectName } from "@/components/config";

export default function Home() {
  const { getAccessTokenSilently, user, isLoading: userLoading } = useAuth0();
  const [token, setToken] = useState("")
  const [currentListID, setCurrentListID] = useState("")
  const [todos, setTodos] = useState<TodoProps[]>([])
  const [completionTodos, setCompletionTodos] = useState<TodoProps[]>([])
  const [todosLS, setTodosLS] = useLocalStorage<TodoProps[]>("todo_data", [])
  const [prevTodos, setPrevTodos] = useState<TodoProps[]>([])
  const [completionPrevTodos, setCompletionPrevTodos] = useState<TodoProps[]>([])
  const [isSave, setIsSave] = useState(false)
  const [isUpdate, setIsUpdate] = useState(false)
  const [filterdTodos, setFilterdTodos] = useState<TodoProps[]>(todos)
  const [mode, setMode] = useState<Mode>('normal')
  const [sort, setSort] = useLocalStorage<Sort>("sort-ls-key", undefined)

  const [projects, setProjects] = useState<string[]>([])
  const [labels, setLabels] = useState<string[]>([])
  const [currentProject, setCurrentProject] = useState("")
  const [isCompletionTasks, setIsCompletionTasks] = useState(false)

  const [todosLoading, setTodosLoading] = useState(true)
  const [listLoading, setListLoading] = useState(true)
  const { data: list } = useFetchList("", token)
  const { data: fetch_todo, isLoading: fetch_todo_loading } = useFetchTodo(currentListID, token)
  const { data: fetch_completion_todo, isLoading: fetch_completion_todo_loading } = useFetchCompletedTodo(currentListID, 1, token)

  useEffect(() => {
    async function getToken() {
      try {
        const token = await getAccessTokenSilently()
        if (token) {
          setToken(token)
        }
      } catch (e) {
        setListLoading(false)
        setTodosLoading(false)
      }
    }
    getToken()
  }, [getAccessTokenSilently])

  useEffect(() => {
    try {
      if (token) {
        if (list === null) {
          const apiListURL = `${process.env.NEXT_PUBLIC_API}/api/list`
          postFetch(apiListURL, token, { name: "first list" })
          mutate(apiListURL)
          setListLoading(false)
        } else if (list && list.length > 0) {
          setCurrentListID(list[0].id)
          setListLoading(false)
        }
      }
    } catch (e) {
      console.error(e)
      setListLoading(false)
    }
  }, [list, token])

  useEffect(() => {
    try {
      if (fetch_todo && token && currentListID) {
        setTodos(fetch_todo)
        setPrevTodos(fetch_todo)
        setTodosLoading(false)
      }
    } catch (e) {
      console.error(e)
      setTodosLoading(false)
    }
  }, [user, userLoading, fetch_todo, token, currentListID])

  useEffect(() => {
    try {
      if (fetch_completion_todo && token && currentListID) {
        setCompletionTodos(fetch_completion_todo)
        setCompletionPrevTodos(fetch_completion_todo)
      }
    } catch (e) {
      console.error(e)
    }
  }, [user, userLoading, fetch_completion_todo, token, currentListID])


  useEffect(() => {
    let projects: (string | undefined)[] = []
    let labels: (string | undefined)[] = []
    todos.forEach(t => {
      projects.push(t.project)
      labels.push(t.context)
    })
    const _p = projects.filter(p => p !== undefined && p !== "") as string[];
    const _l = labels.filter(l => l !== undefined && l !== "") as string[];
    setProjects(Array.from(new Set([..._p, completionTaskProjectName])));
    setLabels(Array.from(new Set([..._l])))
    // setProjects(prevProjects => Array.from(new Set([...prevProjects, ..._p])));
    // setLabels(prevLabels => Array.from(new Set([...prevLabels, ..._l])))
  }, [todos])

  useEffect(() => {
    setIsCompletionTasks(currentProject === completionTaskProjectName)
  }, [currentProject])

  const handleSaveTodos = async (
    todos: TodoProps[],
    prevTodos: TodoProps[],
    listID: string,
    token: string,
    isUpdate: boolean,
    isCompletionTasks: boolean
  ) => {
    try {
      if (!isUpdate) return
      setIsSave(true)
      const api = `${process.env.NEXT_PUBLIC_API}/api/list/${listID}/todo`
      const postData = todoFunc.diff(todos, prevTodos).filter(d => !todoFunc.isEmpty(d))
      if (postData.length > 0) {
        postFetch(api, token, postData).then(_ => {
          isCompletionTasks ? setCompletionPrevTodos([...todos]) : setPrevTodos([...todos])
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
  const saveTodos = useCallback(debounce((todos, prevTodos, listID, token, isUpdate, isCompletionTasks) => handleSaveTodos(todos, prevTodos, listID, token, isUpdate, isCompletionTasks), 3000), [])

  useEffect(() => {
    if (token && currentListID && isUpdate) {
      isCompletionTasks ? saveTodos(completionTodos, completionPrevTodos, currentListID, token, isUpdate, isCompletionTasks) : saveTodos(todos, prevTodos, currentListID, token, isUpdate, isCompletionTasks)
    }
  }, [saveTodos, isUpdate, todos, completionTodos, token, prevTodos, completionPrevTodos, currentListID, isCompletionTasks])
  //***

  const handleClickSaveButton = () => handleSaveTodos(todos, prevTodos, currentListID, token, isUpdate)
  const headerHeight = "80px"
  const mainPCHeight = `h-[calc(100vh-80px)]` // 100vh - headerHeight
  return (
    <article className="h-screen bg-muted/10">
      <Header height={headerHeight} user={user} userLoading={userLoading} list={list} isSave={isSave} isUpdate={isUpdate} onClickSaveButton={handleClickSaveButton} />
      <div className={`w-full ${mainPCHeight}`}>
        <Todo
          todos={!userLoading && user ? isCompletionTasks ? completionTodos : todos : todosLS}
          prevTodos={isCompletionTasks ? completionPrevTodos : prevTodos}
          filterdTodos={filterdTodos}
          mode={mode}
          sort={sort}
          loading={listLoading || todosLoading || userLoading || fetch_todo_loading || fetch_completion_todo_loading}
          currentProject={currentProject}
          setTodos={!userLoading && user ? isCompletionTasks ? setCompletionTodos : setTodos : setTodosLS}
          projects={projects}
          labels={labels}
          setFilterdTodos={setFilterdTodos}
          setMode={setMode}
          setSort={setSort}
          setIsUpdate={setIsUpdate}
          setCurrentProject={setCurrentProject}
          onClickSaveButton={handleClickSaveButton}
        />
      </div>
    </article >
  );
}
