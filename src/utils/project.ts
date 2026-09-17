import { Project, AppState } from "../types/graph";

export function generateProjectId(): string {
  return `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getActiveProject(state: AppState): Project | null {
  return state.projects.find((p) => p.id === state.activeProjectId) || null;
}

export function createEmptyProject(name: string): Project {
  return {
    id: generateProjectId(),
    name,
    createdAt: Date.now(),
    nodes: [],
    edges: [],
    tasks: [],
    viewState: {
      panX: 0,
      panY: 0,
      zoom: 1,
    },
  };
}

export function createProjectFromData(
  name: string,
  nodes: Project["nodes"],
  edges: Project["edges"],
  tasks: Project["tasks"]
): Project {
  return {
    id: generateProjectId(),
    name,
    createdAt: Date.now(),
    nodes,
    edges,
    tasks,
    viewState: {
      panX: 0,
      panY: 0,
      zoom: 1,
    },
  };
}

export function getFirstProjectId(state: AppState): string | null {
  return state.projects.length > 0 ? state.projects[0].id : null;
}
