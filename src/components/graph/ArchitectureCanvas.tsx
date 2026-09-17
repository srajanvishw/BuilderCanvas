import React, { useRef, useState, useCallback, useMemo } from "react";
import { GraphNode as GraphNodeType, GraphEdge, Task, ViewState } from "../../types/graph";
import { GraphNode } from "./GraphNode";
import { GraphEdge as GraphEdgeComponent } from "./GraphEdge";
import { TempEdge } from "./TempEdge";
import { AddNodeForm } from "./AddNodeForm";
import { TaskPanel } from "./TaskPanel";
import { useCanvasInteraction } from "../../hooks/useCanvasInteraction";
import { getConnectedNodeIds, getConnectedEdgeIds } from "../../utils/dependency";
import { generateEdgeId, canCreateEdge, NODE_WIDTH, NODE_HEIGHT, generateNodeId } from "../../utils/graph";
import { getPanToCenterNode, screenToSVG } from "../../utils/coordinates";

interface ArchitectureCanvasProps {
  nodes: GraphNodeType[];
  edges: GraphEdge[];
  tasks: Task[];
  viewState: ViewState;
  onNodesChange: (nodes: GraphNodeType[]) => void;
  onEdgesChange: (edges: GraphEdge[]) => void;
  onTasksChange: (tasks: Task[]) => void;
  onViewStateChange: (viewState: ViewState) => void;
  showAddNodeForm: boolean;
  onShowAddNodeFormChange: (show: boolean) => void;
  addNodeFormPosition: { x: number; y: number };
  onAddNodeFormPositionChange: (pos: { x: number; y: number }) => void;
}

const GridPattern: React.FC = () => (
  <defs>
    <pattern
      id="grid"
      width="40"
      height="40"
      patternUnits="userSpaceOnUse"
    >
      <path
        d="M 40 0 L 0 0 0 40"
        fill="none"
        className="stroke-slate-800"
        strokeWidth="0.5"
      />
    </pattern>
    <pattern
      id="gridLarge"
      width="200"
      height="200"
      patternUnits="userSpaceOnUse"
    >
      <rect width="200" height="200" fill="url(#grid)" />
      <path
        d="M 200 0 L 0 0 0 200"
        fill="none"
        className="stroke-slate-700/50"
        strokeWidth="0.5"
      />
    </pattern>
  </defs>
);

export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = ({
  nodes,
  edges,
  tasks,
  viewState,
  onNodesChange,
  onEdgesChange,
  onTasksChange,
  onViewStateChange,
  showAddNodeForm,
  onShowAddNodeFormChange,
  addNodeFormPosition,
  onAddNodeFormPositionChange,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [selectedNodeId, nodes]);

  const handleNodePositionChange = useCallback(
    (nodeId: string, x: number, y: number) => {
      onNodesChange(
        nodes.map((node) =>
          node.id === nodeId ? { ...node, x, y } : node
        )
      );
    },
    [nodes, onNodesChange]
  );

  const handleEdgeCreate = useCallback(
    (sourceId: string, targetId: string) => {
      const { valid } = canCreateEdge(sourceId, targetId, edges);
      if (!valid) return;

      const newEdge: GraphEdge = {
        id: generateEdgeId(sourceId, targetId),
        source: sourceId,
        target: targetId,
      };

      onEdgesChange([...edges, newEdge]);
    },
    [edges, onEdgesChange]
  );

  const handleTaskAdd = useCallback((task: Task) => {
    onTasksChange([...tasks, task]);
  }, [tasks, onTasksChange]);

  const handleTasksAdd = useCallback((newTasks: Task[]) => {
    onTasksChange([...tasks, ...newTasks]);
  }, [tasks, onTasksChange]);

  const handleTaskToggle = useCallback((taskId: string) => {
    onTasksChange(
      tasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  }, [tasks, onTasksChange]);

  const handleTaskDelete = useCallback((taskId: string) => {
    onTasksChange(tasks.filter((task) => task.id !== taskId));
  }, [tasks, onTasksChange]);

  const handleNodeDelete = useCallback(
    (nodeId: string) => {
      onNodesChange(nodes.filter((node) => node.id !== nodeId));
      onEdgesChange(
        edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      onTasksChange(tasks.filter((task) => task.nodeId !== nodeId));
      setSelectedNodeId(null);
    },
    [nodes, edges, tasks, onNodesChange, onEdgesChange, onTasksChange]
  );

  const handleNodeAdd = useCallback(
    (type: GraphNodeType["type"], label: string, description: string) => {
      const container = containerRef.current;
      const svg = svgRef.current;

      if (!container || !svg) return;

      const rect = container.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const svgPos = screenToSVG(centerX, centerY, viewState, svg);
      const newNode: GraphNodeType = {
        id: generateNodeId(),
        type,
        label,
        description: description || undefined,
        x: svgPos.x - NODE_WIDTH / 2,
        y: svgPos.y - NODE_HEIGHT / 2,
      };

      onNodesChange([...nodes, newNode]);
      onShowAddNodeFormChange(false);
      setSelectedNodeId(newNode.id);
    },
    [nodes, viewState, onNodesChange, onShowAddNodeFormChange]
  );

  const handleFocusNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      const container = containerRef.current;
      const svg = svgRef.current;

      if (!node || !container || !svg) return;

      const rect = container.getBoundingClientRect();
      const { panX, panY } = getPanToCenterNode(
        node.x,
        node.y,
        NODE_WIDTH,
        NODE_HEIGHT,
        rect.width,
        rect.height,
        viewState.zoom
      );

      onViewStateChange({
        ...viewState,
        panX,
        panY,
      });
    },
    [nodes, viewState, onViewStateChange]
  );

  const connectedNodeIds = useMemo(() => {
    if (!selectedNodeId) {
      return new Set<string>();
    }

    return getConnectedNodeIds(selectedNodeId, edges);
  }, [selectedNodeId, edges]);

  const connectedEdgeIds = useMemo(() => {
    if (!selectedNodeId) {
      return new Set<string>();
    }

    return getConnectedEdgeIds(connectedNodeIds, edges);
  }, [selectedNodeId, connectedNodeIds, edges]);

  const handleNodeClick = useCallback((nodeId: string) => {
    setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId));
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const setViewState = useCallback(
    (updater: React.SetStateAction<ViewState>) => {
      const newState = typeof updater === "function" ? updater(viewState) : updater;
      onViewStateChange(newState);
    },
    [viewState, onViewStateChange]
  );

  const {
    mode,
    connectState,
    connectPoint,
    connectTargetId,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
  } = useCanvasInteraction(
    viewState,
    setViewState,
    nodes,
    handleNodePositionChange,
    selectedNodeId,
    handleNodeClick,
    handleCanvasClick,
    edges,
    handleEdgeCreate
  );

  const nodesMap = new Map(nodes.map((n) => [n.id, n]));

  const showTempEdge = mode === "connecting" && connectState && connectPoint;
  const tempEdgeValid = connectTargetId !== null;

  return (
    <div className="w-full h-full bg-slate-900 overflow-hidden flex">
      <div ref={containerRef} className="flex-1 relative overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          className="block"
          style={{ background: "#0f172a" }}
          onPointerDown={(e) => handlePointerDown(e, svgRef.current)}
          onPointerMove={(e) => handlePointerMove(e, svgRef.current)}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={(e) => handleWheel(e, svgRef.current)}
        >
          <GridPattern />

          <g
            className="canvas-background"
            transform={`translate(${viewState.panX}, ${viewState.panY}) scale(${viewState.zoom})`}
          >
            <rect
              x={-10000}
              y={-10000}
              width={20000}
              height={20000}
              fill="url(#gridLarge)"
              className="pointer-events-none"
            />
          </g>

          <g
            className="edges"
            transform={`translate(${viewState.panX}, ${viewState.panY}) scale(${viewState.zoom})`}
          >
            {edges.map((edge) => {
              const sourceNode = nodesMap.get(edge.source);
              const targetNode = nodesMap.get(edge.target);

              if (!sourceNode || !targetNode) return null;

              const isHighlighted =
                selectedNodeId !== null && connectedEdgeIds.has(edge.id);
              const isFaded =
                selectedNodeId !== null && !connectedEdgeIds.has(edge.id);

              return (
                <GraphEdgeComponent
                  key={edge.id}
                  edgeId={edge.id}
                  sourceNode={sourceNode}
                  targetNode={targetNode}
                  isHighlighted={isHighlighted}
                  isFaded={isFaded}
                />
              );
            })}

            {showTempEdge && connectState && (
              <TempEdge
                sourceX={connectState.sourceX}
                sourceY={connectState.sourceY}
                targetX={connectPoint.x}
                targetY={connectPoint.y}
                isValid={tempEdgeValid}
              />
            )}
          </g>

          <g
            className="nodes"
            transform={`translate(${viewState.panX}, ${viewState.panY}) scale(${viewState.zoom})`}
          >
            {nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const isHighlighted =
                selectedNodeId !== null && connectedNodeIds.has(node.id);
              const isFaded =
                selectedNodeId !== null && !connectedNodeIds.has(node.id);

              const isConnectSource =
                mode === "connecting" && connectState?.sourceNodeId === node.id;
              const isConnectTarget =
                mode === "connecting" && connectTargetId === node.id;

              return (
                <GraphNode
                  key={node.id}
                  node={node}
                  tasks={tasks}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted}
                  isFaded={isFaded}
                  connectSourceId={isConnectSource ? node.id : null}
                  connectTargetId={isConnectTarget ? node.id : null}
                />
              );
            })}
          </g>
        </svg>

        {showAddNodeForm && (
          <AddNodeForm
            onSubmit={handleNodeAdd}
            onCancel={() => onShowAddNodeFormChange(false)}
            position={addNodeFormPosition}
          />
        )}

        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/50">
          <span className="text-xs text-slate-500">
            Drag from port to connect
          </span>
        </div>

        <div className="absolute bottom-4 right-4 flex items-center gap-3 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/50">
          <span className="text-xs text-slate-400 font-medium">
            {Math.round(viewState.zoom * 100)}%
          </span>
          {mode === "connecting" && (
            <span className="text-xs text-violet-400 font-medium">
              Connecting...
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-800/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/50">
          <span className="text-xs text-slate-500">
            {nodes.length} nodes · {edges.length} edges
          </span>
        </div>
      </div>

      {selectedNode && (
        <TaskPanel
          node={selectedNode}
          tasks={tasks}
          edges={edges}
          nodes={nodes}
          onTaskAdd={handleTaskAdd}
          onTasksAdd={handleTasksAdd}
          onTaskToggle={handleTaskToggle}
          onTaskDelete={handleTaskDelete}
          onNodeDelete={handleNodeDelete}
          onClose={() => setSelectedNodeId(null)}
          onFocusNode={handleFocusNode}
        />
      )}
    </div>
  );
};
