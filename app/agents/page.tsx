"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, Clock, Activity, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

// Real OpenClaw cron agents configuration
const REAL_AGENTS = [
  {
    id: "b4cc7c17",
    emoji: "🔍",
    name: "Scout",
    role: "Content idea discovery",
    schedule: "every 6h",
    intervalMs: 6 * 60 * 60 * 1000,
  },
  {
    id: "c61bcfae",
    emoji: "✍️",
    name: "Writer",
    role: "Draft creation",
    schedule: "every 2h",
    intervalMs: 2 * 60 * 60 * 1000,
  },
  {
    id: "3b4f30ff",
    emoji: "📚",
    name: "Editor",
    role: "Quality review",
    schedule: "every 3h",
    intervalMs: 3 * 60 * 60 * 1000,
  },
  {
    id: "c3b45f0e",
    emoji: "📢",
    name: "Publisher",
    role: "Distribution",
    schedule: "every 4h",
    intervalMs: 4 * 60 * 60 * 1000,
  },
  {
    id: "e54a04a2",
    emoji: "📣",
    name: "Promoter",
    role: "Cross-platform repurposing",
    schedule: "10am + 4pm",
    intervalMs: 6 * 60 * 60 * 1000, // Treat as ~6h for status check
  },
  {
    id: "b530cdfa",
    emoji: "🔖",
    name: "Bookmark Analyst",
    role: "X bookmark analysis",
    schedule: "every 15min",
    intervalMs: 15 * 60 * 1000,
  },
  {
    id: "3366055d",
    emoji: "📺",
    name: "YouTube Monitor",
    role: "RSS feed checking",
    schedule: "9am + 5pm",
    intervalMs: 8 * 60 * 60 * 1000, // Treat as ~8h for status check
  },
  {
    id: "5a23dbe9",
    emoji: "☎️",
    name: "Wake-Up Call",
    role: "Morning call",
    schedule: "7am daily",
    intervalMs: 24 * 60 * 60 * 1000,
  },
  {
    id: "3554751c",
    emoji: "📋",
    name: "Daily Standup",
    role: "End of day report",
    schedule: "11:30pm",
    intervalMs: 24 * 60 * 60 * 1000,
  },
  {
    id: "ec701d1a",
    emoji: "📞",
    name: "Call Debrief",
    role: "Phone call summaries",
    schedule: "every 1h",
    intervalMs: 1 * 60 * 60 * 1000,
  },
];

function getAgentStatus(lastActivityTime: number | null, intervalMs: number) {
  if (!lastActivityTime) return { status: "idle", color: "text-[#8A8A8A]", label: "IDLE" };
  
  const now = Date.now();
  const timeSinceLastActivity = now - lastActivityTime;
  const threshold = intervalMs * 2; // 2x the expected interval
  const dayThreshold = 24 * 60 * 60 * 1000; // 24h
  
  if (timeSinceLastActivity > dayThreshold) {
    return { status: "error", color: "text-[#EF4444]", label: "OFFLINE" };
  } else if (timeSinceLastActivity > threshold) {
    return { status: "delayed", color: "text-[#F59E0B]", label: "DELAYED" };
  } else {
    return { status: "active", color: "text-[#4ADE80]", label: "ACTIVE" };
  }
}

function formatTimeAgo(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export default function AgentsPage() {
  // Query recent activities from Convex
  const activities = useQuery(api.activities.list, { limit: 500 });

  // Calculate agent statuses based on recent activities
  const agentStatuses = REAL_AGENTS.map(agent => {
    if (!activities) {
      return { ...agent, lastActivity: null, recentActivities: [], status: null };
    }

    // Find activities related to this agent by matching name in title or details
    const agentActivities = activities.filter(activity => {
      const searchText = `${activity.title} ${activity.details || ""}`.toLowerCase();
      return searchText.includes(agent.name.toLowerCase()) || 
             searchText.includes(agent.role.toLowerCase());
    });

    const lastActivity = agentActivities[0]?.timestamp || null;
    const recentActivities = agentActivities.slice(0, 3);
    const status = getAgentStatus(lastActivity, agent.intervalMs);

    return { ...agent, lastActivity, recentActivities, status };
  });

  const activeCount = agentStatuses.filter(a => a.status?.status === "active").length;
  const delayedCount = agentStatuses.filter(a => a.status?.status === "delayed").length;
  const idleCount = agentStatuses.filter(a => a.status?.status === "idle" || a.status?.status === "error").length;

  return (
    <div className="space-y-8 animate-fade-in mb-20 md:mb-0">
      {/* Header */}
      <div>
        <h1 className="virgil-label text-[#F5F5F3] mb-2">AGENTS</h1>
        <p className="text-sm text-[#8A8A8A]">
          Content pipeline agents running as OpenClaw cron jobs
        </p>
      </div>

      {/* Stats bar */}
      {activities && (
        <div className="flex flex-wrap gap-6 p-4 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
          <div>
            <div className="text-2xl font-bold text-[#4ADE80] mb-1">
              {activeCount}
            </div>
            <div className="mono-small">ACTIVE</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#F59E0B] mb-1">
              {delayedCount}
            </div>
            <div className="mono-small">DELAYED</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#8A8A8A] mb-1">
              {idleCount}
            </div>
            <div className="mono-small">IDLE/OFFLINE</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#F5F5F3] mb-1">
              {REAL_AGENTS.length}
            </div>
            <div className="mono-small">TOTAL</div>
          </div>
        </div>
      )}

      {/* Content */}
      {activities === undefined ? (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#8A8A8A]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-slide-up">
          {agentStatuses.map((agent) => {
            const StatusIcon = agent.status?.status === "active" ? CheckCircle2 :
                             agent.status?.status === "delayed" ? AlertCircle :
                             agent.status?.status === "error" ? XCircle :
                             Activity;

            return (
              <div key={agent.id} className="premium-card p-5 hover:border-[#E8DCC8]/20 transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">{agent.emoji}</div>
                  <div className={`flex items-center gap-1.5 ${agent.status?.color || "text-[#8A8A8A]"}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    <span className="text-xs font-mono font-semibold">
                      {agent.status?.label || "LOADING"}
                    </span>
                  </div>
                </div>

                {/* Name & Role */}
                <h3 className="text-lg font-bold text-[#F5F5F3] mb-1">{agent.name}</h3>
                <p className="text-sm text-[#8A8A8A] mb-4">{agent.role}</p>

                {/* Schedule */}
                <div className="flex items-center gap-2 mb-3 text-xs text-[#8A8A8A]">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-mono">{agent.schedule}</span>
                </div>

                {/* Last Activity */}
                {agent.lastActivity && (
                  <div className="mb-3 pb-3 border-b border-[rgba(255,255,255,0.06)]">
                    <div className="mono-small mb-1">LAST ACTIVE</div>
                    <div className="text-sm text-[#F5F5F3]">
                      {formatTimeAgo(agent.lastActivity)}
                    </div>
                  </div>
                )}

                {/* Recent Activities */}
                {agent.recentActivities.length > 0 ? (
                  <div>
                    <div className="mono-small mb-2">RECENT ACTIVITY</div>
                    <div className="space-y-2">
                      {agent.recentActivities.map((activity, idx) => (
                        <div key={idx} className="text-xs p-2 rounded bg-[#0A0A0A]">
                          <div className="text-[#F5F5F3] mb-1 line-clamp-1">
                            {activity.title}
                          </div>
                          <div className="text-[#8A8A8A] font-mono">
                            {formatTimeAgo(activity.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-[#666] italic">
                    No recent activity
                  </div>
                )}

                {/* Cron ID Footer */}
                <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <div className="mono-small text-[#666]">
                    CRON: {agent.id}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
