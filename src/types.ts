export interface TodoProps {
    id: string,
    is_complete?: boolean
    priority?: string    // a character. A-Z Uppercase
    completionDate?: string | null    // format yyyy-mm-dd
    creationDate?: string    // format yyyy-mm-dd
    text: string
    detail?: string
    project?: string    // +projctname
    context?: string    // @context    
    isArchived?: boolean
    sort?: number
    limitDate?: string
    indent?: number
}


export type Sort = "text" | "priority" | "context" | "creationDate" | "is_complete" | "sort" | undefined
export type Mode = "normal" | "edit" | "editDetail" | "editOnSort" | "sort" | "command" | "number" | "search" | "modal" | "select"

export interface TodoEnablesProps {
    enableAddTodo: boolean
    todosLimit: number
}

export type SaveTodosReturnProps = {
    action: 'save' | 'skip'
    error?: any
}