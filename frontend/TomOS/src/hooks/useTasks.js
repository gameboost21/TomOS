import { useQuery } from "@tanstack/react-query"
import { fetchTasks } from "../api/taskApi"

export function useTasks() {
    return useQuery({
        queryKey: ["tasks"],
        queryFn: fetchTasks
    })
}
