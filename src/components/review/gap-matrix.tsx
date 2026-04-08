"use client";

import { useState, useEffect } from "react";

export interface GapScore {
  framework: string;
  domain: string;
  score: number; // 0-100
  detail: string;
}

interface GapMatrixProps {
  scores: GapScore[] | null;
  onCellClick?: (score: GapScore) => void;
}

const FRAMEWORKS = [
  "NIST AI RMF",
  "DAMA-DMBOK 2",
  "POPIA",
  "EU AI Act",
  "IEEE Ethics",
  "SA National AI Policy",
] as const;

const DOMAINS = [
  "Strategy & Planning",
  "Risk Management",
  "Data Quality",
  "AI Ethics",
  "Privacy & Compliance",
  "Monitoring & Audit",
] as const;

function getCellColor(score: number): string {
  if (score >= 80) return "bg-accent-success";
  if (score >= 60) return "bg-accent-ai";
  if (score >= 40) return "bg-accent-governance";
  return "bg-accent-risk";
}

function getCellOpacity(score: number): number {
  // Higher score = more opaque within its tier
  const tierBase = score >= 80 ? 80 : score >= 60 ? 60 : score >= 40 ? 40 : 0;
  const tierRange = score >= 80 ? 20 : 20;
  const positionInTier = (score - tierBase) / tierRange;
  return 0.5 + positionInTier * 0.5;
}

function lookupScore(
  scores: GapScore[],
  framework: string,
  domain: string
): GapScore | undefined {
  return scores.find(
    (s) => s.framework === framework && s.domain === domain
  );
}

export function GapMatrix({ scores, onCellClick }: GapMatrixProps) {
  const [mounted, setMounted] = useState(false);
  const [tooltip, setTooltip] = useState<{
    score: GapScore;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    // Trigger staggered animation after mount
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!scores || scores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
        <svg
          className="w-12 h-12 mb-4 opacity-30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z"
          />
        </svg>
        <p className="text-sm font-body">
          No standards alignment data available yet.
        </p>
        <p className="text-xs text-text-secondary/60 mt-1">
          Run the Data &amp; AI Analyst agent to generate gap analysis scores.
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-bg-secondary px-3 py-2 text-left text-xs font-medium text-text-secondary font-body min-w-[160px]">
              Domain / Framework
            </th>
            {FRAMEWORKS.map((fw) => (
              <th
                key={fw}
                className="px-2 py-2 text-center text-[10px] font-medium text-text-secondary font-body min-w-[100px] leading-tight"
              >
                {fw}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DOMAINS.map((domain, rowIndex) => (
            <tr key={domain} className="border-t border-border/50">
              <td className="sticky left-0 z-10 bg-bg-secondary px-3 py-2 text-xs text-text-primary font-body whitespace-nowrap">
                {domain}
              </td>
              {FRAMEWORKS.map((fw, colIndex) => {
                const entry = lookupScore(scores, fw, domain);
                const score = entry?.score ?? 0;
                const delay = rowIndex * FRAMEWORKS.length + colIndex;

                return (
                  <td key={fw} className="px-1 py-1 text-center">
                    <button
                      type="button"
                      className={`
                        w-full h-10 rounded-md flex items-center justify-center
                        text-xs font-mono font-bold text-white/90
                        transition-all duration-300 cursor-pointer
                        hover:scale-105 hover:ring-1 hover:ring-white/20
                        ${getCellColor(score)}
                        ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
                      `}
                      style={{
                        opacity: mounted ? getCellOpacity(score) : 0,
                        transitionDelay: mounted ? `${delay * 40}ms` : "0ms",
                      }}
                      onClick={() => {
                        if (entry && onCellClick) {
                          onCellClick(entry);
                        }
                      }}
                      onMouseEnter={(e) => {
                        if (entry) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltip({
                            score: entry,
                            x: rect.left + rect.width / 2,
                            y: rect.top - 8,
                          });
                        }
                      }}
                      onMouseLeave={() => setTooltip(null)}
                      aria-label={`${domain} - ${fw}: ${score}%`}
                    >
                      {score}%
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 px-3">
        <span className="text-[10px] text-text-secondary font-body">
          Gap Severity:
        </span>
        {[
          { label: "80-100%", color: "bg-accent-success" },
          { label: "60-79%", color: "bg-accent-ai" },
          { label: "40-59%", color: "bg-accent-governance" },
          { label: "0-39%", color: "bg-accent-risk" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded-sm ${color} opacity-75`} />
            <span className="text-[10px] text-text-secondary font-body">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-bg-tertiary border border-border rounded-lg px-3 py-2 shadow-xl pointer-events-none max-w-[240px]"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="text-[11px] font-medium text-text-primary font-body">
            {tooltip.score.framework}
          </div>
          <div className="text-[10px] text-text-secondary font-body mt-0.5">
            {tooltip.score.domain}
          </div>
          <div className="text-xs font-mono font-bold text-text-primary mt-1">
            {tooltip.score.score}%
          </div>
          {tooltip.score.detail && (
            <p className="text-[10px] text-text-secondary font-body mt-1 leading-relaxed">
              {tooltip.score.detail}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
