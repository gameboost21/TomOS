import { useState } from "react";
import { Calendar } from "primereact/calendar"
import useTasks from "../src/services/fetchTasks"
import { createTask } from "./taskApi_old";


    const EMPTY_FORM = {
        task_name: "",
        description: "",
        due_date: null,
        assignee: "",
        urgent: false
    }

function TaskPage() {

    // const [task_name, setTaskname] = useState("")
    //const [description, setDescription] = useState("")
    //const [due_date, setDueDate] = useState("")
    //const [assignee, setAssignee] = useState("")
    //const [done, setDone] = useState(false)
    //const [urgent, setUrgent] = useState(false)
    const { tasks, setTasks, loading } = useTasks();
    
   

    const { task_name, description, due_date, assignee, urgent } = form;
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        const newTask = {
            ...form,
            due_date: due_date?.toISOString(),
            done: false,
        };

        try {
            const createdTask = await createTask(newTask)
            setTasks(prev => [...prev, createdTask])
            setForm(EMPTY_FORM)
            
        } catch (error) {
            console.error("Error creating Task. Error: ", error)
        }
    };

    return (
        <>
            <div>
                <h1>Tasks</h1>
                {loading ?(
                    <p>Loading...</p>
                ) : (
                    tasks.map(task => (
                    <div key={task.id}>
                        {task.task_name}
                    </div>
                ))
                )}
                
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 shadow rounded max-w-md mx-auto">
                <h2 className="text-xl font-bold">Create a new Task</h2>
                <div>
                    <label className="block font-medium">Assignee:</label>
                    <select
                        value={assignee}
                        onChange={(e) => setForm(prev => ({...prev, assignee: e.target.value}))}
                    >
                        <option value="tom">Tom</option>
                        <option value="jenna">Jenna</option>
                    </select>
                </div>

                <div>
                    <label className="block font-medium">Task Name:</label>
                    <input type="text"
                        value={task_name}
                        onChange={(e) => setForm(prev => ({...prev, task_name: e.target.value}))}
                        className="w-full border p-2 rounded"
                        required              
                    />
                </div>
                <div>
                    <label className="block font-medium">Urgent?</label>
                    <input type="checkbox"
                        checked={urgent}
                        onChange={(e) => setForm(prev => ({...prev, urgent: e.target.checked}))}
                        className="mr-2"
                    />
                </div>
                <div>
                    <label className="block font-medium">Description:</label>
                    <input type="text" 
                        placeholder="Enter Description"
                        value={description}
                        onChange={(e) => setForm(prev => ({...prev, description: e.target.value}))}
                    />
                </div>
                <div>
                    <Calendar
                        value={due_date}
                        onChange={(e) => setForm(prev => ({...prev, due_date: e.value}))}

                    />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Create Task
                </button>
            </form>
        </>
    );
}

