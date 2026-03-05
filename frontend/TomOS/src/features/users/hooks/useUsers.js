/**
 * Hook to fetch the users list using react-query.
 *
 * Returns the result of `useQuery` for the `users` key. Relies on
 * `useAuthApi` for an authenticated fetch function.
 */
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../api/userApi";
import { useAuthApi } from "./useAuthApi";

export function useUsers() {
    const { authFetch } = useAuthApi()

    return useQuery({
        queryKey: ["users"],
        queryFn: () => fetchUsers(authFetch),
        enabled: !!authFetch
    })
}