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

export default function Home() {
  const { getAccessTokenSilently, user, isLoading: userLoading } = useAuth0();
  const [token, setToken] = useState("")
  const [currentListID, setCurrentListID] = useState("")
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
  const [listLoading, setListLoading] = useState(true)
  const { data: fetch_list } = useFetchList("", token)
  const { data: fetch_todo, isLoading: fetch_todo_loading } = useFetchCompletedTodo(currentListID, 1, token)
  // const { data: fetch_completion_todo, isLoading: fetch_completion_todo_loading } = useFetchCompletedTodo(currentListID, 1, token)

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
        const apiListURL = `${process.env.NEXT_PUBLIC_API}/api/list`
        if (fetch_list === null) {
          postFetch(apiListURL, token, { name: "first list" })
          mutate(apiListURL)
          setListLoading(false)
        } else if (fetch_list && fetch_list.length > 0) {
          setCurrentListID(fetch_list[0].id)
          mutate(`${apiListURL}/list/todo`)
          setListLoading(false)
        }
      }
    } catch (e) {
      console.error(e)
      setListLoading(false)
    }
  }, [fetch_list, token])

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
    // setProjects(prevProjects => Array.from(new Set([...prevProjects, ..._p])));
    // setLabels(prevLabels => Array.from(new Set([...prevLabels, ..._l])))
  }, [todos])


  const handleSaveTodos = async (
    todos: TodoProps[],
    prevTodos: TodoProps[],
    listID: string,
    token: string,
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
  const saveTodos = useCallback(debounce((todos, prevTodos, listID, token, isUpdate) => handleSaveTodos(todos, prevTodos, listID, token, isUpdate), 3000), [])

  useEffect(() => {
    if (token && currentListID && isUpdate) {
      saveTodos(todos, prevTodos, currentListID, token, isUpdate)
    }
  }, [saveTodos, isUpdate, todos, token, prevTodos, currentListID])
  //***

  const handleClickSaveButton = () => handleSaveTodos(todos, prevTodos, currentListID, token, isUpdate)
  const mainPCHeight = `h-[calc(100vh-90px)]` // 100vh - headerHeight
  return (
    <>
      <Header user={user} userLoading={userLoading} isSave={isSave} isUpdate={isUpdate} onClickSaveButton={handleClickSaveButton} />
      <article className={`${mainPCHeight} bg-muted/10`}>
        <div className={`w-full h-full`}>
          <Todo
            todos={!userLoading && user ? todos : todosLS}
            prevTodos={prevTodos}
            filterdTodos={filterdTodos}
            mode={mode}
            sort={sort}
            loading={listLoading || todosLoading || userLoading || fetch_todo_loading}
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
          />
        </div>
      </article >
    </>
  );
}
