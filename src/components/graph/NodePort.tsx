import React from "react";

interface NodePortProps {
  x: number;
  y: number;
  side: "left" | "right";
  isHighlighted?: boolean;
  isConnectTarget?: boolean;
  isConnectSource?: boolean;
}

export const NodePort: React.FC<NodePortProps> = ({
  x,
  y,
  side,
  isHighlighted = false,
  isConnectTarget = false,
  isConnectSource = false,
}) => {
  let fillColor = "fill-slate-800";
  let strokeColor = "stroke-slate-500";
  let strokeWidth = 1.5;
  let radius = 4;

  if (isConnectSource) {
    fillColor = "fill-violet-500";
    strokeColor = "stroke-violet-400";
    strokeWidth = 2;
  } else if (isConnectTarget) {
    fillColor = "fill-emerald-500";
    strokeColor = "stroke-emerald-400";
    strokeWidth = 2;
    radius = 5;
  } else if (isHighlighted) {
    fillColor = "fill-slate-300";
    strokeColor = "stroke-slate-200";
  }

  return (
    <circle
      cx={x}
      cy={y}
      r={radius}
      className={`${fillColor} ${strokeColor}`}
      strokeWidth={strokeWidth}
      data-port-side={side}
      style={{
        transition: isConnectTarget || isConnectSource ? "none" : "fill 0.2s ease-out, stroke 0.2s ease-out",
      }}
    />
  );
};
