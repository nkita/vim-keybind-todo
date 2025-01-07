export interface TodoProps {
    id: string,
    is_complete?: boolean
    priority?: string    // a character. A-Z Uppercase
    completionDate?: string | null    // format yyyy-mm-dd
    creationDate?: string    // format yyyy-mm-dd
    text: string
    detail?: string
    projectId?: string    // +projctId
    labelId?: string    // @labelId
    isArchived?: boolean
    sort?: number
    limitDate?: string
    indent?: number
    updateDate?: string
}


export type Sort = "text" | "priority" | "creationDate" | "is_complete" | "sort" | undefined
export type Mode = "normal" | "edit" | "editDetail" | "editOnSort" | "sort" | "command" | "number" | "search" | "modal" | "select" | "editProject" | "editProjectTab"

export interface TodoEnablesProps {
    enableAddTodo: boolean
    todosLimit: number
}

export type SaveTodosReturnProps = {
    action: 'save' | 'skip'
    error?: any
}

export type LabelProps = {
    id: string
    name: string
    isPublic: boolean
}

export type ProjectProps = {
    id: string
    name: string
    isPublic: boolean
    isTabDisplay: boolean
    sort: number
}

export type HistoryProjectProps = {
    name: string
    labels: string[]
    in_progress: number
    completed: number
    start: string
    end: string
}

export interface SummaryProps {
    in_progress: number
    completed: number
    projects: HistoryProjectProps[]
    years: string[]
}

export interface UserInfoProp {
    uid: string;
    name: string;
    nickname: string;
    image: string;
    profile: string;
    links: string[];
}

export type ComboboxDynamicItemProps = {
    id: string,
    name: string
}