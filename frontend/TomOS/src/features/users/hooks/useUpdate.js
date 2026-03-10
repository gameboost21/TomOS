import { updateUserRole } from "../api/userApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthApi } from "./useAuthApi";

/**
 * Hook to update a user via API and refresh the users query.
 *
 * Returns a react-query mutation object. Expects `mutationFn` variables
 * in the shape `{ id, updatedUser }`.
 */
export function useUpdateUser() {
    const { authFetch } = useAuthApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, role }) => updateUserRole(id, role, authFetch),

        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["users"]})
        }
    })
}