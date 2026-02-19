import { deleteTaskId } from "../api/taskApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteTask() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }) => deleteTaskId(id),

        onSuccess: (_, variables) => {
            queryClient.setQueryData(["tasks"], (old) => old?.filter(task => task.id !== variables.id))
        }
    })
}