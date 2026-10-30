import React, { useState } from "react";
import { TaskPriority } from "@taskflow/shared";
import { Plus } from "lucide-react";

interface TaskFormProps {
  onAddTask: (title: string, priority: TaskPriority) => Promise<void>;
  isSubmitting: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onAddTask, isSubmitting }) => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    await onAddTask(title.trim(), priority);
    setTitle("");
  };

  return (
    <form className="task-add-form" onSubmit={handleSubmit}>
      <input
        type="text"
        className="task-input"
        placeholder="What needs to get done? (e.g. Set up Redis container)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={isSubmitting}
      />

      <select
        className="priority-select"
        value={priority}
        onChange={(e) => setPriority(e.target.value as TaskPriority)}
        disabled={isSubmitting}
      >
        <option value="LOW">Low Priority</option>
        <option value="MEDIUM">Medium Priority</option>
        <option value="HIGH">High Priority</option>
      </select>

      <button type="submit" className="btn-add-task" disabled={isSubmitting || !title.trim()}>
        <Plus size={16} />
        <span>{isSubmitting ? "Adding..." : "Add task"}</span>
      </button>
    </form>
  );
};

