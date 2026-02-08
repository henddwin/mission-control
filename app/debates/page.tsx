"use client";

import { useState } from "react";
import { MessageCircle, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for now - will be replaced with real Convex queries
const mockDebates = [
  {
    id: "1",
    topic: "Should we migrate to a microservices architecture?",
    participants: [
      { emoji: "🤖", name: "Lead Agent", confidence: 85 },
      { emoji: "🔧", name: "DevOps Specialist", confidence: 72 },
      { emoji: "💼", name: "Product Manager", confidence: 60 },
    ],
    entryCount: 24,
    status: "active",
    createdAt: Date.now() - 3600000,
  },
  {
    id: "2",
    topic: "Best approach for implementing real-time notifications",
    participants: [
      { emoji: "⚡", name: "Backend Lead", confidence: 90 },
      { emoji: "🎨", name: "Frontend Specialist", confidence: 78 },
    ],
    entryCount: 15,
    status: "active",
    createdAt: Date.now() - 7200000,
  },
];

export default function DebatesPage() {
  const [expandedDebate, setExpandedDebate] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-fade-in mb-20 md:mb-0">
      {/* Header */}
      <div>
        <h1 className="virgil-label text-[#F5F5F3] mb-2">DEBATE ARENA</h1>
        <p className="text-sm text-[#8A8A8A]">
          Multi-agent collaborative decision making and reasoning
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
          <div className="text-3xl font-bold text-[#F5F5F3] mb-1">
            {mockDebates.filter(d => d.status === "active").length}
          </div>
          <div className="mono-small">ACTIVE DEBATES</div>
        </div>
        <div className="p-4 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
          <div className="text-3xl font-bold text-[#F5F5F3] mb-1">
            {mockDebates.reduce((sum, d) => sum + d.entryCount, 0)}
          </div>
          <div className="mono-small">TOTAL ENTRIES</div>
        </div>
        <div className="p-4 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
          <div className="text-3xl font-bold text-[#F5F5F3] mb-1">
            {mockDebates.reduce((sum, d) => sum + d.participants.length, 0)}
          </div>
          <div className="mono-small">PARTICIPANTS</div>
        </div>
      </div>

      {/* Debates list */}
      <div className="space-y-4">
        {mockDebates.map((debate) => {
          const isExpanded = expandedDebate === debate.id;
          
          return (
            <div
              key={debate.id}
              className="premium-card overflow-hidden"
            >
              {/* Debate header */}
              <div 
                className="p-6 cursor-pointer hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                onClick={() => setExpandedDebate(isExpanded ? null : debate.id)}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-[#F5F5F3] mb-2 leading-snug">
                      {debate.topic}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-[#8A8A8A]" />
                        <span className="mono-small">{debate.entryCount} ENTRIES</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#8A8A8A]" />
                        <span className="mono-small">{debate.participants.length} AGENTS</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="px-3 py-1.5 rounded-lg bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20 text-xs font-mono uppercase">
                      {debate.status}
                    </div>
                  </div>
                </div>

                {/* Participants preview */}
                <div className="flex items-center -space-x-3">
                  {debate.participants.map((participant, idx) => (
                    <div
                      key={idx}
                      className="w-10 h-10 rounded-full bg-[#0A0A0A] border-2 border-[#111111] flex items-center justify-center text-lg"
                      title={participant.name}
                    >
                      {participant.emoji}
                    </div>
                  ))}
                </div>
              </div>

              {/* Expanded view - participant positions */}
              {isExpanded && (
                <div className="border-t border-[rgba(255,255,255,0.06)] p-6 bg-[rgba(0,0,0,0.2)] animate-slide-up">
                  <h4 className="mono-small mb-4">PARTICIPANT POSITIONS</h4>
                  <div className="space-y-4">
                    {debate.participants.map((participant, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{participant.emoji}</span>
                            <div>
                              <div className="text-sm font-medium text-[#F5F5F3]">
                                {participant.name}
                              </div>
                              <div className="text-xs text-[#8A8A8A] font-mono">
                                {participant.confidence}% CONFIDENCE
                              </div>
                            </div>
                          </div>
                          <TrendingUp className="w-4 h-4 text-[#4ADE80]" />
                        </div>
                        {/* Confidence bar */}
                        <div className="h-2 bg-[#0A0A0A] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#E8DCC8] to-[#C4785B]"
                            style={{ width: `${participant.confidence}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action buttons */}
                  <div className="mt-6 flex gap-3">
                    <button className="flex-1 px-4 py-3 rounded-lg bg-[#E8DCC8] text-[#0A0A0A] font-mono text-sm uppercase tracking-wider hover:bg-[#C4785B] transition-colors">
                      View Full Debate
                    </button>
                    <button className="px-4 py-3 rounded-lg bg-[#111111] text-[#8A8A8A] border border-[rgba(255,255,255,0.06)] font-mono text-sm uppercase tracking-wider hover:border-[#E8DCC8]/30 hover:text-[#F5F5F3] transition-colors">
                      Resolve
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state if no debates */}
      {mockDebates.length === 0 && (
        <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-dashed border-[rgba(255,255,255,0.06)] bg-[#111111]">
          <div className="text-4xl mb-4">💬</div>
          <p className="text-sm text-[#8A8A8A] font-mono">No active debates</p>
        </div>
      )}
    </div>
  );
}
