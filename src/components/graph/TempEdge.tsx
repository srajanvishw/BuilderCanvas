import React from "react";

interface TempEdgeProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isValid: boolean;
}

export const TempEdge: React.FC<TempEdgeProps> = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  isValid,
}) => {
  const dx = targetX - sourceX;
  const controlOffset = Math.max(30, Math.min(100, Math.abs(dx) * 0.4));

  const cp1x = sourceX + controlOffset;
  const cp1y = sourceY;
  const cp2x = targetX - controlOffset;
  const cp2y = targetY;

  const path = `M ${sourceX} ${sourceY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${targetX} ${targetY}`;

  const strokeColor = isValid ? "stroke-violet-400" : "stroke-slate-500";
  const opacity = isValid ? 0.9 : 0.5;

  return (
    <g className="temp-edge">
      <path
        d={path}
        fill="none"
        className={`${strokeColor}`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="6 4"
        style={{ opacity }}
      />
      <circle
        cx={targetX}
        cy={targetY}
        r={4}
        className={isValid ? "fill-violet-400" : "fill-slate-500"}
        style={{ opacity }}
      />
    </g>
  );
};
