"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  agent: {
    _id: string;
    name: string;
    emoji: string;
    role: string;
    status: "idle" | "active" | "blocked";
    currentTask?: string;
    lastHeartbeat: number;
    level: "intern" | "specialist" | "lead";
  };
}

function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const levelColors = {
  lead: "text-[#C4785B] bg-[#C4785B]/10 border-[#C4785B]/20",
  specialist: "text-[#E8DCC8] bg-[#E8DCC8]/10 border-[#E8DCC8]/20",
  intern: "text-[#8A8A8A] bg-[#8A8A8A]/10 border-[#8A8A8A]/20",
};

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <div className="premium-card p-5 group relative overflow-hidden">
      {/* Status indicator - top right */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className={cn(
          "status-dot",
          agent.status === "active" && "active",
          agent.status === "idle" && "idle",
          agent.status === "blocked" && "blocked"
        )} />
      </div>

      {/* Agent header */}
      <div className="flex items-start gap-4 mb-4">
        <div className="text-5xl leading-none">
          {agent.emoji}
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-lg font-semibold text-[#F5F5F3] mb-1 truncate">
            {agent.name}
          </h3>
          <p className="text-sm text-[#8A8A8A] truncate">
            {agent.role}
          </p>
        </div>
      </div>

      {/* Level badge */}
      <div className="mb-4">
        <span className={cn(
          "inline-block px-3 py-1 rounded-md border text-xs font-mono uppercase tracking-wider",
          levelColors[agent.level]
        )}>
          {agent.level}
        </span>
      </div>

      {/* Current task */}
      {agent.currentTask && (
        <div className="mb-4 p-3 rounded-lg bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)]">
          <div className="mono-small mb-1.5">CURRENT TASK</div>
          <p className="text-sm text-[#F5F5F3] line-clamp-2 leading-relaxed">
            {agent.currentTask}
          </p>
        </div>
      )}

      {/* Footer - heartbeat */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#8A8A8A] font-mono uppercase tracking-wide">
          Last heartbeat
        </span>
        <span className="text-[#F5F5F3] font-mono">
          {getRelativeTime(agent.lastHeartbeat)}
        </span>
      </div>

      {/* Hover state - "VIEW LOGS →" */}
      <Link
        href="/logs"
        className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]/95 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        <span className="text-sm font-mono uppercase tracking-widest text-[#E8DCC8]">
          VIEW LOGS →
        </span>
      </Link>
    </div>
  );
}
