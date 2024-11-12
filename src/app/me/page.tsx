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
  const config = useContext(TodoContext)

  const { user, isLoading: userLoading } = useAuth0();

  const mainPCHeight = `h-[calc(100vh-70px)]` // 100vh - headerHeight
  return (
    <>
      <Header user={user} userLoading={userLoading} />
      <article className={`${mainPCHeight}`}>
        <div className={`w-full h-full`}>
        </div>
      </article >
    </>
  );
}
