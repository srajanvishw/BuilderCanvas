import { GraphEdge } from "../types/graph";

export function getConnectedNodeIds(
  nodeId: string,
  edges: GraphEdge[]
): Set<string> {
  const connected = new Set<string>();
  connected.add(nodeId);

  const visited = new Set<string>();
  const queue = [nodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    for (const edge of edges) {
      if (edge.source === currentId && !visited.has(edge.target)) {
        connected.add(edge.target);
        queue.push(edge.target);
      }
      if (edge.target === currentId && !visited.has(edge.source)) {
        connected.add(edge.source);
        queue.push(edge.source);
      }
    }
  }

  return connected;
}

export function getConnectedEdgeIds(
  connectedNodeIds: Set<string>,
  edges: GraphEdge[]
): Set<string> {
  const connectedEdges = new Set<string>();

  for (const edge of edges) {
    if (connectedNodeIds.has(edge.source) && connectedNodeIds.has(edge.target)) {
      connectedEdges.add(edge.id);
    }
  }

  return connectedEdges;
}
