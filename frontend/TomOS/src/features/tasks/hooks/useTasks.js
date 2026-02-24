import { useQuery } from "@tanstack/react-query"
import { fetchTasks } from "../api/taskApi"
import { useAuthApi } from "../../users/hooks/useAuthApi"

export function useTasks() {

    const { authFetch } = useAuthApi()

    return useQuery({
        queryKey: ["tasks"],
        queryFn: () => fetchTasks(authFetch),
        enabled: !!authFetch
    })
}
