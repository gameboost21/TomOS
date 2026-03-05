import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthApi } from "./useAuthApi";
import { updateUserId } from "../api/userApi";

/**
 * Hook to update a user's role.
 *
 * Usage: `const { mutateAsync } = useUpdateUserRole()` and call with
 * `{ id, updatedUser }` where `updatedUser` contains the new role.
 */
export function useUpdateUserRole() {
	const { authFetch } = useAuthApi();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, updatedUser }) => updateUserId(id, authFetch, updatedUser),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
	});
}
