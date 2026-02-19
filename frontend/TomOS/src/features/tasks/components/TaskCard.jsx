function TaskCard({task, onToggleDone, onDelete}) {
    return (
    <div className={`p-5 rounded-xl shadow-sm border transition
        ${task.done ? "bg-gray-50 opacity-70" : "bg-white hover:shadow-md"}
    `}>
      
      <div className="flex justify-between items-center">
        <h3 className={`font-semibold text-lg ${task.done && "line-through"}`}>
          {task.task_name}
        </h3>

        {task.urgent && (
          <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
            Urgent
          </span>
        )}
      

      <button 
        onClick={() => onDelete(task)} 
        className="text-red-500 text-sm hover:text-red-700"
      >
        Delete
      </button>
      </div>
      <p className={`mt-2 text-sm text-gray-500 ${task.done && "line-through"}`}>
        {task.description}
      </p>

      <div className="text-xs text-gray-400 mt-2">
        Assigned to {task.assignee}
      </div>

      <div className="text-xs text-gray-400 mt-1">
        Due: {task.due_date
          ? new Date(task.due_date).toLocaleDateString()
          : "-"}
      </div>

      <div className="mt-2 flex items-center gap-2">
        <input
          type="checkbox"
          checked={task.done}
          onChange={(e) => onToggleDone(task, e.target.checked)}
        />
        <span className="text-sm">Done</span>
      </div>
    </div>
  );
}

export default TaskCard;
