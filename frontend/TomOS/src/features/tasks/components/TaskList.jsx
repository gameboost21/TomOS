import TaskCard from "./TaskCard";

function TaskList({ tasks, onToggleDone, onDelete }) {
  if (!tasks.length) return null;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleDone={onToggleDone}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TaskList