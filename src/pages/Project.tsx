import React, { useState, useCallback } from "react";
import { ArchitectureCanvas } from "../components/graph/ArchitectureCanvas";
import { ProjectSwitcher } from "../components/ProjectSwitcher";
import { AppState, Project } from "../types/graph";
import { demoGraph } from "../data/demoGraph";
import {
  createEmptyProject,
  createProjectFromData,
  getActiveProject,
  getFirstProjectId,
} from "../utils/project";

const DEFAULT_PROJECT_NAME = "E-commerce Platform";

const createInitialState = (): AppState => {
  const defaultProject = createProjectFromData(
    DEFAULT_PROJECT_NAME,
    demoGraph.nodes,
    demoGraph.edges,
    demoGraph.tasks
  );

  return {
    projects: [defaultProject],
    activeProjectId: defaultProject.id,
  };
};

export const ProjectPage: React.FC = () => {
  const [state, setState] = useState<AppState>(createInitialState);
  const [showAddNodeForm, setShowAddNodeForm] = useState(false);
  const [addNodeFormPosition, setAddNodeFormPosition] = useState({ x: 0, y: 0 });

  const activeProject = getActiveProject(state);

  const handleSelectProject = useCallback((projectId: string) => {
    setState((prev) => ({
      ...prev,
      activeProjectId: projectId,
    }));
  }, []);

  const handleCreateProject = useCallback((name: string) => {
    const newProject = createEmptyProject(name);

    setState((prev) => ({
      projects: [...prev.projects, newProject],
      activeProjectId: newProject.id,
    }));
  }, []);

  const handleRenameProject = useCallback((projectId: string, newName: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId ? { ...p, name: newName } : p
      ),
    }));
  }, []);

  const handleDeleteProject = useCallback((projectId: string) => {
    setState((prev) => {
      const remainingProjects = prev.projects.filter((p) => p.id !== projectId);

      if (remainingProjects.length === 0) {
        const newDefaultProject = createProjectFromData(
          DEFAULT_PROJECT_NAME,
          demoGraph.nodes,
          demoGraph.edges,
          demoGraph.tasks
        );
        return {
          projects: [newDefaultProject],
          activeProjectId: newDefaultProject.id,
        };
      }

      const newActiveId =
        prev.activeProjectId === projectId
          ? remainingProjects[0].id
          : prev.activeProjectId;

      return {
        projects: remainingProjects,
        activeProjectId: newActiveId,
      };
    });
  }, []);

  const handleNodesChange = useCallback((nodes: Project["nodes"]) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === prev.activeProjectId ? { ...p, nodes } : p
      ),
    }));
  }, []);

  const handleEdgesChange = useCallback((edges: Project["edges"]) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === prev.activeProjectId ? { ...p, edges } : p
      ),
    }));
  }, []);

  const handleTasksChange = useCallback((tasks: Project["tasks"]) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === prev.activeProjectId ? { ...p, tasks } : p
      ),
    }));
  }, []);

  const handleViewStateChange = useCallback((viewState: Project["viewState"]) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === prev.activeProjectId ? { ...p, viewState } : p
      ),
    }));
  }, []);

  const handleAddNodeClick = useCallback(() => {
    setAddNodeFormPosition({ x: 200, y: 60 });
    setShowAddNodeForm(true);
  }, []);

  if (!activeProject) {
    const firstProjectId = getFirstProjectId(state);
    if (firstProjectId) {
      return (
        <div className="w-screen h-screen flex items-center justify-center bg-slate-900">
          <div className="text-slate-400">Loading...</div>
        </div>
      );
    }

    const newDefaultProject = createProjectFromData(
      DEFAULT_PROJECT_NAME,
      demoGraph.nodes,
      demoGraph.edges,
      demoGraph.tasks
    );
    setState({
      projects: [newDefaultProject],
      activeProjectId: newDefaultProject.id,
    });
    return null;
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-slate-900">
      <header className="h-12 border-b border-slate-800 flex items-center px-4 bg-slate-900/95 backdrop-blur-sm flex-shrink-0">
        <ProjectSwitcher
          projects={state.projects}
          activeProjectId={state.activeProjectId}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
          onRenameProject={handleRenameProject}
          onDeleteProject={handleDeleteProject}
        />

        <div className="w-px h-6 bg-slate-700 mx-4" />

        <button
          onClick={handleAddNodeClick}
          disabled={showAddNodeForm}
          className="flex items-center gap-2 px-3 py-1.5 bg-violet-500 hover:bg-violet-400 disabled:bg-violet-500/50 rounded-lg text-sm text-white font-medium shadow-lg transition-colors"
        >
          <span>+</span>
          <span>Add Node</span>
        </button>

        <div className="ml-auto flex items-center gap-4">
          <span className="text-xs text-slate-500">
            {state.projects.length} project{state.projects.length !== 1 ? "s" : ""}
          </span>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <ArchitectureCanvas
          key={activeProject.id}
          nodes={activeProject.nodes}
          edges={activeProject.edges}
          tasks={activeProject.tasks}
          viewState={activeProject.viewState}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onTasksChange={handleTasksChange}
          onViewStateChange={handleViewStateChange}
          showAddNodeForm={showAddNodeForm}
          onShowAddNodeFormChange={setShowAddNodeForm}
          addNodeFormPosition={addNodeFormPosition}
          onAddNodeFormPositionChange={setAddNodeFormPosition}
        />
      </main>
    </div>
  );
};
