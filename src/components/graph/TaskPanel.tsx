import React, { useState, useCallback } from "react";
import {
  Globe,
  Server,
  Database,
  Plug,
  Cloud,
  X,
  Check,
  Plus,
  type LucideIcon,
  Crosshair,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { GraphNode as GraphNodeType, NodeType, Task, GraphEdge } from "../../types/graph";
import { getNodeProgress, generateTaskId } from "../../utils/graph";
import { generateTaskBreakdown } from "../../services/ai";

const nodeTypeConfig: Record<
  NodeType,
  { icon: LucideIcon; color: string; bgColor: string }
> = {
  frontend: {
    icon: Globe,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  api: {
    icon: Plug,
    color: "text-violet-400",
    bgColor: "bg-violet-400/10",
  },
  service: {
    icon: Server,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
  },
  database: {
    icon: Database,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
  },
  external: {
    icon: Cloud,
    color: "text-slate-400",
    bgColor: "bg-slate-400/10",
  },
};

interface TaskPanelProps {
  node: GraphNodeType;
  tasks: Task[];
  edges: GraphEdge[];
  nodes: GraphNodeType[];
  onTaskAdd: (task: Task) => void;
  onTasksAdd: (tasks: Task[]) => void;
  onTaskToggle: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onNodeDelete: (nodeId: string) => void;
  onClose: () => void;
  onFocusNode: (nodeId: string) => void;
}

type AIState = "idle" | "loading" | "error";

export const TaskPanel: React.FC<TaskPanelProps> = ({
  node,
  tasks,
  edges,
  nodes,
  onTaskAdd,
  onTasksAdd,
  onTaskToggle,
  onTaskDelete,
  onNodeDelete,
  onClose,
  onFocusNode,
}) => {
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [aiState, setAiState] = useState<AIState>("idle");
  const [aiError, setAiError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const config = nodeTypeConfig[node.type];
  const Icon = config.icon;

  const progress = getNodeProgress(node.id, tasks);
  const nodeTasks = tasks.filter((task) => task.nodeId === node.id);

  const handleAddTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: generateTaskId(),
      nodeId: node.id,
      title: newTaskTitle.trim(),
      completed: false,
    };

    onTaskAdd(newTask);
    setNewTaskTitle("");
  }, [newTaskTitle, node.id, onTaskAdd]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleAddTask();
      }
    },
    [handleAddTask]
  );

  const handleAIBreakdown = useCallback(async () => {
    setAiState("loading");
    setAiError(null);

    const result = await generateTaskBreakdown(node, edges, nodes);

    if (!result.success) {
      setAiState("error");
      setAiError(result.error || "Failed to generate tasks");
      return;
    }

    if (result.tasks && result.tasks.length > 0) {
      const newTasks: Task[] = result.tasks.map((t) => ({
        id: generateTaskId(),
        nodeId: node.id,
        title: t.title,
        completed: false,
      }));

      onTasksAdd(newTasks);
    }

    setAiState("idle");
  }, [node, edges, nodes, onTasksAdd]);

  const handleRetryAI = useCallback(() => {
    setAiError(null);
    handleAIBreakdown();
  }, [handleAIBreakdown]);

  const handleDeleteNode = useCallback(() => {
    onNodeDelete(node.id);
    onClose();
  }, [node.id, onNodeDelete, onClose]);

  return (
    <div className="w-80 h-full bg-slate-800/95 backdrop-blur-sm border-l border-slate-700/50 flex flex-col">
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center`}>
              <Icon size={16} className={config.color} strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-slate-100 font-medium text-sm">{node.label}</h2>
              {node.description && (
                <p className="text-slate-500 text-xs mt-0.5">{node.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400">
            {progress.total === 0
              ? "No tasks"
              : `${progress.completed}/${progress.total} tasks`}
          </span>
          {progress.total > 0 && (
            <span className="text-violet-400 font-medium">{progress.percent}%</span>
          )}
        </div>

        <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-300"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {aiState === "error" && aiError && (
        <div className="mx-3 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-red-400 text-xs font-medium">AI Error</p>
              <p className="text-red-400/80 text-xs mt-1">{aiError}</p>
            </div>
          </div>
          <button
            onClick={handleRetryAI}
            className="mt-2 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            <RefreshCw size={12} />
            Try again
          </button>
        </div>
      )}

      <div className="px-3 py-2 border-b border-slate-700/50">
        <button
          onClick={handleAIBreakdown}
          disabled={aiState === "loading"}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-violet-500/10 hover:bg-violet-500/20 disabled:bg-violet-500/5 border border-violet-500/30 hover:border-violet-500/50 disabled:border-violet-500/20 rounded-lg transition-colors group"
        >
          {aiState === "loading" ? (
            <>
              <Loader2 size={14} className="text-violet-400 animate-spin" />
              <span className="text-violet-400/70 text-xs font-medium">Generating tasks...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} className="text-violet-400 group-hover:scale-110 transition-transform" />
              <span className="text-violet-400 text-xs font-medium">Break down with AI</span>
            </>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {nodeTasks.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-slate-500 text-sm">No tasks yet</p>
            <p className="text-slate-600 text-xs mt-1">
              Add tasks manually or use AI to generate them
            </p>
          </div>
        ) : (
          <div className="p-2">
            {nodeTasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
              >
                <button
                  onClick={() => onTaskToggle(task.id)}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                    task.completed
                      ? "bg-violet-500 border-violet-500"
                      : "border-slate-600 hover:border-slate-500"
                  }`}
                >
                  {task.completed && <Check size={12} className="text-white" />}
                </button>

                <span
                  className={`flex-1 text-sm ${
                    task.completed ? "text-slate-500 line-through" : "text-slate-300"
                  }`}
                >
                  {task.title}
                </span>

                <button
                  onClick={() => onFocusNode(node.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-violet-400 transition-all p-1"
                  title="Focus on canvas"
                >
                  <Crosshair size={14} />
                </button>

                <button
                  onClick={() => onTaskDelete(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-700/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a task..."
            className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
          <button
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim()}
            className="px-3 py-2 bg-violet-500 hover:bg-violet-400 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="p-3 border-t border-slate-700/50">
        {showDeleteConfirm ? (
          <div className="space-y-2">
            <p className="text-xs text-slate-400 text-center">
              Delete "{node.label}" and its {nodeTasks.length} task{nodeTasks.length !== 1 ? "s" : ""}?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 rounded-lg text-xs text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteNode}
                className="flex-1 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-xs text-red-400 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-700/30 hover:bg-red-500/10 border border-slate-700/50 hover:border-red-500/30 rounded-lg text-xs text-slate-500 hover:text-red-400 transition-colors group"
          >
            <Trash2 size={12} className="group-hover:scale-110 transition-transform" />
            <span>Delete Node</span>
          </button>
        )}
      </div>
    </div>
  );
};
