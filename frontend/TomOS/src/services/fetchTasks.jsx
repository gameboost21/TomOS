import { useEffect, useState } from "react";

function useTasks() {
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(true)
    useEffect(()=> {
        const fetchTasks = async () => {
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/tasks`,

                )
                if (!response.ok) {
                    throw new Error("Failed to fetch Tasks")
                }
                const data = await response.json();
                setTasks(data)        
            } catch(error) {
                console.error("Fetching tasks failed: ", error)
            } finally {
                setLoading(false)
            }
        };

        fetchTasks();
    }, []);
    return { tasks, setTasks, loading };
}

export default useTasks