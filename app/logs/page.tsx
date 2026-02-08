"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Terminal, Search, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const logTypeColors: Record<string, { text: string; bg: string; label: string }> = {
  action: { text: "text-[#4ADE80]", bg: "bg-[#4ADE80]/10", label: "ACTION" },
  thinking: { text: "text-[#E8DCC8]", bg: "bg-[#E8DCC8]/10", label: "THINK" },
  error: { text: "text-[#EF4444]", bg: "bg-[#EF4444]/10", label: "ERROR" },
  heartbeat: { text: "text-[#8A8A8A]", bg: "bg-[#8A8A8A]/10", label: "BEAT" },
  self_improve: { text: "text-[#C4785B]", bg: "bg-[#C4785B]/10", label: "IMPROVE" },
};

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", { 
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false 
  });
}

export default function LogsPage() {
  const logs = useQuery(api.agentLogs.listRecent, { limit: 100 });
  const agents = useQuery(api.agents.list, {});
  const [selectedAgent, setSelectedAgent] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const agentMap = new Map((agents ?? []).map((a: any) => [a.sessionKey, a]));

  const filteredLogs = (logs ?? [])
    .filter((log: any) => selectedAgent === "all" || log.agentSessionKey === selectedAgent)
    .filter((log: any) => log.content.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredLogs.length, autoScroll]);

  const agentTabs = [{ sessionKey: "all", name: "All Agents", emoji: "📋" }, ...(agents ?? []).map((a: any) => ({ sessionKey: a.sessionKey, name: a.name, emoji: a.emoji }))];

  return (
    <div className="space-y-6 animate-fade-in mb-20 md:mb-0">
      <div>
        <h1 className="virgil-label text-[#F5F5F3] mb-2">&quot;AGENT LOGS&quot;</h1>
        <p className="text-sm text-[#8A8A8A]">Real-time activity stream from all agents</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex flex-wrap gap-2">
          {agentTabs.map((agent: any) => (
            <button
              key={agent.sessionKey}
              onClick={() => setSelectedAgent(agent.sessionKey)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all",
                selectedAgent === agent.sessionKey
                  ? "bg-[#E8DCC8] text-[#0A0A0A] font-semibold"
                  : "bg-[#111111] text-[#8A8A8A] border border-[rgba(255,255,255,0.06)] hover:border-[#E8DCC8]/30 hover:text-[#F5F5F3]"
              )}
            >
              {agent.emoji} {agent.name}
            </button>
          ))}
        </div>

        <div className="flex-1 md:max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8A8A]" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#111111] text-sm text-[#F5F5F3] placeholder:text-[#8A8A8A] focus:border-[#E8DCC8] focus:outline-none transition-colors font-mono"
          />
        </div>

        <button
          onClick={() => setAutoScroll(!autoScroll)}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all",
            autoScroll ? "bg-[#E8DCC8] text-[#0A0A0A]" : "bg-[#111111] text-[#8A8A8A] border border-[rgba(255,255,255,0.06)]"
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
            <span className="mono-small">TERMINAL</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
            <div className="w-3 h-3 rounded-full bg-[#4ADE80]" />
          </div>
        </div>

        <div className="bg-[#0A0A0A] p-4 font-mono text-xs overflow-auto max-h-[600px]">
          {logs === undefined ? (
            <div className="flex items-center justify-center h-64 text-[#8A8A8A] animate-pulse">
              Loading logs...
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#8A8A8A]">
              <Terminal className="w-8 h-8 mb-3 opacity-30" />
              <p>No logs yet</p>
              <p className="text-[#666] mt-1">Logs appear when agents run tasks or heartbeats</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLogs.map((log: any, idx: number) => {
                const typeStyle = logTypeColors[log.type] || logTypeColors.action;
                const agent = agentMap.get(log.agentSessionKey);
                return (
                  <div key={idx} className={cn("flex items-start gap-3 p-2 rounded hover:bg-[rgba(255,255,255,0.02)] transition-colors", typeStyle.bg)}>
                    <span className="text-[#8A8A8A] flex-shrink-0">[{formatTimestamp(log.timestamp)}]</span>
                    <span className={cn("flex-shrink-0", typeStyle.text)}>[{typeStyle.label}]</span>
                    <span className="text-[#E8DCC8] flex-shrink-0">{agent?.emoji || "🤖"} {agent?.name || log.agentSessionKey}:</span>
                    <span className="text-[#F5F5F3] flex-1">{log.content}</span>
                  </div>
                );
              })}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Stats footer */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-6">
          <div>
            <span className="mono-small">TOTAL LOGS</span>
            <div className="text-lg font-bold text-[#F5F5F3]">{filteredLogs.length}</div>
          </div>
          <div>
            <span className="mono-small">ERRORS</span>
            <div className="text-lg font-bold text-[#EF4444]">{filteredLogs.filter((l: any) => l.type === "error").length}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="status-dot active" />
          <span className="mono-small">LIVE</span>
        </div>
      </div>
    </div>
  );
}
