"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Search, Download } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock log data - will be replaced with real Convex queries
const mockLogs = [
  { timestamp: Date.now() - 1000, agent: "Main Agent", type: "action", message: "Executed cron job: morning-briefing" },
  { timestamp: Date.now() - 2000, agent: "Main Agent", type: "thinking", message: "Analyzing recent email threads..." },
  { timestamp: Date.now() - 3000, agent: "Research Agent", type: "action", message: "Web search completed: AI trends 2024" },
  { timestamp: Date.now() - 4000, agent: "Main Agent", type: "heartbeat", message: "Heartbeat check - all systems operational" },
  { timestamp: Date.now() - 5000, agent: "Content Agent", type: "action", message: "Generated blog post draft" },
  { timestamp: Date.now() - 6000, agent: "Main Agent", type: "error", message: "Failed to fetch calendar events - API timeout" },
  { timestamp: Date.now() - 7000, agent: "DevOps Agent", type: "action", message: "Deployment completed successfully" },
  { timestamp: Date.now() - 8000, agent: "Research Agent", type: "thinking", message: "Evaluating sources for credibility..." },
];

const agents = ["All Agents", "Main Agent", "Research Agent", "Content Agent", "DevOps Agent"];

const logTypeColors = {
  action: { text: "text-[#4ADE80]", bg: "bg-[#4ADE80]/10", label: "ACTION" },
  thinking: { text: "text-[#E8DCC8]", bg: "bg-[#E8DCC8]/10", label: "THINK" },
  error: { text: "text-[#EF4444]", bg: "bg-[#EF4444]/10", label: "ERROR" },
  heartbeat: { text: "text-[#8A8A8A]", bg: "bg-[#8A8A8A]/10", label: "BEAT" },
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

export default function LogsPage() {
  const [selectedAgent, setSelectedAgent] = useState("All Agents");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const filteredLogs = mockLogs
    .filter(log => selectedAgent === "All Agents" || log.agent === selectedAgent)
    .filter(log => log.message.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredLogs, autoScroll]);

  return (
    <div className="space-y-6 animate-fade-in mb-20 md:mb-0">
      {/* Header */}
      <div>
        <h1 className="virgil-label text-[#F5F5F3] mb-2">AGENT LOGS</h1>
        <p className="text-sm text-[#8A8A8A]">
          Real-time activity stream from all agents
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Agent filter tabs */}
        <div className="flex flex-wrap gap-2">
          {agents.map((agent) => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all",
                selectedAgent === agent
                  ? "bg-[#E8DCC8] text-[#0A0A0A] font-semibold"
                  : "bg-[#111111] text-[#8A8A8A] border border-[rgba(255,255,255,0.06)] hover:border-[#E8DCC8]/30 hover:text-[#F5F5F3]"
              )}
            >
              {agent}
            </button>
          ))}
        </div>

        {/* Search */}
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

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all",
              autoScroll
                ? "bg-[#E8DCC8] text-[#0A0A0A]"
                : "bg-[#111111] text-[#8A8A8A] border border-[rgba(255,255,255,0.06)]"
            )}
          >
            Auto-scroll {autoScroll ? "ON" : "OFF"}
          </button>
          <button className="px-4 py-2 rounded-lg bg-[#111111] text-[#8A8A8A] border border-[rgba(255,255,255,0.06)] hover:border-[#E8DCC8]/30 hover:text-[#F5F5F3] transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal window */}
      <div className="premium-card overflow-hidden">
        {/* Terminal header */}
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

        {/* Log content */}
        <div className="bg-[#0A0A0A] p-4 font-mono text-xs overflow-auto max-h-[600px]">
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-[#8A8A8A]">
              No logs found
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLogs.map((log, idx) => {
                const typeStyle = logTypeColors[log.type as keyof typeof logTypeColors];
                return (
                  <div
                    key={idx}
                    className={cn(
                      "flex items-start gap-3 p-2 rounded hover:bg-[rgba(255,255,255,0.02)] transition-colors",
                      typeStyle.bg
                    )}
                  >
                    {/* Timestamp */}
                    <span className="text-[#8A8A8A] flex-shrink-0">
                      [{formatTimestamp(log.timestamp)}]
                    </span>
                    
                    {/* Type badge */}
                    <span className={cn("flex-shrink-0", typeStyle.text)}>
                      [{typeStyle.label}]
                    </span>
                    
                    {/* Agent */}
                    <span className="text-[#E8DCC8] flex-shrink-0">
                      {log.agent}:
                    </span>
                    
                    {/* Message */}
                    <span className="text-[#F5F5F3] flex-1">
                      {log.message}
                    </span>
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
            <div className="text-lg font-bold text-[#F5F5F3]">
              {filteredLogs.length}
            </div>
          </div>
          <div>
            <span className="mono-small">ERRORS</span>
            <div className="text-lg font-bold text-[#EF4444]">
              {filteredLogs.filter(l => l.type === "error").length}
            </div>
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
