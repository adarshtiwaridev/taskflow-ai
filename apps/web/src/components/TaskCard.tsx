import React from "react";
import { Task, TaskStatus } from "@taskflow/shared";
import { Trash2, ArrowLeft, ArrowRight } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onMove: (taskId: string, newStatus: TaskStatus) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onMove, onDelete }) => {
  const isTodo = task.status === "TODO";
  const isInProgress = task.status === "IN_PROGRESS";
  const isDone = task.status === "DONE";

  const getPreviousStatus = (): TaskStatus | null => {
    if (isDone) return "IN_PROGRESS";
    if (isInProgress) return "TODO";
    return null;
  };

  const getNextStatus = (): TaskStatus | null => {
    if (isTodo) return "IN_PROGRESS";
    if (isInProgress) return "DONE";
    return null;
  };

  const prevStatus = getPreviousStatus();
  const nextStatus = getNextStatus();

  return (
    <article className="task-card">
      <div className="task-card-header">
        <span className={`priority-tag priority-${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
        <button
          className="btn-icon-delete"
          onClick={() => onDelete(task.id)}
          title="Delete task"
          aria-label="Delete task"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <h4 className="task-card-title">{task.title}</h4>

      {task.description && <p className="task-card-desc">{task.description}</p>}

      <div className="task-card-footer">
        <span className="task-date">
          {new Date(task.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>

        <div className="task-actions">
          {prevStatus && (
            <button
              className="btn-action-arrow"
              onClick={() => onMove(task.id, prevStatus)}
              title={`Move to ${prevStatus.replace("_", " ")}`}
            >
              <ArrowLeft size={13} />
            </button>
          )}

          {nextStatus && (
            <button
              className="btn-action-arrow"
              onClick={() => onMove(task.id, nextStatus)}
              title={`Move to ${nextStatus.replace("_", " ")}`}
            >
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

