import { deleteTaskId } from "../api/taskApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthApi } from "../../users/hooks/useAuthApi"

export function useDeleteTask() {

    const { authFetch } = useAuthApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }) => deleteTaskId(id, authFetch),

        onSuccess: (_, variables) => {
            queryClient.setQueryData(["tasks"], (old) => old?.filter(task => task.id !== variables.id))
        }
    })
}