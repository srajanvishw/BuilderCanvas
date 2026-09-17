import React from "react";
import {
  Globe,
  Server,
  Database,
  Plug,
  Cloud,
  type LucideIcon,
} from "lucide-react";
import { GraphNode as GraphNodeType, NodeType, Task } from "../../types/graph";
import { NODE_WIDTH, NODE_HEIGHT, getNodeProgress } from "../../utils/graph";
import { NodePort } from "./NodePort";

const nodeTypeConfig: Record<
  NodeType,
  { icon: LucideIcon; color: string; bgColor: string; borderColor: string }
> = {
  frontend: {
    icon: Globe,
    color: "text-blue-400",
    bgColor: "fill-blue-400/10",
    borderColor: "stroke-blue-400/30",
  },
  api: {
    icon: Plug,
    color: "text-violet-400",
    bgColor: "fill-violet-400/10",
    borderColor: "stroke-violet-400/30",
  },
  service: {
    icon: Server,
    color: "text-emerald-400",
    bgColor: "fill-emerald-400/10",
    borderColor: "stroke-emerald-400/30",
  },
  database: {
    icon: Database,
    color: "text-amber-400",
    bgColor: "fill-amber-400/10",
    borderColor: "stroke-amber-400/30",
  },
  external: {
    icon: Cloud,
    color: "text-slate-400",
    bgColor: "fill-slate-400/10",
    borderColor: "stroke-slate-400/30",
  },
};

interface GraphNodeProps {
  node: GraphNodeType;
  tasks: Task[];
  isSelected: boolean;
  isHighlighted: boolean;
  isFaded: boolean;
  connectSourceId?: string | null;
  connectTargetId?: string | null;
}

export const GraphNode: React.FC<GraphNodeProps> = ({
  node,
  tasks,
  isSelected,
  isHighlighted,
  isFaded,
  connectSourceId,
  connectTargetId,
}) => {
  const config = nodeTypeConfig[node.type];
  const Icon = config.icon;

  const leftPortX = node.x;
  const rightPortX = node.x + NODE_WIDTH;
  const portY = node.y + NODE_HEIGHT / 2;

  const opacity = isFaded ? 0.25 : 1;
  const transition = "opacity 0.2s ease-out";

  const isConnectSource = connectSourceId === node.id;
  const isConnectTarget = connectTargetId === node.id;

  const progress = getNodeProgress(node.id, tasks);
  const hasTasks = progress.total > 0;
  const progressWidth = hasTasks ? (progress.percent / 100) * (NODE_WIDTH - 24) : 0;

  return (
    <g
      data-node-id={node.id}
      style={{
        cursor: "grab",
        opacity,
        transition,
      }}
    >
      {isSelected && (
        <rect
          x={node.x - 3}
          y={node.y - 3}
          width={NODE_WIDTH + 6}
          height={NODE_HEIGHT + 6}
          rx={10}
          fill="none"
          className="stroke-violet-400"
          strokeWidth={2}
          style={{ opacity: 1 }}
        />
      )}

      {isHighlighted && !isSelected && (
        <rect
          x={node.x - 2}
          y={node.y - 2}
          width={NODE_WIDTH + 4}
          height={NODE_HEIGHT + 4}
          rx={9}
          fill="none"
          className="stroke-slate-400"
          strokeWidth={1}
          style={{ opacity: 0.5 }}
        />
      )}

      <rect
        x={node.x}
        y={node.y}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={8}
        className={`fill-slate-800/90 stroke-slate-600/50 stroke-[1] ${config.borderColor}`}
      />

      <rect
        x={node.x}
        y={node.y}
        width={NODE_WIDTH}
        height={28}
        rx={8}
        className={config.bgColor}
      />
      <rect
        x={node.x}
        y={node.y + 20}
        width={NODE_WIDTH}
        height={8}
        className={config.bgColor}
      />

      <g transform={`translate(${node.x + 12}, ${node.y + 8})`}>
        <Icon size={14} className={config.color} strokeWidth={1.5} />
      </g>

      <text
        x={node.x + 32}
        y={node.y + 20}
        className="fill-slate-100 text-xs font-medium font-sans pointer-events-none"
        style={{ fontSize: "11px" }}
      >
        {node.label}
      </text>

      {node.description && (
        <text
          x={node.x + 12}
          y={node.y + 48}
          className="fill-slate-400 pointer-events-none"
          style={{ fontSize: "10px" }}
        >
          {node.description}
        </text>
      )}

      <rect
        x={node.x + 12}
        y={node.y + 60}
        width={NODE_WIDTH - 24}
        height={8}
        rx={2}
        className="fill-slate-700/50 pointer-events-none"
      />

      {hasTasks && (
        <rect
          x={node.x + 12}
          y={node.y + 60}
          width={progressWidth}
          height={8}
          rx={2}
          className="fill-violet-500 pointer-events-none"
          style={{
            transition: "width 0.3s ease-out",
          }}
        />
      )}

      {hasTasks && (
        <text
          x={node.x + NODE_WIDTH - 12}
          y={node.y + 66}
          className="fill-slate-300 pointer-events-none text-xs"
          style={{ fontSize: "9px", textAnchor: "end" }}
        >
          {progress.percent}%
        </text>
      )}

      <NodePort
        x={leftPortX}
        y={portY}
        side="left"
        isHighlighted={isHighlighted}
        isConnectTarget={isConnectTarget}
        isConnectSource={isConnectSource}
      />
      <NodePort
        x={rightPortX}
        y={portY}
        side="right"
        isHighlighted={isHighlighted}
        isConnectTarget={isConnectTarget}
        isConnectSource={isConnectSource}
      />
    </g>
  );
};
