'use client'

import { Todo } from "@/components/todo";
import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { TodoProps, SaveTodosReturnProps, ProjectProps, LabelProps } from "@/types"
import { useAuth0 } from "@auth0/auth0-react";
import { useFetchTodo, postFetch, useFetchProjects, useFetchLabels } from "@/lib/fetch";
import { debounce } from "@/lib/utils";
import { postSaveTodos } from "@/lib/todo";
import { useTodoContext } from "@/hook/useTodoContext";
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

  const config = useTodoContext()
  const [isLoginLoading, setIsLoginLoading] = useState(true)
  const [isLogin, setIsLogin] = useState(true)
  const router = useRouter();

  useEffect(() => {
    if (isLoginLoading && !config.computed.isLoading) {
      setIsLoginLoading(config.computed.isLoading)
      setIsLogin(config.computed.isAuthenticated)
      setIsLocalMode(!config.computed.isLoading && !config.computed.isAuthenticated)
    }
  }, [isLoginLoading, config.computed.isLoading, config.computed.isAuthenticated])


  const authToken = config.auth.type === 'authenticated' ? config.auth.token : null
  const { data: fetch_todo, isLoading: fetch_todo_loading } = useFetchTodo(config.currentList, authToken)
  const { data: fetch_projects, isLoading: fetch_projects_loading } = useFetchProjects(config.currentList, authToken)
  const { data: fetch_labels, isLoading: fetch_labels_loading } = useFetchLabels(config.currentList, authToken)

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
      if (fetch_todo !== undefined && authToken && config.currentList) {
        setTodos(fetch_todo)
        setPrevTodos(fetch_todo)
        setTodosLoading(false)
      }
    } catch (e) {
      console.error(e)
      setTodosLoading(false)
    }
  }, [fetch_todo, authToken, config.currentList, todosLoading])

  // リスト切り替え時にデータをクリア
  useEffect(() => {
    if (config.currentList && authToken) {
      setProjectsLoading(true)
      setLabelsLoading(true)
      setProjects([])
      setLabels([])
    }
  }, [config.currentList, authToken])

  // プロジェクトデータの更新
  useEffect(() => {
    if (fetch_projects !== undefined && authToken && config.currentList) {
      setProjects(fetch_projects)
      setProjectsLoading(false)
    } else if (!fetch_projects_loading && authToken && config.currentList) {
      // データが空の場合も明示的に設定
      setProjects([])
      setProjectsLoading(false)
    }
  }, [fetch_projects, fetch_projects_loading, authToken, config.currentList])

  // ラベルデータの更新
  useEffect(() => {
    if (fetch_labels !== undefined && authToken && config.currentList) {
      setLabels(fetch_labels)
      setLabelsLoading(false)
    } else if (!fetch_labels_loading && authToken && config.currentList) {
      // データが空の場合も明示的に設定
      setLabels([])
      setLabelsLoading(false)
    }
  }, [fetch_labels, fetch_labels_loading, authToken, config.currentList])

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
    if (authToken && config.currentList && isUpdate && !isSave) {
      // isUpdateを引数から除去
      saveTodos(todos, prevTodos, config.currentList, authToken);
    }
  }, [todos, authToken, config.currentList, isUpdate, isSave, saveTodos, prevTodos]);

  // エラー処理用のuseEffect
  useEffect(() => {
    const error = config.computed.error;
    if (error && !isError) {
      if (!authToken) {
        toast.error(error, { duration: 5000, description: "ユーザーを認証できませんでした。ログアウトします。" })
        logout({
          logoutParams: {
            returnTo: `${window.location.origin}/app/t`
          }
        })
        setIsError(true)
        setIsLocalMode(true)
      } else {
        toast.error(error, { duration: 5000, description: "ローカルモードに移行します。オンラインモードへの切り替えは画面更新か、時間をおいてから再度お試しください。" })
        setIsError(true)
        setIsLocalMode(true)
      }
    }
    if (!error && isError) {
      setIsError(false)
      toast.success("エラーが解消されました。", { duration: 5000, description: "画面更新してください。" })
    }
  }, [config.computed.error, isError, authToken, logout]);

  useEffect(() => {
    if (!userLoading && !user && isUpdate) {
      setIsUpdate(false)
      setTodos([...todosLS])
      setPrevTodos([...todosLS])
      setProjects([...projectsLS])
    }
  }, [user, userLoading, todosLS, isUpdate, projectsLS])

  const handleClickSaveButton = () => handleSaveTodos(todos, prevTodos, config.currentList, authToken, isUpdate)

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
          projectsLoading={isLocalMode ? false : (projectsLoading || fetch_projects_loading)}
          labelsLoading={isLocalMode ? false : (labelsLoading || fetch_labels_loading)}
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
