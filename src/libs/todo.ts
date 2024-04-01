import { TodoProps } from "@/types"
import { yyyymmddhhmmss } from "./time"
interface options {
    project: string
}
export const todoFunc = {
    add: (index: number, todos: TodoProps[], options: options = { project: "" }) => {
        const newId = todos.length === 0 ? 1 : Math.max(...todos.map((t: TodoProps) => t.id)) + 1
        return [
            ...todos.slice(0, index),
            {
                id: newId,
                creationDate: yyyymmddhhmmss(new Date()),
                text: "",
                project: options.project
            },
            ...todos.slice(index)
        ]
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
            context: t.id === replace.id ? replace.context : t.context
        }
    }),
    delete: (todos: TodoProps[], id: number) => todos.filter(t => t.id !== id),
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