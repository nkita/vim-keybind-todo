export interface TodoProps {
    id: number,
    isCompletion?: boolean
    priority?: string    // a character. A-Z Uppercase
    completionDate?: string    // format yyyy-mm-dd
    creationDate?: string    // format yyyy-mm-dd
    text: string
    project?: string    // +projctname
    context?: string    // @context    
}


export type Sort = "text" | "priority" | "context" | "creationDate" | undefined
export type Mode = "normal" | "edit" | "editOnSort" | "sort" | "command" 