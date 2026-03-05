/**
 * Fetch the list of users from the API.
 *
 * @param {function(string, object=): Promise<Response>} authFetch - Fetch wrapper that adds auth headers.
 * @returns {Promise<object[]>} Resolves with an array of user objects.
 * @throws {Error} When the request fails or access is denied.
 */
export async function fetchUsers(authFetch) {
    const res = await authFetch("/api/users")

    if (!res.ok) {

        if (res.status === 403) {
            throw new Error("Access Denied - Admin privileges required")
        }

        throw new Error("Failed to fetch users")
    }
    return res.json()
}

/**
 * Fetch a single user by id.
 *
 * @param {number|string} id - User id to fetch.
 * @param {function(string, object=): Promise<Response>} authFetch - Authenticated fetch wrapper.
 * @returns {Promise<object>} User object.
 * @throws {Error} When the request fails.
 */
export async function fetchUser(id, authFetch) {
    const res = await authFetch(`/api/users/${id}`)

    if (!res.ok) {
        throw new Error("Failed to fetch user")
    }
    return res.json()
}

/**
 * Delete a user by id.
 *
 * @param {number|string} id - User id to delete.
 * @param {function(string, object=): Promise<Response>} authFetch - Authenticated fetch wrapper.
 * @returns {Promise<null|object>} Null for 204 responses, otherwise parsed JSON.
 * @throws {Error} When the delete request fails.
 */
export async function deleteUserId(id, authFetch) {
    const res = await authFetch(`/api/users/${id}`, {
        method: "DELETE",
    })
    if (!res.ok) {
        throw new Error(`Failed to delete user with ID: ${id}`)
    }
    if (res.status === 204) return null
    return res.json()
}
/**
 * Update a user by id.
 *
 * @param {number|string} id - User id to update.
 * @param {function(string, object=): Promise<Response>} authFetch - Authenticated fetch wrapper.
 * @param {object} updatedUser - Partial or full user payload.
 * @returns {Promise<void>} Resolves when update succeeds.
 * @throws {Error} When the update request fails.
 */
export async function updateUserId(id, authFetch, updatedUser) {
    const res = authFetch(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(updatedUser)
    })

    if (!res.ok) {
        throw new Error(`Failed to update user with ID: ${id}`)
    }
}
