import { TodoProps, Sort } from "@/types"
import { yyyymmddhhmmss } from "./time"
import { isEqual } from "lodash"

interface options {
    project: string
    viewCompletionTask: boolean
}
export const todoFunc = {
    add: (index: number, todos: TodoProps[], options: options) => {
        const newId = self.crypto.randomUUID()
        let _todos = !options.project ? todos : todos.filter(t => t.project === options.project)
        if (!options.viewCompletionTask) _todos = _todos.filter(t => t.is_complete !== true)
        if (index === 0 || index >= _todos.length) {
            return [
                ...todos.slice(0, index === 0 ? 0 : todos.length),
                {
                    id: newId,
                    creationDate: yyyymmddhhmmss(new Date()),
                    completionDate: null,
                    text: "",
                    detail: "",
                    project: options.project,
                    is_complete: false
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
                    text: "",
                    detail: "",
                    project: options.project,
                    is_complete: false
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
            project: t.id === replace.id ? replace.project : t.project,
            context: t.id === replace.id ? replace.context : t.context,
            sort: t.id === replace.id ? replace.sort : t.sort,
        }
    }),
    delete: (todos: TodoProps[], id: string) => todos.filter(t => t.id !== id),
    diff: (todos: TodoProps[], prevTodos: TodoProps[]) => {
        const updates = todos.filter(t => {
            const _t = prevTodos.filter(pt => pt.id === t.id)
            const flg = (_t.length > 0 && !isEqual(_t[0], t)) || _t.length === 0
            if (flg) console.log("diff", t, _t[0])
            return flg
            // return (_t.length > 0 && !isEqual(_t[0], t)) || _t.length === 0
        })

        const _ids = todos.map(t => t.id)
        const deletes = prevTodos.filter(pt => !_ids.includes(pt.id)).map(pt => {
            pt.isArchived = true
            return pt
        })
        console.log(todos, prevTodos)
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
                case "context":
                    if (value) isEmpty = false
                    break;
            }
        })
        return isEmpty
    },
    getIndexById: (todos: TodoProps[], id: string | undefined) => {
        const index = todos.map(t => t.id).indexOf(id ? id : "")
        return index >= 0 ? index : todos.length - 1
    }
}