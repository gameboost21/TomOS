import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createTask } from "../api/taskApi"
import { useAuthApi } from "../../users/hooks/useAuthApi"

export function useCreateTask() {
    
    const { authFetch } = useAuthApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => (newTask) => createTask(newTask, authFetch),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] })
        }
    })
}