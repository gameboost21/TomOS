export async function fetchTasks(authFetch) {
    const res = await authFetch("/api/tasks")

    if (!res.ok) {
        throw new Error("Failed to fetch tasks")
    }

    return res.json()
}

export async function createTask(newTask, authFetch) {
    const res = await authFetch("/api/tasks", {
        method: "POST",
        body: JSON.stringify(newTask),
    })

    console.log("Response Status:", res.status)

    if (!res.ok) {
        throw new Error("Failed to create task")
    }

    return res.json()
}

export async function updateTaskId(id, updatedTask, authFetch) {
    const res = await authFetch(`/api/tasks/${id}`, {
        method: "PUT",
        body: JSON.stringify(updatedTask)
    })

    if (!res.ok) {
        throw new Error(`Failed to update Task with ID: ${id}`)
    }

    return res.json()
}

export async function deleteTaskId(id, authFetch) {
    const res = await authFetch(`/api/tasks/${id}`, {
        method: "DELETE",
    })
    if (!res.ok) {
        throw new Error(`Failed to delete task with ID: ${id}`)
    }
    if (res.status === 204) return null;
    return res.json()
}