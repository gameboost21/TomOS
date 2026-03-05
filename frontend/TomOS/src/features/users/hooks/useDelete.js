import { useAuthApi } from "./useAuthApi";
import { useMutation,useQueryClient } from "@tanstack/react-query";
import { deleteUserId } from "../api/userApi";

/**
 * Hook to delete users via API and update the cached users list.
 *
 * Returns a react-query mutation object. Call with `{ id }` to delete.
 */
export function useDeleteUsers() {
    const { authFetch } = useAuthApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id }) => deleteUserId(id, authFetch),
            
        onSuccess: (_, variables) => {
            queryClient.setQueryData(["users"], (old) => old?.filter(user => user.id !== variables.id))
        }
        
    })

}