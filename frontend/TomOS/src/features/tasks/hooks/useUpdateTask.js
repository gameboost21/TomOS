import { updateTaskId } from "../api/taskApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthApi } from "../../users/hooks/useAuthApi"

export function useUpdateTask() {

    const { authFetch } = useAuthApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, updatedTask }) => updateTaskId(id, updatedTask, authFetch),

        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["tasks"]})
        }

    })
}