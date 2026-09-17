import React from "react";
import { GraphNode } from "../../types/graph";
import { getEdgePath } from "../../utils/graph";

interface GraphEdgeProps {
  edgeId: string;
  sourceNode: GraphNode;
  targetNode: GraphNode;
  isHighlighted: boolean;
  isFaded: boolean;
}

export const GraphEdge: React.FC<GraphEdgeProps> = ({
  edgeId,
  sourceNode,
  targetNode,
  isHighlighted,
  isFaded,
}) => {
  const path = getEdgePath(sourceNode, targetNode);

  const opacity = isFaded ? 0.15 : 1;
  const transition = "opacity 0.2s ease-out";

  if (isHighlighted) {
    return (
      <g data-edge-id={edgeId} style={{ opacity, transition }}>
        <path
          d={path}
          fill="none"
          className="stroke-violet-400"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <path
          d={path}
          fill="none"
          className="stroke-violet-400/30"
          strokeWidth={6}
          strokeLinecap="round"
        />
      </g>
    );
  }

  return (
    <g data-edge-id={edgeId} style={{ opacity, transition }}>
      <path
        d={path}
        fill="none"
        className="stroke-slate-600"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d={path}
        fill="none"
        className="stroke-slate-500/50"
        strokeWidth={4}
        strokeLinecap="round"
      />
    </g>
  );
};
