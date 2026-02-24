import { useAuth } from "./useAuth";

export function useAuthApi() {
    const { token } = useAuth()

    const getAuthHeaders = () => {
        return token ? {
            "Authorization":`Bearer ${token}`,
            "Content-Type":"application/json"
        } : {"Content-Type":"application/json"}
    }

    const authFetch = async (URL, options = {}) => {
        const headers = {
            ...getAuthHeaders(),
            ...options.headers
        }

        const response = await fetch(URL, {
            ...options,
            headers
        })
        if (response.status === 401) {
            throw new Error("Unauthorized - please log in")
        }
        return response;
    }
    return { authFetch }

}