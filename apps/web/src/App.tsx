import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Task, TaskStatus, TaskPriority, CreateTaskDTO } from "@taskflow/shared";
import { api } from "./services/api";
import { getSocket } from "./services/socket";
import { Navbar } from "./components/Navbar";
import { TaskColumn } from "./components/TaskColumn";
import { TaskForm } from "./components/TaskForm";
import { AIBreakdownModal } from "./components/AIBreakdownModal";
import { Search, Filter, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import "./styles.css";

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "DONE", label: "Done" },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "offline">("connecting");
  const [activeUsers, setActiveUsers] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | TaskPriority>("ALL");

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetched = await api.getTasks();
      setTasks(fetched);
    } catch (err) {
      setError((err as Error).message || "Failed to load board tasks from server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();

    const socket = getSocket();

    const onConnect = () => setConnectionStatus("connected");
    const onDisconnect = () => setConnectionStatus("offline");
    const onConnectError = () => setConnectionStatus("connecting");

    const onBoardSync = (data: { tasks: Task[]; activeUsers: number }) => {
      setTasks(data.tasks);
      setActiveUsers(data.activeUsers);
    };

    const onUserJoined = (data: { activeUsers: number }) => {
      setActiveUsers(data.activeUsers);
    };

    const onUserLeft = (data: { activeUsers: number }) => {
      setActiveUsers(data.activeUsers);
    };

    const onTaskCreated = (newTask: Task) => {
      setTasks((prev) => (prev.some((t) => t.id === newTask.id) ? prev : [newTask, ...prev]));
    };

    const onTaskUpdated = (updatedTask: Task) => {
      setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    };

    const onTaskDeleted = (deletedId: string) => {
      setTasks((prev) => prev.filter((t) => t.id !== deletedId));
    };

    const onBatchTasksCreated = (newTasks: Task[]) => {
      setTasks((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const filteredNew = newTasks.filter((t) => !existingIds.has(t.id));
        return [...filteredNew, ...prev];
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("board:sync", onBoardSync);
    socket.on("user:joined", onUserJoined);
    socket.on("user:left", onUserLeft);
    socket.on("task:created", onTaskCreated);
    socket.on("task:updated", onTaskUpdated);
    socket.on("task:deleted", onTaskDeleted);
    socket.on("tasks:batch-created", onBatchTasksCreated);

    if (socket.connected) {
      setConnectionStatus("connected");
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("board:sync", onBoardSync);
      socket.off("user:joined", onUserJoined);
      socket.off("user:left", onUserLeft);
      socket.off("task:created", onTaskCreated);
      socket.off("task:updated", onTaskUpdated);
      socket.off("task:deleted", onTaskDeleted);
      socket.off("tasks:batch-created", onBatchTasksCreated);
    };
  }, [loadTasks]);

  const handleAddTask = async (title: string, priority: TaskPriority) => {
    try {
      setIsSubmitting(true);
      const newTask = await api.createTask({ title, priority, status: "TODO" });
      setTasks((prev) => (prev.some((t) => t.id === newTask.id) ? prev : [newTask, ...prev]));
    } catch (err) {
      setError((err as Error).message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await api.updateTask(taskId, { status: newStatus });
    } catch (err) {
      // Revert on error
      loadTasks();
      setError((err as Error).message || "Failed to update task status");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    // Optimistic remove
    const originalTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await api.deleteTask(taskId);
    } catch (err) {
      setTasks(originalTasks);
      setError((err as Error).message || "Failed to delete task");
    }
  };

  const handleAddAITasks = async (tasksToAdd: CreateTaskDTO[]) => {
    const created = await api.bulkCreateTasks(tasksToAdd);
    setTasks((prev) => {
      const existingIds = new Set(prev.map((t) => t.id));
      const filtered = created.filter((t) => !existingIds.has(t.id));
      return [...filtered, ...prev];
    });
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  return (
    <div className="app-container">
      <Navbar
        connectionStatus={connectionStatus}
        activeUsers={activeUsers}
        onOpenAIModal={() => setIsAIModalOpen(true)}
      />

      <main className="main-content">
        <section className="hero-section">
          <div className="hero-text">
            <span className="hero-badge">COLLABORATIVE WORKSPACE</span>
            <h1>Real-Time Team Board</h1>
            <p>
              Synchronized task management powered by Redis Pub/Sub, PostgreSQL, and AI decomposition.
            </p>
          </div>
        </section>

        {error && (
          <div className="global-error-banner">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button onClick={loadTasks} className="btn-retry">
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
          </div>
        )}

        <section className="board-card">
          <div className="board-toolbar">
            <div className="toolbar-left">
              <h2>Active Sprint Board</h2>
              <span className="total-counter">{tasks.length} tasks</span>
            </div>

            <div className="toolbar-right">
              <div className="search-box">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="filter-dropdown">
                <Filter size={14} className="filter-icon" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as "ALL" | TaskPriority)}
                >
                  <option value="ALL">All Priorities</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>
            </div>
          </div>

          <TaskForm onAddTask={handleAddTask} isSubmitting={isSubmitting} />

          {loading ? (
            <div className="board-loading-state">
              <Loader2 size={32} className="spin text-emerald" />
              <p>Synchronizing board state...</p>
            </div>
          ) : (
            <div className="board-columns-grid">
              {COLUMNS.map((column) => (
                <TaskColumn
                  key={column.id}
                  id={column.id}
                  title={column.label}
                  tasks={filteredTasks.filter((t) => t.status === column.id)}
                  onMoveTask={handleMoveTask}
                  onDeleteTask={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <AIBreakdownModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onTasksAdded={handleAddAITasks}
      />

      <footer className="footer">
        <p>Built for high-velocity teams with real-time distributed architecture.</p>
        <span>TaskFlow AI © 2026</span>
      </footer>
    </div>
  );
}
