"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AgentCard } from "@/components/AgentCard";
import { Loader2 } from "lucide-react";

export default function AgentsPage() {
  const agents = useQuery(api.agents.list);

  return (
    <div className="space-y-8 animate-fade-in mb-20 md:mb-0">
      {/* Header */}
      <div>
        <h1 className="virgil-label text-[#F5F5F3] mb-2">AGENTS</h1>
        <p className="text-sm text-[#8A8A8A]">
          All AI agents and their current operational status
        </p>
      </div>

      {/* Stats bar */}
      {agents && agents.length > 0 && (
        <div className="flex flex-wrap gap-6 p-4 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
          <div>
            <div className="text-2xl font-bold text-[#F5F5F3] mb-1">
              {agents.filter(a => a.status === "active").length}
            </div>
            <div className="mono-small">ACTIVE</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#F5F5F3] mb-1">
              {agents.filter(a => a.status === "idle").length}
            </div>
            <div className="mono-small">IDLE</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#F5F5F3] mb-1">
              {agents.filter(a => a.status === "blocked").length}
            </div>
            <div className="mono-small">BLOCKED</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#F5F5F3] mb-1">
              {agents.length}
            </div>
            <div className="mono-small">TOTAL</div>
          </div>
        </div>
      )}

      {/* Content */}
      {agents === undefined ? (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#8A8A8A]" />
        </div>
      ) : agents.length === 0 ? (
        <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-dashed border-[rgba(255,255,255,0.06)] bg-[#111111]">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-sm text-[#8A8A8A] font-mono">No agents registered</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-slide-up">
          {agents.map((agent) => (
            <AgentCard key={agent._id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}
