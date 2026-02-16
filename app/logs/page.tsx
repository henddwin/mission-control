"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Terminal, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const actionTypeColors: Record<string, { text: string; bg: string; label: string }> = {
  deployment: { text: "text-[#4ADE80]", bg: "bg-[#4ADE80]/10", label: "DEPLOY" },
  system_fix: { text: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10", label: "FIX" },
  integration_setup: { text: "text-[#C4785B]", bg: "bg-[#C4785B]/10", label: "SETUP" },
  cron_setup: { text: "text-[#E8DCC8]", bg: "bg-[#E8DCC8]/10", label: "CRON" },
  voice_call: { text: "text-[#A78BFA]", bg: "bg-[#A78BFA]/10", label: "CALL" },
  lead_generation: { text: "text-[#60A5FA]", bg: "bg-[#60A5FA]/10", label: "LEAD" },
  email_drafts: { text: "text-[#34D399]", bg: "bg-[#34D399]/10", label: "EMAIL" },
  content_pipeline: { text: "text-[#FBBF24]", bg: "bg-[#FBBF24]/10", label: "CONTENT" },
  research_complete: { text: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10", label: "RESEARCH" },
  data_enrichment: { text: "text-[#EC4899]", bg: "bg-[#EC4899]/10", label: "DATA" },
  skill_installed: { text: "text-[#14B8A6]", bg: "bg-[#14B8A6]/10", label: "SKILL" },
  project_created: { text: "text-[#F97316]", bg: "bg-[#F97316]/10", label: "PROJECT" },
  memory_update: { text: "text-[#6366F1]", bg: "bg-[#6366F1]/10", label: "MEMORY" },
  spreadsheet_update: { text: "text-[#10B981]", bg: "bg-[#10B981]/10", label: "SHEET" },
};

const statusColors: Record<string, string> = {
  success: "text-[#4ADE80]",
  error: "text-[#EF4444]",
  pending: "text-[#F59E0B]",
  info: "text-[#60A5FA]",
};

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", { 
    hour: "2-digit", 
    minute: "2-digit", 
    second: "2-digit", 
    hour12: false 
  });
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

export default function LogsPage() {
  const activities = useQuery(api.activities.list, { limit: 200 });
  const actionTypes = useQuery(api.activities.getActionTypes);
  
  const [selectedActionType, setSelectedActionType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const filteredActivities = (activities ?? [])
    .filter((activity) => {
      if (selectedActionType && activity.actionType !== selectedActionType) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          activity.title.toLowerCase().includes(query) ||
          activity.details?.toLowerCase().includes(query)
        );
      }
      return true;
    });

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredActivities.length, autoScroll]);

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = formatDate(activity.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, typeof filteredActivities>);

  const errorCount = filteredActivities.filter(a => a.status === "error").length;
  const successCount = filteredActivities.filter(a => a.status === "success").length;

  return (
    <div className="space-y-6 animate-fade-in mb-20 md:mb-0">
      <div>
        <h1 className="virgil-label text-[#F5F5F3] mb-2">&quot;ACTIVITY LOGS&quot;</h1>
        <p className="text-sm text-[#8A8A8A]">Real-time activity stream from all agents and systems</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
          <div className="text-2xl font-bold text-[#F5F5F3] mb-1">
            {filteredActivities.length}
          </div>
          <div className="mono-small">TOTAL LOGS</div>
        </div>
        <div className="p-4 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
          <div className="text-2xl font-bold text-[#4ADE80] mb-1">
            {successCount}
          </div>
          <div className="mono-small">SUCCESS</div>
        </div>
        <div className="p-4 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
          <div className="text-2xl font-bold text-[#EF4444] mb-1">
            {errorCount}
          </div>
          <div className="mono-small">ERRORS</div>
        </div>
        <div className="p-4 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2">
            <div className="status-dot active" />
            <div className="mono-small">LIVE</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#111111] text-sm text-[#F5F5F3] placeholder:text-[#8A8A8A] focus:border-[#E8DCC8] focus:outline-none transition-colors font-mono"
          />
        </div>

        <select
          value={selectedActionType || ""}
          onChange={(e) => setSelectedActionType(e.target.value || null)}
          className="px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#111111] text-sm text-[#F5F5F3] focus:border-[#E8DCC8] focus:outline-none transition-colors font-mono"
        >
          <option value="">All Types</option>
          {(actionTypes ?? []).map((type) => (
            <option key={type} value={type}>
              {actionTypeColors[type]?.label || type.toUpperCase()}
            </option>
          ))}
        </select>

        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap",
            autoScroll 
              ? "bg-[#E8DCC8] text-[#0A0A0A]" 
              : "bg-[#111111] text-[#8A8A8A] border border-[rgba(255,255,255,0.06)]"
          )}
        >
          Auto-scroll {autoScroll ? "ON" : "OFF"}
        </button>
      </div>

      {/* Terminal window */}
      <div className="premium-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#0A0A0A] border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-[#E8DCC8]" />
            <span className="mono-small">ACTIVITY STREAM</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <div className="w-3 h-3 rounded-full bg-[#4ADE80]" />
          </div>
        </div>

        <div className="bg-[#0A0A0A] p-4 font-mono text-xs overflow-auto max-h-[600px]">
          {activities === undefined ? (
            <div className="flex items-center justify-center h-64 text-[#8A8A8A] animate-pulse">
              Loading activity logs...
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#8A8A8A]">
              <Terminal className="w-8 h-8 mb-3 opacity-30" />
              <p>No activity logs found</p>
              {searchQuery || selectedActionType ? (
                <p className="text-[#666] mt-1">Try adjusting your filters</p>
              ) : (
                <p className="text-[#666] mt-1">Logs appear when agents complete tasks</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                <div key={date}>
                  <div className="sticky top-0 bg-[#0A0A0A] py-2 mb-3 border-b border-[rgba(255,255,255,0.06)]">
                    <h3 className="text-[#E8DCC8] font-bold">{date}</h3>
                  </div>
                  <div className="space-y-1">
                    {dateActivities.map((activity, idx) => {
                      const typeStyle = actionTypeColors[activity.actionType] || {
                        text: "text-[#8A8A8A]",
                        bg: "bg-[#8A8A8A]/10",
                        label: activity.actionType.toUpperCase(),
                      };
                      const statusColor = statusColors[activity.status] || "text-[#8A8A8A]";

                      return (
                        <div
                          key={`${activity._id}-${idx}`}
                          className={cn(
                            "flex flex-col gap-2 p-3 rounded hover:bg-[rgba(255,255,255,0.02)] transition-colors",
                            typeStyle.bg
                          )}
                        >
                          <div className="flex items-start gap-3 flex-wrap">
                            <span className="text-[#8A8A8A] flex-shrink-0">
                              [{formatTimestamp(activity.timestamp)}]
                            </span>
                            <span className={cn("flex-shrink-0 font-semibold", typeStyle.text)}>
                              [{typeStyle.label}]
                            </span>
                            <span className={cn("flex-shrink-0 font-semibold", statusColor)}>
                              [{activity.status.toUpperCase()}]
                            </span>
                            <span className="text-[#F5F5F3] flex-1 font-semibold">
                              {activity.title}
                            </span>
                          </div>
                          {activity.details && (
                            <div className="text-[#8A8A8A] pl-[160px] text-xs leading-relaxed">
                              {activity.details}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Action Types Legend */}
      {actionTypes && actionTypes.length > 0 && (
        <div className="premium-card p-6">
          <h3 className="virgil-label text-[#F5F5F3] mb-4">ACTION TYPES</h3>
          <div className="flex flex-wrap gap-2">
            {actionTypes.map((type) => {
              const style = actionTypeColors[type] || {
                text: "text-[#8A8A8A]",
                bg: "bg-[#8A8A8A]/10",
                label: type.toUpperCase(),
              };
              const count = filteredActivities.filter(a => a.actionType === type).length;
              
              return (
                <button
                  key={type}
                  onClick={() => setSelectedActionType(selectedActionType === type ? null : type)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-mono transition-all",
                    selectedActionType === type
                      ? `${style.bg} ${style.text} ring-2 ring-current`
                      : `${style.bg} ${style.text} opacity-60 hover:opacity-100`
                  )}
                >
                  {style.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
