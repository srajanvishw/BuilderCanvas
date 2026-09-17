import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { Project } from "../types/graph";

interface ProjectSwitcherProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onCreateProject: (name: string) => void;
  onRenameProject: (projectId: string, newName: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectSwitcher: React.FC<ProjectSwitcherProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const newProjectInputRef = useRef<HTMLInputElement>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const updateDropdownPosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setEditingId(null);
        setShowNewProjectInput(false);
        setDeleteConfirmId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    if (showNewProjectInput && newProjectInputRef.current) {
      newProjectInputRef.current.focus();
    }
  }, [showNewProjectInput]);

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
    }
  }, [isOpen, updateDropdownPosition]);

  const handleStartEdit = useCallback((project: Project) => {
    setEditingId(project.id);
    setEditingName(project.name);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editingId && editingName.trim()) {
      onRenameProject(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName("");
  }, [editingId, editingName, onRenameProject]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingName("");
  }, []);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSaveEdit();
      } else if (e.key === "Escape") {
        handleCancelEdit();
      }
    },
    [handleSaveEdit, handleCancelEdit]
  );

  const handleCreateProject = useCallback(() => {
    if (newProjectName.trim()) {
      onCreateProject(newProjectName.trim());
      setNewProjectName("");
      setShowNewProjectInput(false);
      setIsOpen(false);
    }
  }, [newProjectName, onCreateProject]);

  const handleNewProjectKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleCreateProject();
      } else if (e.key === "Escape") {
        setShowNewProjectInput(false);
        setNewProjectName("");
      }
    },
    [handleCreateProject]
  );

  const handleDeleteClick = useCallback((projectId: string) => {
    setDeleteConfirmId(projectId);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmId) {
      onDeleteProject(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  }, [deleteConfirmId, onDeleteProject]);

  const handleCancelDelete = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  const handleToggle = useCallback(() => {
    if (!isOpen) {
      updateDropdownPosition();
    }
    setIsOpen(!isOpen);
  }, [isOpen, updateDropdownPosition]);

  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      className="fixed w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-[9999]"
      style={{
        top: dropdownPosition.top,
        left: dropdownPosition.left,
      }}
    >
      <div className="max-h-64 overflow-y-auto">
        {projects.map((project) => (
          <div key={project.id} className="relative">
            {editingId === project.id ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-700/50">
                <input
                  ref={editInputRef}
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={handleSaveEdit}
                  className="p-1 text-emerald-400 hover:text-emerald-300"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-slate-400 hover:text-slate-300"
                >
                  <X size={14} />
                </button>
              </div>
            ) : deleteConfirmId === project.id ? (
              <div className="px-3 py-2 bg-red-500/10 border-b border-red-500/20">
                <p className="text-xs text-slate-300 mb-2">
                  Delete "{project.name}"? This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-2 py-1 bg-slate-700/50 hover:bg-slate-700 rounded text-xs text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="flex-1 px-2 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-xs text-red-400 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  onSelectProject(project.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-700/50 transition-colors ${
                  project.id === activeProjectId ? "bg-violet-500/10" : ""
                }`}
              >
                <span
                  className={`text-sm ${
                    project.id === activeProjectId ? "text-violet-300" : "text-slate-200"
                  }`}
                >
                  {project.name}
                </span>
                <div className="flex items-center gap-1">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(project);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        handleStartEdit(project);
                      }
                    }}
                    className="p-1 text-slate-500 hover:text-slate-300 transition-all cursor-pointer"
                    style={{ opacity: 1 }}
                  >
                    <Edit2 size={12} />
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(project.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.stopPropagation();
                        handleDeleteClick(project.id);
                      }
                    }}
                    className="p-1 text-slate-500 hover:text-red-400 transition-all cursor-pointer"
                    style={{ opacity: 1 }}
                  >
                    <Trash2 size={12} />
                  </div>
                </div>
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-700">
        {showNewProjectInput ? (
          <div className="flex items-center gap-2 px-3 py-2">
            <input
              ref={newProjectInputRef}
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={handleNewProjectKeyDown}
              placeholder="Project name"
              className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={handleCreateProject}
              disabled={!newProjectName.trim()}
              className="p-1 text-emerald-400 hover:text-emerald-300 disabled:text-slate-600"
            >
              <Check size={14} />
            </button>
            <button
              onClick={() => {
                setShowNewProjectInput(false);
                setNewProjectName("");
              }}
              className="p-1 text-slate-400 hover:text-slate-300"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNewProjectInput(true)}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
          >
            <Plus size={14} />
            <span className="text-sm">New Project</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">B</span>
          </div>
          <span className="text-slate-200 font-medium text-sm">
            {activeProject?.name || "No Project"}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  );
};
