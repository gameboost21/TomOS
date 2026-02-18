export async function createTask(task) {
   const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks`, {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify(task)
                    });
            if (!response.ok) {
                throw new Error("Failed to create Task")
            }

            return response.json();
}

