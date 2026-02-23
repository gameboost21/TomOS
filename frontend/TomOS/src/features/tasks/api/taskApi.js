import { useAuth } from "../../users/hooks/useAuth";

const getAuthHeaders = () => {
    const { token } = useAuth();
    return token ?  {
        "Authorization":`Bearer ${token}`,
        "Content-Type":"application/json"
    } : {
        "Content-Type":"application/json"
    }
}

export async function fetchTasks() {
    const res = await fetch("/api/tasks", {
        headers: getAuthHeaders()
    })

    if (!res.ok) {
        if (res.status === 401) {
            throw new Error("Unauthorized - please log in")
        }
        throw new Error("Failed to fetch tasks")
    }

    return res.json()
}

export async function createTask(newTask) {
    const res = await fetch("/api/tasks", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newTask),
    })

    if (!res.ok) {
        throw new Error("Failed to create task")
    }

    return res.json()
}

export async function updateTaskId(id, updatedTask) {
    const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedTask)
    })

    if (!res.ok) {
        throw new Error(`Failed to update Task with ID: ${id}`)
    }

    return res.json()
}

export async function deleteTaskId(id) {
    const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    })
    if (!res.ok) {
        throw new Error(`Failed to delete task with ID: ${id}`)
    }
    if (res.status === 204) return null;
    return res.json()
}