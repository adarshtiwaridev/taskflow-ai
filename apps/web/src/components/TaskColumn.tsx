import React from "react";
import { Task, TaskStatus } from "@taskflow/shared";
import { TaskCard } from "./TaskCard";
import { Inbox } from "lucide-react";

interface TaskColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  id,
  title,
  tasks,
  onMoveTask,
  onDeleteTask,
}) => {
  return (
    <section className={`board-column column-${id.toLowerCase()}`}>
      <div className="column-header">
        <div className="column-title-group">
          <span className={`column-accent accent-${id.toLowerCase()}`} />
          <h3>{title}</h3>
        </div>
        <span className="task-count-badge">{tasks.length}</span>
      </div>

      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-column-state">
            <Inbox size={24} className="empty-icon" />
            <p>No tasks in {title.toLowerCase()}</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onMove={onMoveTask}
              onDelete={onDeleteTask}
            />
          ))
        )}
      </div>
    </section>
  );
};

