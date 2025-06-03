'use client'

import { Todo } from "@/components/todo";
import { useState, useEffect, useContext, useRef, useMemo, useCallback } from "react"
import { TodoProps, SaveTodosReturnProps, ProjectProps, LabelProps } from "@/types"
import { useAuth0 } from "@auth0/auth0-react";
import { useFetchTodo, postFetch, useFetchProjects, useFetchLabels } from "@/lib/fetch";
import { debounce } from "@/lib/utils";
import { postSaveTodos } from "@/lib/todo";
import { TodoContext } from "@/provider/todo";
import { useLocalStorage } from "@/hook/useLocalStrorage";
import AppPageTemplate from "@/components/app-page-template";
import { useSidebar } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Home() {
  const [todos, setTodos] = useState<TodoProps[]>([])
  const [todosLS, setTodosLS] = useLocalStorage<TodoProps[]>("data", [])
  const [prevTodos, setPrevTodos] = useState<TodoProps[]>([])

  const [projects, setProjects] = useState<ProjectProps[]>([])
  const [projectsLS, setProjectsLS] = useLocalStorage<ProjectProps[]>("projects", [])

  const [labels, setLabels] = useState<LabelProps[]>([])
  const [labelsLS, setLabelsLS] = useLocalStorage<LabelProps[]>("labels", [])

  const [isSave, setIsSave] = useState(false)
  const [isUpdate, setIsUpdate] = useState(false)

  const [todosLoading, setTodosLoading] = useState(true)
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [labelsLoading, setLabelsLoading] = useState(true)

  const [isError, setIsError] = useState(false)

  const [isLocalMode, setIsLocalMode] = useState(false)

  const config = useContext(TodoContext)
  const [isLoginLoading, setIsLoginLoading] = useState(true)
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter();

  useEffect(() => {
    if (isLoginLoading && !config.isLoading) {
      setIsLoginLoading(config.isLoading)
      setIsLogin(config.isLogin)
      setIsLocalMode(!config.isLoading && !config.isLogin)
    }
  }, [isLoginLoading, config])


  const { data: fetch_todo, isLoading: fetch_todo_loading } = useFetchTodo(config.list, config.token)
  const { data: fetch_projects, isLoading: fetch_projects_loading } = useFetchProjects(config.list, config.token)
  const { data: fetch_labels, isLoading: fetch_labels_loading } = useFetchLabels(config.list, config.token)

  const { user, isLoading: userLoading, logout } = useAuth0();
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

  const handleSaveTodos = async (todos: TodoProps[],
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

  // isUpdateの参照を保持するref
  const isUpdateRef = useRef(isUpdate);
  const isSaveRef = useRef(isSave);

  // isUpdateが変更されたらrefを更新
  useEffect(() => {
    isUpdateRef.current = isUpdate;
    isSaveRef.current = isSave;
  }, [isUpdate, isSave]);

  const debouncedSave = useMemo(
    () => debounce((
      todos: TodoProps[],
      prevTodos: TodoProps[],
      listID: string | null,
      token: string | null
    ) => {
      if (isUpdateRef.current && !isSaveRef.current) {
        handleSaveTodos(todos, prevTodos, listID, token, true);
      }
    }, 5000),
    [] // 依存配列を空に
  );

  const saveTodos = useCallback(
    (todos: TodoProps[], prevTodos: TodoProps[], listID: string | null, token: string | null) => {
      debouncedSave(todos, prevTodos, listID, token);
    },
    [debouncedSave]
  );

  useEffect(() => {
    if (config.token && config.list && isUpdate && !isSave) {
      // isUpdateを引数から除去
      saveTodos(todos, prevTodos, config.list, config.token);
    }
  }, [todos, config.token, config.list, isUpdate, isSave, saveTodos, prevTodos]);

  // エラー処理用のuseEffect
  useEffect(() => {
    if (config.error && !isError) {
      if (!config.token) {
        toast.error(config.error, { duration: 5000, description: "ユーザーを認証できませんでした。ログアウトします。" })
        logout({
          logoutParams: {
            returnTo: `${window.location.origin}/app/t`
          }
        })
        setIsError(true)
        setIsLocalMode(true)
      } else {
        toast.error(config.error, { duration: 5000, description: "ローカルモードに移行します。オンラインモードへの切り替えは画面更新か、時間をおいてから再度お試しください。" })
        setIsError(true)
        setIsLocalMode(true)
      }
    }
    if (!config.error && isError) {
      setIsError(false)
      toast.success("エラーが解消されました。", { duration: 5000, description: "画面更新してください。" })
    }
  }, [config.error, isError, config.token, logout]);

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
          todos={isLocalMode ? todosLS : todos}
          prevTodos={prevTodos}
          exProjects={isLocalMode ? projectsLS : projects}
          exLabels={isLocalMode ? labelsLS : labels}
          isLocalMode={isLocalMode}
          isSave={isSave}
          isUpdate={isUpdate}
          contextMode={config.mode}
          loading={isLocalMode ? false : (todosLoading || isLoginLoading || fetch_todo_loading || fetch_projects_loading)}
          setTodos={isLocalMode ? setTodosLS : setTodos}
          setIsUpdate={setIsUpdate}
          setExProjects={isLocalMode ? setProjectsLS : setProjects}
          setExLabels={isLocalMode ? setLabelsLS : setLabels}
          onClickSaveButton={handleClickSaveButton}
        />
      </article >
    </AppPageTemplate>
  );
}
