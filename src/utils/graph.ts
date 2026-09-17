import { GraphNode, GraphEdge, Task } from "../types/graph";

export const NODE_WIDTH = 200;
export const NODE_HEIGHT = 80;
export const PORT_SIZE = 8;
export const PORT_RADIUS = PORT_SIZE / 2;

export function getEdgePath(
  sourceNode: GraphNode,
  targetNode: GraphNode
): string {
  const sourceX = sourceNode.x + NODE_WIDTH;
  const sourceY = sourceNode.y + NODE_HEIGHT / 2;
  const targetX = targetNode.x;
  const targetY = targetNode.y + NODE_HEIGHT / 2;

  const dx = targetX - sourceX;
  const controlOffset = Math.max(50, Math.min(150, Math.abs(dx) * 0.5));

  const cp1x = sourceX + controlOffset;
  const cp1y = sourceY;
  const cp2x = targetX - controlOffset;
  const cp2y = targetY;

  return `M ${sourceX} ${sourceY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetX} ${targetY}`;
}

export function getNodeCenter(node: GraphNode): { x: number; y: number } {
  return {
    x: node.x + NODE_WIDTH / 2,
    y: node.y + NODE_HEIGHT / 2,
  };
}

export function getPortPosition(
  node: GraphNode,
  side: "left" | "right"
): { x: number; y: number } {
  return {
    x: side === "left" ? node.x : node.x + NODE_WIDTH,
    y: node.y + NODE_HEIGHT / 2,
  };
}

export function canCreateEdge(
  sourceId: string,
  targetId: string,
  existingEdges: GraphEdge[]
): { valid: boolean; reason?: string } {
  if (sourceId === targetId) {
    return { valid: false, reason: "Cannot connect node to itself" };
  }

  const edgeExists = existingEdges.some(
    (edge) =>
      (edge.source === sourceId && edge.target === targetId) ||
      (edge.source === targetId && edge.target === sourceId)
  );

  if (edgeExists) {
    return { valid: false, reason: "Edge already exists" };
  }

  return { valid: true };
}

export function generateEdgeId(sourceId: string, targetId: string): string {
  return `edge-${sourceId}-${targetId}-${Date.now()}`;
}

export function generateTaskId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateNodeId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getNodeProgress(
  nodeId: string,
  tasks: Task[]
): { total: number; completed: number; percent: number } {
  const nodeTasks = tasks.filter((task) => task.nodeId === nodeId);
  const total = nodeTasks.length;
  const completed = nodeTasks.filter((task) => task.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, percent };
}
