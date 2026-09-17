import { ViewState } from "../types/graph";

export function screenToSVG(
  screenX: number,
  screenY: number,
  viewState: ViewState,
  svgElement: SVGSVGElement
): { x: number; y: number } {
  const rect = svgElement.getBoundingClientRect();
  const clientX = screenX - rect.left;
  const clientY = screenY - rect.top;
  
  const svgX = (clientX - viewState.panX) / viewState.zoom;
  const svgY = (clientY - viewState.panY) / viewState.zoom;
  
  return { x: svgX, y: svgY };
}

export function svgToScreen(
  svgX: number,
  svgY: number,
  viewState: ViewState,
  svgElement: SVGSVGElement
): { x: number; y: number } {
  const rect = svgElement.getBoundingClientRect();
  const screenX = svgX * viewState.zoom + viewState.panX + rect.left;
  const screenY = svgY * viewState.zoom + viewState.panY + rect.top;
  
  return { x: screenX, y: screenY };
}

export function screenDeltaToSVGDelta(
  deltaX: number,
  deltaY: number,
  zoom: number
): { dx: number; dy: number } {
  return {
    dx: deltaX / zoom,
    dy: deltaY / zoom,
  };
}

export function clampZoom(zoom: number, min: number = 0.25, max: number = 2.5): number {
  return Math.min(max, Math.max(min, zoom));
}

export function getZoomAtPoint(
  currentZoom: number,
  delta: number,
  screenX: number,
  screenY: number,
  viewState: ViewState,
  svgElement: SVGSVGElement
): { zoom: number; panX: number; panY: number } {
  const rect = svgElement.getBoundingClientRect();
  const clientX = screenX - rect.left;
  const clientY = screenY - rect.top;
  
  const zoomFactor = delta > 0 ? 0.9 : 1.1;
  const newZoom = clampZoom(currentZoom * zoomFactor);
  
  const zoomRatio = newZoom / currentZoom;
  
  const panX = clientX - (clientX - viewState.panX) * zoomRatio;
  const panY = clientY - (clientY - viewState.panY) * zoomRatio;
  
  return { zoom: newZoom, panX, panY };
}

export function getPanToCenterNode(
  nodeX: number,
  nodeY: number,
  nodeWidth: number,
  nodeHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  zoom: number
): { panX: number; panY: number } {
  const nodeCenterX = nodeX + nodeWidth / 2;
  const nodeCenterY = nodeY + nodeHeight / 2;
  
  const panX = canvasWidth / 2 - nodeCenterX * zoom;
  const panY = canvasHeight / 2 - nodeCenterY * zoom;
  
  return { panX, panY };
}
