import { useState, useRef, useCallback } from "react";
import { ViewState, GraphNode, GraphEdge } from "../types/graph";
import {
  screenDeltaToSVGDelta,
  getZoomAtPoint,
  screenToSVG,
} from "../utils/coordinates";
import { canCreateEdge, generateEdgeId, getPortPosition } from "../utils/graph";

type InteractionMode = "idle" | "panning" | "dragging" | "connecting";

type DragState = {
  nodeId: string;
  startX: number;
  startY: number;
  nodeStartX: number;
  nodeStartY: number;
};

type ConnectState = {
  sourceNodeId: string;
  sourcePortSide: "left" | "right";
  sourceX: number;
  sourceY: number;
};

export function useCanvasInteraction(
  viewState: ViewState,
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>,
  nodes: GraphNode[],
  onNodePositionChange: (nodeId: string, x: number, y: number) => void,
  selectedNodeId: string | null,
  onNodeClick: (nodeId: string) => void,
  onCanvasClick: () => void,
  edges: GraphEdge[],
  onEdgeCreate: (sourceId: string, targetId: string) => void
) {
  const [mode, setMode] = useState<InteractionMode>("idle");
  const [connectState, setConnectState] = useState<ConnectState | null>(null);
  const [connectTargetId, setConnectTargetId] = useState<string | null>(null);
  const [connectPoint, setConnectPoint] = useState<{ x: number; y: number } | null>(null);

  const dragStateRef = useRef<DragState | null>(null);
  const lastPanRef = useRef<{ x: number; y: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; nodeId: string } | null>(null);

  const nodesMap = new Map(nodes.map((n) => [n.id, n]));

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>, svgElement: SVGSVGElement | null) => {
      if (e.button !== 0) return;

      const target = e.target as SVGElement;
      const port = target.closest("[data-port-side]");
      const nodeGroup = target.closest("[data-node-id]");

      if (port && nodeGroup && svgElement) {
        const nodeId = nodeGroup.getAttribute("data-node-id");
        const portSide = port.getAttribute("data-port-side") as "left" | "right";

        if (nodeId && (portSide === "left" || portSide === "right")) {
          const node = nodes.find((n) => n.id === nodeId);
          if (node) {
            const portPos = getPortPosition(node, portSide);

            setMode("connecting");
            setConnectState({
              sourceNodeId: nodeId,
              sourcePortSide: portSide,
              sourceX: portPos.x,
              sourceY: portPos.y,
            });
            setConnectPoint({ x: portPos.x, y: portPos.y });
            setConnectTargetId(null);

            (e.target as SVGElement).setPointerCapture(e.pointerId);
            e.stopPropagation();
            return;
          }
        }
      }

      if (nodeGroup) {
        const nodeId = nodeGroup.getAttribute("data-node-id");
        if (nodeId) {
          const node = nodes.find((n) => n.id === nodeId);
          if (node) {
            dragStartRef.current = { x: e.clientX, y: e.clientY, nodeId };

            setMode("dragging");
            dragStateRef.current = {
              nodeId,
              startX: e.clientX,
              startY: e.clientY,
              nodeStartX: node.x,
              nodeStartY: node.y,
            };
            (e.target as SVGElement).setPointerCapture(e.pointerId);
            e.stopPropagation();
            return;
          }
        }
      }

      if (target.tagName === "svg" || target.closest(".canvas-background")) {
        setMode("panning");
        lastPanRef.current = { x: e.clientX, y: e.clientY };
        (e.target as SVGElement).setPointerCapture(e.pointerId);
        e.preventDefault();
      }
    },
    [nodes]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>, svgElement: SVGSVGElement | null) => {
      if (mode === "panning" && lastPanRef.current) {
        const dx = e.clientX - lastPanRef.current.x;
        const dy = e.clientY - lastPanRef.current.y;

        setViewState((prev) => ({
          ...prev,
          panX: prev.panX + dx,
          panY: prev.panY + dy,
        }));

        lastPanRef.current = { x: e.clientX, y: e.clientY };
      } else if (mode === "dragging" && dragStateRef.current) {
        const { startX, startY, nodeStartX, nodeStartY } = dragStateRef.current;

        const screenDeltaX = e.clientX - startX;
        const screenDeltaY = e.clientY - startY;

        const { dx, dy } = screenDeltaToSVGDelta(
          screenDeltaX,
          screenDeltaY,
          viewState.zoom
        );

        const newX = nodeStartX + dx;
        const newY = nodeStartY + dy;

        onNodePositionChange(dragStateRef.current.nodeId, newX, newY);
      } else if (mode === "connecting" && connectState && svgElement) {
        const svgPos = screenToSVG(e.clientX, e.clientY, viewState, svgElement);
        setConnectPoint({ x: svgPos.x, y: svgPos.y });

        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (target) {
          const port = (target as SVGElement).closest("[data-port-side]");
          const nodeGroup = (target as SVGElement).closest("[data-node-id]");

          if (port && nodeGroup) {
            const targetNodeId = nodeGroup.getAttribute("data-node-id");
            if (targetNodeId && targetNodeId !== connectState.sourceNodeId) {
              const { valid } = canCreateEdge(
                connectState.sourceNodeId,
                targetNodeId,
                edges
              );
              setConnectTargetId(valid ? targetNodeId : null);
            } else {
              setConnectTargetId(null);
            }
          } else {
            setConnectTargetId(null);
          }
        } else {
          setConnectTargetId(null);
        }
      }
    },
    [mode, viewState, setViewState, onNodePositionChange, connectState, edges]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (mode === "connecting" && connectState && connectTargetId) {
        onEdgeCreate(connectState.sourceNodeId, connectTargetId);
      }

      if (mode === "dragging" && dragStartRef.current) {
        const { x, y, nodeId } = dragStartRef.current;
        const dx = Math.abs(e.clientX - x);
        const dy = Math.abs(e.clientY - y);

        if (dx < 3 && dy < 3) {
          onNodeClick(nodeId);
        }
      } else if (mode === "panning") {
        const target = e.target as SVGElement;
        if (target.tagName === "svg" || target.closest(".canvas-background")) {
          onCanvasClick();
        }
      }

      if (mode === "connecting") {
        setConnectState(null);
        setConnectPoint(null);
        setConnectTargetId(null);
      }
      if (mode === "panning") {
        lastPanRef.current = null;
      } else if (mode === "dragging") {
        dragStateRef.current = null;
        dragStartRef.current = null;
      }
      setMode("idle");
      (e.target as SVGElement).releasePointerCapture(e.pointerId);
    },
    [mode, connectState, connectTargetId, onEdgeCreate, onNodeClick, onCanvasClick]
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent<SVGSVGElement>, svgElement: SVGSVGElement | null) => {
      if (!svgElement) return;

      e.preventDefault();

      const delta = e.deltaY;
      const { zoom, panX, panY } = getZoomAtPoint(
        viewState.zoom,
        delta,
        e.clientX,
        e.clientY,
        viewState,
        svgElement
      );

      setViewState({ zoom, panX, panY });
    },
    [viewState, setViewState]
  );

  return {
    mode,
    connectState,
    connectPoint,
    connectTargetId,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleWheel,
  };
}
