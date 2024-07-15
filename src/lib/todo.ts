import { TodoProps, Sort } from "@/types"
import { yyyymmddhhmmss } from "./time"

interface options {
    project: string
    viewCompletionTask: boolean
}
export const todoFunc = {
    add: (index: number, todos: TodoProps[], options: options) => {
        const newId = self.crypto.randomUUID()
        let _todos = !options.project ? todos : todos.filter(t => t.project === options.project)
        if (!options.viewCompletionTask) _todos = _todos.filter(t => t.isCompletion !== true)
        if (index === 0 || index >= _todos.length) {
            return [
                ...todos.slice(0, index === 0 ? 0 : todos.length),
                {
                    id: newId,
                    creationDate: yyyymmddhhmmss(new Date()),
                    text: "",
                    project: options.project,
                    isUpdate: true,
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
                    text: "",
                    project: options.project,
                    isUpdate: true,
                },
                ...todos.slice(_index + 1)
            ]
        }
    },
    modify: (todos: TodoProps[], replace: TodoProps) => todos.map(t => {
        return {
            id: t.id,
            isCompletion: t.id === replace.id ? replace.isCompletion : t.isCompletion,
            priority: t.id === replace.id ? replace.priority : t.priority,
            completionDate: t.id === replace.id ? replace.completionDate : t.completionDate,
            creationDate: t.id === replace.id ? replace.creationDate : t.creationDate,
            text: t.id === replace.id ? replace.text : t.text,
            project: t.id === replace.id ? replace.project : t.project,
            context: t.id === replace.id ? replace.context : t.context,
            isUpdate: t.id === replace.id,
        }
    }),
    delete: (todos: TodoProps[], id: string) => todos.filter(t => t.id !== id),
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
    }
}