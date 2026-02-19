export async function fetchTasks() {
    const res = await fetch("/api/tasks")

    if (!res.ok) {
        throw new Error("Failed to fetch tasks")
    }

    return res.json()
}

export async function createTask(newTask) {
    const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
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
        headers: {
            "Content-Type":"application/json",
        },
        body: JSON.stringify(updatedTask)
    })

    if (!res.ok) {
        throw new Error(`Failed to update Task with ID: ${id}`)
    }

    return res.json()
}

export async function deleteTaskId(id) {
    const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE"
    })
    if (!res.ok) {
        throw new Error(`Failed to delete task with ID: ${id}`)
    }
    if (res.status === 204) return null;
    return res.json()
}