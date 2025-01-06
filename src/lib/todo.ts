import { TodoProps, Sort, SaveTodosReturnProps, ProjectProps, LabelProps } from "@/types"
import { yyyymmddhhmmss } from "./time"
import { isEqual, replace } from "lodash"
import { postFetch } from "./fetch"

export interface Options {
    text?: string;
    priority?: string;
    projectId?: string;
    viewCompletionTask?: boolean;
    indent?: number;
}

export const todoFunc = {
    add: (index: number, todos: TodoProps[], options: Options) => {
        const newId = self.crypto.randomUUID()
        const _indent = options.indent ?? 0
        let _todos = !options.projectId ? todos : todos.filter(t => t.projectId === options.projectId)
        if (!options.viewCompletionTask) _todos = _todos.filter(t => t.is_complete !== true)
        if (index === 0 || index >= _todos.length) {
            return [
                ...todos.slice(0, index === 0 ? 0 : todos.length),
                {
                    id: newId,
                    creationDate: yyyymmddhhmmss(new Date()),
                    completionDate: null,
                    text: options.text ?? "",
                    priority: options.priority ?? "",
                    detail: "",
                    projectId: options.projectId ?? "",
                    is_complete: false,
                    indent: options.indent ?? 0,
                },
                ...todos.slice(index === 0 ? 0 : todos.length)
            ]
        } else {
            const _id = _todos[index - 1].id
            const _index = todos.map(t => t.id).indexOf(_id)
            return [
                ...todos.slice(0, _index + 1),
                {
                    id: newId,
                    creationDate: yyyymmddhhmmss(new Date()),
                    completionDate: null,
                    text: options.text ?? "",
                    priority: options.priority ?? "",
                    detail: "",
                    projectId: options.projectId ?? "",
                    is_complete: false,
                    indent: options.indent ?? 0,
                },
                ...todos.slice(_index + 1)
            ]
        }
    },
    modify: (todos: TodoProps[], replace: TodoProps) => todos.map(t => {
        return {
            id: t.id,
            is_complete: t.id === replace.id ? replace.is_complete : t.is_complete,
            priority: t.id === replace.id ? replace.priority : t.priority,
            completionDate: t.id === replace.id ? replace.completionDate : t.completionDate,
            creationDate: t.id === replace.id ? replace.creationDate : t.creationDate,
            text: t.id === replace.id ? replace.text : t.text,
            detail: t.id === replace.id ? replace.detail : t.detail,
            projectId: t.id === replace.id ? replace.projectId : t.projectId,
            labelId: t.id === replace.id ? replace.labelId : t.labelId,
            sort: t.id === replace.id ? replace.sort : t.sort,
            indent: t.id === replace.id ? replace.indent : t.indent,
        }
    }),
    /**
     *  TodoProps配列とTodoPropsのIDとObjectを引数に
     * 　変更後のTodoProps配列を返却する
     */
    update: (todos: TodoProps[], id: string, replace: Object) => todos.map(t => {
        return {
            ...t,
            ...t.id === id ? replace : {}
        }
    }),
    delete: (todos: TodoProps[], id: string) => todos.filter(t => t.id !== id),
    diff: (todos: TodoProps[], prevTodos: TodoProps[]) => {
        const updates = todos.filter(t => {
            const _t = prevTodos.filter(pt => pt.id === t.id)
            const flg = (_t.length > 0 && !isEqual(_t[0], t)) || _t.length === 0
            // console.log("diff", t, _t[0], isEqual(_t[0], t))
            // if (flg) console.log("diff", t, _t[0])
            return flg
            // return (_t.length > 0 && !isEqual(_t[0], t)) || _t.length === 0
        })

        const _ids = todos.map(t => t.id)
        const deletes = prevTodos.filter(pt => !_ids.includes(pt.id)).map(pt => {
            pt.isArchived = true
            return pt
        })
        return [...updates, ...deletes]
    },
    sortUpdate: (todos: TodoProps[]) => {
        return todos.map((t, i) => {
            t.sort = i + 1
            return t
        })
    },
    isEmpty: (todo: TodoProps) => {
        let isEmpty = true
        Object.entries(todo).map(([key, value]) => {
            switch (key) {
                case "completionDate":
                case "text":
                case "priority":
                case "detail":
                    if (value) isEmpty = false
                    break;
            }
        })
        return isEmpty
    },
    getIndexById: (todos: TodoProps[], id: string | undefined) => {
        const index = todos.map(t => t.id).indexOf(id ? id : "")
        return index >= 0 ? index : todos.length - 1
    },
    /**
     * TodoProps配列内のTodoを入れ替え元IDと入れ替え後IDを指定して入れ替える
     */
    swap: (todos: TodoProps[], fromId: string, toId: string) => {
        const fromIndex = todos.map(t => t.id).indexOf(fromId)
        const toIndex = todos.map(t => t.id).indexOf(toId)
        if (fromIndex < 0 || toIndex < 0) return todos
        const _todos = [...todos]
        const from = _todos[fromIndex]
        _todos[fromIndex] = _todos[toIndex]
        _todos[toIndex] = from
        return _todos
    },
    /**
     * TodoProps配列内のTodoをfromIndexからtoIndexの位置に移動する
     */
    move: (todos: TodoProps[], fromIndex: number, toIndex: number) => {
        if (fromIndex < 0 || toIndex < 0) return todos
        if (fromIndex >= todos.length) fromIndex = todos.length - 1
        if (toIndex >= todos.length) toIndex = todos.length - 1
        const _todos = [...todos]
        const from = _todos[fromIndex]
        _todos.splice(fromIndex, 1)
        _todos.splice(toIndex, 0, from)
        return _todos

    }
}

export const postSaveTodos = async (
    todos: TodoProps[],
    prevTodos: TodoProps[],
    listID: string | null,
    token: string | null,
): Promise<SaveTodosReturnProps> => {

    let r: SaveTodosReturnProps = { action: 'skip' }

    try {
        const api = `${process.env.NEXT_PUBLIC_API}/api/list/${listID}/todo`
        const postData = todoFunc.diff(todos, prevTodos).filter(d => !todoFunc.isEmpty(d))
        if (postData.length > 0) {
            r['action'] = 'save'
            await postFetch(api, token, postData).catch(e => console.error(e))
        }
        return r
    } catch (e) {
        r['action'] = 'save'
        r['error'] = e
        return r
    }
}

export const postSaveProjects = async (
    projects: ProjectProps[],
    listID: string | null,
    token: string | null,
): Promise<SaveTodosReturnProps> => {

    let r: SaveTodosReturnProps = { action: 'skip' }

    try {
        const api = `${process.env.NEXT_PUBLIC_API}/api/list/${listID}/project`
        r['action'] = 'save'
        await postFetch(api, token, projects).catch(e => console.error(e))
        return r
    } catch (e) {
        r['error'] = e
        return r
    }
}

export const postSaveLabels = async (
    labels: LabelProps[],
    listID: string | null,
    token: string | null,
): Promise<SaveTodosReturnProps> => {

    let r: SaveTodosReturnProps = { action: 'skip' }

    try {
        const api = `${process.env.NEXT_PUBLIC_API}/api/list/${listID}/label`
        r['action'] = 'save'
        await postFetch(api, token, labels).catch(e => console.error(e))
        return r
    } catch (e) {
        r['error'] = e
        return r
    }
}
