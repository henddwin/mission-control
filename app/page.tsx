"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ActivityFeed } from "@/components/ActivityFeed";
import { StatCard } from "@/components/StatCard";
import { AgentCard } from "@/components/AgentCard";
import { Loader2 } from "lucide-react";

export default function Home() {
  const agents = useQuery(api.agents.list);
  const activities = useQuery(api.activities.list, { limit: 10 });
  
  // Calculate stats
  const activeAgents = agents?.filter(a => a.status === "active").length ?? 0;
  const totalAgents = agents?.length ?? 0;
  const todayActivities = activities?.length ?? 0;

  return (
    <div className="space-y-8 animate-fade-in mb-20 md:mb-0">
      {/* Header */}
      <div>
        <h1 className="virgil-label text-[#8A8A8A] mb-2">LIVE FEED</h1>
        <p className="text-sm text-[#8A8A8A]">
          Real-time activity stream and agent status
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
        <StatCard 
          label="ACTIVE AGENTS" 
          value={`${activeAgents}/${totalAgents}`}
          gradient="cream"
          trend={activeAgents > 0 ? "up" : undefined}
          trendValue={activeAgents > 0 ? "online" : undefined}
        />
        <StatCard 
          label="TODAY'S ACTIVITY" 
          value={todayActivities}
          gradient="terracotta"
        />
        <StatCard 
          label="OPEN DEBATES" 
          value={0}
          gradient="success"
        />
        <StatCard 
          label="PENDING TASKS" 
          value="—"
          gradient="warning"
        />
      </div>

      {/* Two-column layout: Activity Feed + Agent Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Feed - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="virgil-label text-[#F5F5F3]">ACTIVITY STREAM</h2>
            <div className="flex items-center gap-2">
              <div className="status-dot active" />
              <span className="mono-small">LIVE</span>
            </div>
          </div>
          <ActivityFeed />
        </div>

        {/* Agent Status - Takes 1 column */}
        <div className="space-y-4">
          <h2 className="virgil-label text-[#F5F5F3]">AGENT STATUS</h2>
          
          {agents === undefined ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#8A8A8A]" />
            </div>
          ) : agents.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[rgba(255,255,255,0.06)] bg-[#111111]">
              <p className="text-sm text-[#8A8A8A]">No agents online</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agents.slice(0, 3).map((agent) => (
                <AgentCard key={agent._id} agent={agent} />
              ))}
              {agents.length > 3 && (
                <a 
                  href="/agents" 
                  className="block text-center py-3 rounded-lg border border-[rgba(255,255,255,0.06)] hover:border-[#E8DCC8]/30 transition-colors text-sm text-[#8A8A8A] hover:text-[#E8DCC8]"
                >
                  View all {agents.length} agents →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
