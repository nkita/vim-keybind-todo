'use client'

import { Todo } from "@/components/todo";
import { useState, useEffect, useContext } from "react"
import { TodoProps, SaveTodosReturnProps, ProjectProps, LabelProps } from "@/types"
import { useAuth0 } from "@auth0/auth0-react";
import { useFetchTodo, postFetch, useFetchProjects, useFetchLabels } from "@/lib/fetch";
import { debounce } from "@/lib/utils";
import { postSaveTodos } from "@/lib/todo";
import { TodoContext } from "@/provider/todo";
import { useLocalStorage } from "@/hook/useLocalStrorage";
import AppPageTemplate from "@/components/app-page-template";
import { useSidebar } from "@/components/ui/sidebar";

export default function Home() {
  const [todos, setTodos] = useState<TodoProps[]>([])
  const [todosLS, setTodosLS] = useLocalStorage<TodoProps[]>("todo_data", [])
  const [prevTodos, setPrevTodos] = useState<TodoProps[]>([])

  const [projects, setProjects] = useState<ProjectProps[]>([])
  const [projectsLS, setProjectsLS] = useLocalStorage<ProjectProps[]>("todo_projects", [])

  const [labels, setLabels] = useState<LabelProps[]>([])
  const [labelsLS, setLabelsLS] = useLocalStorage<LabelProps[]>("todo_labels", [])

  const [isSave, setIsSave] = useState(false)
  const [isUpdate, setIsUpdate] = useState(false)

  const [todosLoading, setTodosLoading] = useState(true)
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [labelsLoading, setLabelsLoading] = useState(true)

  const config = useContext(TodoContext)
  const [isLoginLoading, setIsLoginLoading] = useState(true)
  const [isLogin, setIsLogin] = useState(true)
  useEffect(() => {
    if (isLoginLoading && !config.isLoading) {
      setIsLoginLoading(config.isLoading)
      setIsLogin(config.isLogin)
    }
  }, [isLoginLoading, config])


  const { data: fetch_todo, isLoading: fetch_todo_loading } = useFetchTodo(config.list, config.token)
  const { data: fetch_projects, isLoading: fetch_projects_loading } = useFetchProjects(config.list, config.token)
  const { data: fetch_labels, isLoading: fetch_labels_loading } = useFetchLabels(config.list, config.token)

  const { user, isLoading: userLoading } = useAuth0();
  const { open } = useSidebar()

  useEffect(() => {
    if (!userLoading && user === undefined) {
      setTodosLoading(false)
      setPrevTodos([...todosLS])
    }
  }, [user, userLoading, todosLS])

  useEffect(() => {
    try {
      if (fetch_todo !== undefined && config.token && config.list) {
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
    try {
      if (fetch_projects !== undefined && config.token && config.list) {
        setProjects(fetch_projects)
        setProjectsLoading(false)
      }
    } catch (e) {
      console.error(e)
      setProjectsLoading(false)
    }
  }, [fetch_projects, config, projectsLoading])


  useEffect(() => {
    try {
      if (fetch_labels !== undefined && config.token && config.list) {
        setLabels(fetch_labels)
        setLabelsLoading(false)
      }
    } catch (e) {
      console.error(e)
      setLabelsLoading(false)
    }
  }, [fetch_labels, config, labelsLoading])

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

  useEffect(() => {
    if (!userLoading && !user && isUpdate) {
      setIsUpdate(false)
      setTodos([...todosLS])
      setPrevTodos([...todosLS])
      setProjects([...projectsLS])
    }
  }, [user, userLoading, todosLS, isUpdate, projectsLS])

  const handleClickSaveButton = () => handleSaveTodos(todos, prevTodos, config.list, config.token, isUpdate)
  return (
    <AppPageTemplate>
      <article className={`h-screen w-screen ${open ? "md:w-[calc(100vw-16rem)]" : "md:w-[calc(100vw-3rem)]"}`}>
        <Todo
          todos={!isLoginLoading && isLogin ? todos : todosLS}
          prevTodos={prevTodos}
          exProjects={!isLoginLoading && isLogin ? projects : projectsLS}
          exLabels={!isLoginLoading && isLogin ? labels : labelsLS}
          isSave={isSave}
          isUpdate={isUpdate}
          loading={todosLoading || isLoginLoading || fetch_todo_loading || fetch_projects_loading}
          setTodos={!isLoginLoading && isLogin ? setTodos : setTodosLS}
          setIsUpdate={setIsUpdate}
          setExProjects={!isLoginLoading && isLogin ? setProjects : setProjectsLS}
          setExLabels={!isLoginLoading && isLogin ? setLabels : setLabelsLS}
          onClickSaveButton={handleClickSaveButton}
        />
      </article >
    </AppPageTemplate>
  );
}
