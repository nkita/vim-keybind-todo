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
}


export type Sort = "text" | "priority" | "context" | "creationDate" | "is_complete" | undefined
export type Mode = "normal" | "edit" | "editOnSort" | "sort" | "command" | "number" | "search"