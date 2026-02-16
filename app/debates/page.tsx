"use client";

import { MessageCircle, Users, TrendingUp, AlertCircle } from "lucide-react";

export default function DebatesPage() {
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
          <div className="text-3xl font-bold text-[#8A8A8A] mb-1">0</div>
          <div className="mono-small">ACTIVE DEBATES</div>
        </div>
        <div className="p-4 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
          <div className="text-3xl font-bold text-[#8A8A8A] mb-1">0</div>
          <div className="mono-small">RESOLVED</div>
        </div>
        <div className="p-4 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
          <div className="text-3xl font-bold text-[#8A8A8A] mb-1">0</div>
          <div className="mono-small">PARTICIPANTS</div>
        </div>
      </div>

      {/* Empty State */}
      <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-dashed border-[rgba(255,255,255,0.06)] bg-[#111111]">
        <div className="w-20 h-20 rounded-full bg-[#E8DCC8]/10 flex items-center justify-center mb-6">
          <MessageCircle className="w-10 h-10 text-[#E8DCC8]" />
        </div>
        <h2 className="text-xl font-bold text-[#F5F5F3] mb-2">No Active Debates</h2>
        <p className="text-sm text-[#8A8A8A] max-w-md text-center mb-6">
          Debates will appear when agents disagree on strategy or need collaborative decision making.
        </p>
        
        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 w-full max-w-2xl">
          <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)]">
            <Users className="w-5 h-5 text-[#4ADE80] mb-2" />
            <h3 className="text-xs font-semibold text-[#F5F5F3] mb-1">Multi-Agent</h3>
            <p className="text-xs text-[#8A8A8A]">
              Multiple agents propose and vote on solutions
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)]">
            <TrendingUp className="w-5 h-5 text-[#F59E0B] mb-2" />
            <h3 className="text-xs font-semibold text-[#F5F5F3] mb-1">Strategy</h3>
            <p className="text-xs text-[#8A8A8A]">
              Debates focus on high-impact decisions
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)]">
            <AlertCircle className="w-5 h-5 text-[#C4785B] mb-2" />
            <h3 className="text-xs font-semibold text-[#F5F5F3] mb-1">Consensus</h3>
            <p className="text-xs text-[#8A8A8A]">
              Coordinator selects winning approach
            </p>
          </div>
        </div>
      </div>

      {/* How Debates Work */}
      <div className="premium-card p-6">
        <h3 className="virgil-label text-[#F5F5F3] mb-4">HOW DEBATES WORK</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E8DCC8]/10 flex items-center justify-center text-[#E8DCC8] font-bold text-sm">
              1
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#F5F5F3] mb-1">Disagreement Detected</h4>
              <p className="text-sm text-[#8A8A8A]">
                When agents have conflicting approaches to a problem, a debate is initiated.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E8DCC8]/10 flex items-center justify-center text-[#E8DCC8] font-bold text-sm">
              2
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#F5F5F3] mb-1">Agents Propose Solutions</h4>
              <p className="text-sm text-[#8A8A8A]">
                Each agent presents their position with evidence and confidence scores.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E8DCC8]/10 flex items-center justify-center text-[#E8DCC8] font-bold text-sm">
              3
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#F5F5F3] mb-1">Voting & Discussion</h4>
              <p className="text-sm text-[#8A8A8A]">
                Agents vote on proposals and can refine their positions based on discussion.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#E8DCC8]/10 flex items-center justify-center text-[#E8DCC8] font-bold text-sm">
              4
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#F5F5F3] mb-1">Resolution</h4>
              <p className="text-sm text-[#8A8A8A]">
                Coordinator reviews all positions and selects the winning approach to implement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
