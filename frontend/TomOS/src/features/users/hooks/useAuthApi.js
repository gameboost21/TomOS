/**
 * Hook providing an authenticated fetch wrapper.
 *
 * This hook reads the auth token from `useAuth` and exposes `authFetch`, a
 * wrapper around `fetch` that automatically includes authorization headers
 * and handles common status checks.
 */
import { useAuth } from "./useAuth";

export function useAuthApi() {
    const { token } = useAuth()

    /**
     * Build request headers including the Authorization header when available.
     * @returns {Object<string,string>} Headers map
     */
    const getAuthHeaders = () => {
        return token ? {
            "Authorization":`Bearer ${token}`,
            "Content-Type":"application/json"
        } : {"Content-Type":"application/json"}
    }

    /**
     * Perform a fetch with authorization headers applied.
     * @param {string} URL - Request URL/path
     * @param {RequestInit} [options={}] - Fetch options
     * @returns {Promise<Response>} The fetch response
     * @throws {Error} When a 401 Unauthorized status is received
     */
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