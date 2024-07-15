export interface TodoProps {
    id: string,
    isCompletion?: boolean
    priority?: string    // a character. A-Z Uppercase
    completionDate?: string    // format yyyy-mm-dd
    creationDate?: string    // format yyyy-mm-dd
    text: string
    project?: string    // +projctname
    context?: string    // @context    
    isUpdate?: boolean
}


export type Sort = "text" | "priority" | "context" | "creationDate" | "isCompletion" | undefined
export type Mode = "normal" | "edit" | "editOnSort" | "sort" | "command" | "number" | "search"