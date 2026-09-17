export type NodeType = "frontend" | "service" | "database" | "api" | "external";

export type GraphNode = {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  x: number;
  y: number;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
};

export type Task = {
  id: string;
  nodeId: string;
  title: string;
  completed: boolean;
};

export type ViewState = {
  panX: number;
  panY: number;
  zoom: number;
};

export type Project = {
  id: string;
  name: string;
  createdAt: number;
  nodes: GraphNode[];
  edges: GraphEdge[];
  tasks: Task[];
  viewState: ViewState;
};

export type AppState = {
  projects: Project[];
  activeProjectId: string;
};
