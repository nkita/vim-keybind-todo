import { useContext } from "react";
import { TodoContext, TodoContextValue } from "@/provider/todo";

export const useTodoContext = (): TodoContextValue => {
    const context = useContext(TodoContext);
    
    if (!context) {
        throw new Error("useTodoContext must be used within a TodoProvider");
    }
    
    return context;
};