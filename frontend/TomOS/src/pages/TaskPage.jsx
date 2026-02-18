import { useState } from "react";
import { useTasks } from "../hooks/useTasks.js";
import { useCreateTask } from "../hooks/useCreateTask.js";
import { useUpdateTask } from "../hooks/useUpdateTask.js";
import { Calendar } from "primereact/calendar"

const EMPTY_FORM = {
        task_name: "",
        description: "",
        due_date: null,
        assignee: "",
        urgent: false
    }


function TaskPage() {

    const [form, setForm] = useState(EMPTY_FORM)
    const [showDone, setShowDone] = useState(false)

    const { task_name, description, due_date, assignee, urgent } = form;

    const {data: tasks, isPending, isError, error} = useTasks()

    const {mutateAsync, isPending: isCreating} = useCreateTask()

    const {mutateAsync: updateTask} = useUpdateTask();

    if (isPending) {
            return <div>Loading....</div>
    }

    if (isError) {
        return <div>{error.message}</div>
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            await mutateAsync({
              ...form,
              due_date: due_date?.toISOString(),
              done: false
          })
          
          setForm(EMPTY_FORM)
        } catch (err) {
          console.error("Failed to create Task", err)
        }
    }
    
    const activeTasks = (tasks ?? []).filter(t => !t.done);
    const completedTasks = (tasks ?? []).filter(t => t.done);

    const handleToggleDone = async (task, checked) => {
       try { 
        await updateTask({
          id: task.id,
          updatedTask: {
            done: checked
          }
        })
      } catch(err) {
        console.error("Failed to update Task", err)
      }
    }

    

  return (
    <div className="space-y-10 p-4">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
        <p className="text-gray-500 mt-1">Manage and create tasks</p>
      </div>

      {/* ACTIVE TASK GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTasks.map((task) => (
          <div
            key={task.id}
            className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">{task.task_name}</h3>
              {task.urgent && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                  Urgent
                </span>
              )}
            </div>

            <p className="text-gray-500 mt-2 text-sm">{task.description}</p>

            <div className="text-xs text-gray-400 mt-2">
              Assigned to {task.assignee}
            </div>

            <div className="text-xs text-gray-400 mt-1">
              Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={task.done} 
                onChange={(e) => {
                    handleToggleDone(task, e.target.checked)
                }}
            />
              <span className="text-sm">Done</span>
            </div>
          </div>
        ))}
      </div>

      {/* COLLAPSIBLE COMPLETED TASKS */}
      {completedTasks.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowDone(!showDone)}
            className="text-blue-600 font-medium underline mb-2"
          >
            {showDone ? "Hide Completed Tasks" : `Show Completed Tasks (${completedTasks.length})`}
          </button>

          {showDone && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-50 p-5 rounded-xl shadow-sm border hover:shadow-md transition opacity-70"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg line-through">{task.task_name}</h3>
                    {task.urgent && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                        Urgent
                      </span>
                    )}
                  </div>

                  <p className="text-gray-500 mt-2 text-sm line-through">{task.description}</p>

                  <div className="text-xs text-gray-400 mt-2">
                    Assigned to {task.assignee}
                  </div>

                  <div className="text-xs text-gray-400 mt-1">
                    Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : "-"}
                  </div>

                  {/* DONE TOGGLE */}
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={task.done}
                      onChange={(e) => {
                        handleToggleDone(task, e.target.checked)
                      }}
                    />
                    <span className="text-sm">Done</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE TASK FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-sm border max-w-xl"
      >
        <h2 className="text-xl font-semibold mb-4">Create Task</h2>

        <div className="space-y-4">
          {/* Assignee */}
          <div>
            <label className="block text-sm font-medium mb-1">Assignee</label>
            <select
              value={assignee}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, assignee: e.target.value }))
              }
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Assignee</option>
              <option value="tom">Tom</option>
              <option value="jenna">Jenna</option>
            </select>
          </div>

          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Task Name</label>
            <input
              type="text"
              value={task_name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, task_name: e.target.value }))
              }
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* Urgent */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={urgent}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, urgent: e.target.checked }))
              }
            />
            <span className="text-sm">Urgent</span>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Due Date */}
          <Calendar
            value={due_date}
            onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.value }))}
            className="w-full"
          />

          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            {isCreating ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </div>
  );  
}
    
export default TaskPage