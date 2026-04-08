"use client";

import { useMemo } from "react";
import type { MaturityScore } from "@/types/agent";

interface MaturityRadarProps {
  scores: MaturityScore[];
  size?: number;
}

export function MaturityRadar({ scores, size = 280 }: MaturityRadarProps) {
  const center = size / 2;
  const maxRadius = size / 2 - 40;
  const levels = 5;

  const points = useMemo(() => {
    const n = scores.length;
    if (n === 0) return [];

    return scores.map((score, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      const radius = (score.score / levels) * maxRadius;
      return {
        x: center + radius * Math.cos(angle),
        y: center + radius * Math.sin(angle),
        labelX: center + (maxRadius + 24) * Math.cos(angle),
        labelY: center + (maxRadius + 24) * Math.sin(angle),
        score,
        angle,
      };
    });
  }, [scores, center, maxRadius]);

  if (scores.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-text-tertiary text-xs"
        style={{ width: size, height: size }}
      >
        No maturity data yet
      </div>
    );
  }

  const polygonPath = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Grid rings */}
      {Array.from({ length: levels }, (_, i) => {
        const r = ((i + 1) / levels) * maxRadius;
        const n = scores.length;
        const gridPoints = Array.from({ length: n }, (_, j) => {
          const angle = (Math.PI * 2 * j) / n - Math.PI / 2;
          return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
        }).join(" ");
        return (
          <polygon
            key={i}
            points={gridPoints}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={i === levels - 1 ? 1 : 0.5}
            opacity={0.5}
          />
        );
      })}

      {/* Axis lines */}
      {points.map((p, i) => (
        <line
          key={i}
          x1={center}
          y1={center}
          x2={center + maxRadius * Math.cos(p.angle)}
          y2={center + maxRadius * Math.sin(p.angle)}
          stroke="var(--color-border)"
          strokeWidth={0.5}
          opacity={0.5}
        />
      ))}

      {/* Data polygon */}
      <polygon
        points={polygonPath}
        fill="rgba(59, 130, 246, 0.15)"
        stroke="var(--color-accent-governance)"
        strokeWidth={2}
        className="transition-all duration-700 ease-out"
      >
        <animate
          attributeName="opacity"
          from="0"
          to="1"
          dur="0.6s"
          fill="freeze"
        />
      </polygon>

      {/* Data points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r={4}
            fill="var(--color-accent-governance)"
            stroke="var(--color-bg-primary)"
            strokeWidth={2}
          />
          {/* Labels */}
          <text
            x={p.labelX}
            y={p.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-text-secondary text-[10px] font-body"
          >
            {p.score.dimension}
          </text>
          {/* Score */}
          <text
            x={p.labelX}
            y={p.labelY + 12}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-accent-governance text-[11px] font-mono font-bold"
          >
            {p.score.score}/5
          </text>
        </g>
      ))}

      {/* Center dot */}
      <circle cx={center} cy={center} r={2} fill="var(--color-border)" />
    </svg>
  );
}
