import { updateTaskId } from "../api/taskApi";

import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateTask() {

    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, updatedTask }) => updateTaskId(id, updatedTask),

        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["tasks"]})
        }

    })
}