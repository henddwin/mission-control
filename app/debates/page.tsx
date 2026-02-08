"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { MessageCircle, Users, TrendingUp } from "lucide-react";

export default function DebatesPage() {
  const debates = useQuery(api.debates.list, {});
  const agents = useQuery(api.agents.list, {});
  const [expandedDebate, setExpandedDebate] = useState<string | null>(null);

  const agentMap = new Map((agents ?? []).map((a: any) => [a.sessionKey, a]));

  const activeDebates = (debates ?? []).filter((d: any) => d.status === "open" || d.status === "voting");
  const resolvedDebates = (debates ?? []).filter((d: any) => d.status === "resolved");

  return (
    <div className="space-y-8 animate-fade-in mb-20 md:mb-0">
      {/* Header */}
      <div>
        <h1 className="virgil-label text-[#F5F5F3] mb-2">&quot;DEBATE ARENA&quot;</h1>
        <p className="text-sm text-[#8A8A8A]">
          Multi-agent collaborative decision making and reasoning
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
          <div className="text-3xl font-bold text-[#F5F5F3] mb-1">
            {activeDebates.length}
          </div>
          <div className="mono-small">ACTIVE DEBATES</div>
        </div>
        <div className="p-4 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
          <div className="text-3xl font-bold text-[#F5F5F3] mb-1">
            {resolvedDebates.length}
          </div>
          <div className="mono-small">RESOLVED</div>
        </div>
        <div className="p-4 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
          <div className="text-3xl font-bold text-[#F5F5F3] mb-1">
            {(agents ?? []).length}
          </div>
          <div className="mono-small">PARTICIPANTS</div>
        </div>
      </div>

      {/* Debates list */}
      {debates === undefined ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="premium-card p-6 animate-pulse">
              <div className="h-6 bg-[#1a1a1a] rounded w-3/4 mb-4" />
              <div className="h-4 bg-[#1a1a1a] rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : (debates ?? []).length > 0 ? (
        <div className="space-y-4">
          {(debates ?? []).map((debate: any) => {
            const isExpanded = expandedDebate === debate._id;
            const statusColor = debate.status === "resolved" 
              ? "text-[#8A8A8A] bg-[#8A8A8A]/10 border-[#8A8A8A]/20"
              : "text-[#4ADE80] bg-[#4ADE80]/10 border-[#4ADE80]/20";
            
            return (
              <div key={debate._id} className="premium-card overflow-hidden">
                <div 
                  className="p-6 cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  onClick={() => setExpandedDebate(isExpanded ? null : debate._id)}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="text-lg font-semibold text-[#F5F5F3] leading-snug">
                      {debate.topic}
                    </h3>
                    <div className={`flex-shrink-0 px-3 py-1.5 rounded-lg border text-xs font-mono uppercase ${statusColor}`}>
                      {debate.status}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-[#8A8A8A]">
                    <span className="font-mono text-xs">Created by {debate.createdBy}</span>
                    <span className="font-mono text-xs">{new Date(debate.createdAt).toLocaleDateString()}</span>
                  </div>

                  {debate.resolution && (
                    <div className="mt-3 p-3 rounded-lg bg-[#E8DCC8]/5 border border-[#E8DCC8]/10">
                      <div className="mono-small text-[#E8DCC8] mb-1">RESOLUTION</div>
                      <p className="text-sm text-[#F5F5F3]">{debate.resolution}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-dashed border-[rgba(255,255,255,0.06)] bg-[#111111]">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-sm text-[#8A8A8A] font-mono mb-2">No debates yet</p>
          <p className="text-xs text-[#666] max-w-sm text-center">
            Debates are created when agents need to argue different approaches. The coordinator picks the winner.
          </p>
        </div>
      )}
    </div>
  );
}
