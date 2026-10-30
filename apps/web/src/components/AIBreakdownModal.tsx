import React, { useState } from "react";
import { AISubtask, CreateTaskDTO } from "@taskflow/shared";
import { api } from "../services/api";
import { Sparkles, X, Check, Loader2, AlertCircle } from "lucide-react";

interface AIBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTasksAdded: (tasks: CreateTaskDTO[]) => Promise<void>;
}

export const AIBreakdownModal: React.FC<AIBreakdownModalProps> = ({
  isOpen,
  onClose,
  onTasksAdded,
}) => {
  const [goal, setGoal] = useState("");
  const [context, setContext] = useState("");
  const [maxTasks, setMaxTasks] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<AISubtask[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [addingToBoard, setAddingToBoard] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || loading) return;

    setLoading(true);
    setError(null);
    setSubtasks([]);

    try {
      const response = await api.breakdownGoal({
        goal: goal.trim(),
        context: context.trim() || undefined,
        maxTasks,
      });

      setSubtasks(response.subtasks);
      setSelectedIndices(new Set(response.subtasks.map((_, i) => i)));
    } catch (err) {
      setError((err as Error).message || "Failed to generate AI breakdown. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleAddSelectedToBoard = async () => {
    if (selectedIndices.size === 0 || addingToBoard) return;

    setAddingToBoard(true);
    try {
      const tasksToAdd: CreateTaskDTO[] = Array.from(selectedIndices).map((idx) => {
        const item = subtasks[idx];
        return {
          title: item.title,
          description: item.description,
          priority: item.priority,
          status: "TODO",
        };
      });

      await onTasksAdded(tasksToAdd);
      onClose();
    } catch (err) {
      setError((err as Error).message || "Failed to add tasks to board");
    } finally {
      setAddingToBoard(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <h3>AI Task Breakdown</h3>
              <p>Turn ambitious goals into prioritized, actionable steps</p>
            </div>
          </div>
          <button className="btn-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="modal-form">
          <div className="form-group">
            <label htmlFor="goal-input">Your High-Level Goal *</label>
            <input
              id="goal-input"
              type="text"
              placeholder="e.g. Set up production AWS EC2 deployment with Nginx & SSL"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-2">
              <label htmlFor="context-input">Technical Context (Optional)</label>
              <input
                id="context-input"
                type="text"
                placeholder="e.g. Using Docker Compose, Node.js 22, and PostgreSQL"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="max-tasks-select">Max Subtasks</label>
              <select
                id="max-tasks-select"
                value={maxTasks}
                onChange={(e) => setMaxTasks(Number(e.target.value))}
                disabled={loading}
              >
                <option value={3}>3 subtasks</option>
                <option value={4}>4 subtasks</option>
                <option value={5}>5 subtasks</option>
                <option value={8}>8 subtasks</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="btn-generate-ai"
            disabled={loading || !goal.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                <span>Analyzing and breaking down...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Break Down Goal</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="modal-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {subtasks.length > 0 && (
          <div className="subtasks-preview">
            <div className="subtasks-header">
              <h4>Generated Subtasks ({subtasks.length})</h4>
              <span className="subtasks-hint">Select items to add to board</span>
            </div>

            <div className="subtasks-list">
              {subtasks.map((task, idx) => {
                const isSelected = selectedIndices.has(idx);
                return (
                  <div
                    key={idx}
                    className={`subtask-item ${isSelected ? "selected" : ""}`}
                    onClick={() => toggleSelect(idx)}
                  >
                    <div className={`checkbox ${isSelected ? "checked" : ""}`}>
                      {isSelected && <Check size={12} />}
                    </div>

                    <div className="subtask-content">
                      <div className="subtask-top">
                        <span className="subtask-title">{task.title}</span>
                        <span className={`priority-tag priority-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="subtask-desc">{task.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-add-selected"
                onClick={handleAddSelectedToBoard}
                disabled={selectedIndices.size === 0 || addingToBoard}
              >
                {addingToBoard ? (
                  <>
                    <Loader2 size={15} className="spin" />
                    <span>Adding to Board...</span>
                  </>
                ) : (
                  <span>Add {selectedIndices.size} Subtasks to Board</span>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

