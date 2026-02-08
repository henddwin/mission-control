"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, CheckCircle2, Clock, XCircle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface StandupSection {
  agentName: string;
  agentEmoji: string;
  completed: string[];
  inProgress: string[];
  blocked: string[];
  decisions: string[];
}

const sections = [
  { 
    key: "completed" as const, 
    icon: CheckCircle2, 
    label: "COMPLETED",
    color: "text-[#4ADE80]",
    bg: "bg-[#4ADE80]/10",
    border: "border-[#4ADE80]/20",
    dot: "bg-[#4ADE80]"
  },
  { 
    key: "inProgress" as const, 
    icon: Clock, 
    label: "IN PROGRESS",
    color: "text-[#E8DCC8]",
    bg: "bg-[#E8DCC8]/10",
    border: "border-[#E8DCC8]/20",
    dot: "bg-[#E8DCC8]"
  },
  { 
    key: "blocked" as const, 
    icon: XCircle, 
    label: "BLOCKED",
    color: "text-[#EF4444]",
    bg: "bg-[#EF4444]/10",
    border: "border-[#EF4444]/20",
    dot: "bg-[#EF4444]"
  },
  { 
    key: "decisions" as const, 
    icon: Lightbulb, 
    label: "KEY DECISIONS",
    color: "text-[#C4785B]",
    bg: "bg-[#C4785B]/10",
    border: "border-[#C4785B]/20",
    dot: "bg-[#C4785B]"
  },
];

export function StandupView() {
  const standup = useQuery(api.standup.generateStandup);

  if (standup === undefined) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8A8A8A]" />
      </div>
    );
  }

  if (!standup || standup.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center rounded-lg border border-dashed border-[rgba(255,255,255,0.06)] bg-[#111111]">
        <div className="text-4xl mb-4">📊</div>
        <p className="text-sm text-[#8A8A8A] font-mono">No standup data for today</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {standup.map((agentData: StandupSection, index: number) => {
        const hasContent = agentData.completed.length > 0 || 
                          agentData.inProgress.length > 0 || 
                          agentData.blocked.length > 0 || 
                          agentData.decisions.length > 0;

        return (
          <div
            key={index}
            className="premium-card overflow-hidden"
          >
            {/* Agent header */}
            <div className="p-6 border-b border-[rgba(255,255,255,0.06)] bg-gradient-to-r from-[rgba(232,220,200,0.03)] to-transparent">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{agentData.agentEmoji}</div>
                <div>
                  <h2 className="text-2xl font-bold text-[#F5F5F3] mb-1">
                    {agentData.agentName}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="status-dot active" />
                    <span className="mono-small">REPORTING</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              {!hasContent ? (
                <p className="text-sm text-[#8A8A8A] italic font-mono">
                  No activity reported today
                </p>
              ) : (
                <div className="space-y-6">
                  {sections.map((section) => {
                    const items = agentData[section.key];
                    if (!items || items.length === 0) return null;

                    const Icon = section.icon;

                    return (
                      <div key={section.key}>
                        {/* Section header */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg border flex items-center justify-center",
                            section.bg,
                            section.border
                          )}>
                            <Icon className={cn("w-4 h-4", section.color)} />
                          </div>
                          <h3 className={cn("virgil-label text-xs", section.color)}>
                            {section.label}
                          </h3>
                          <span className="text-xs text-[#8A8A8A] font-mono">
                            ({items.length})
                          </span>
                        </div>

                        {/* Items list */}
                        <ul className="space-y-2 pl-11">
                          {items.map((item, i) => (
                            <li 
                              key={i} 
                              className="flex items-start gap-3 text-sm text-[#F5F5F3] leading-relaxed"
                            >
                              <div className={cn(
                                "mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0",
                                section.dot
                              )} />
                              <span className="flex-1">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
