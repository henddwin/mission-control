"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Mail,
  Search,
  FileText,
  Clock,
  MessageSquare,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Code,
  Database,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  activity: {
    _id: string;
    timestamp: number;
    actionType: string;
    title: string;
    details?: string;
    status: string;
    metadata?: any;
  };
}

const actionIcons: Record<string, any> = {
  email_sent: Mail,
  search: Search,
  file_created: FileText,
  cron_executed: Clock,
  message_sent: MessageSquare,
  deployment: Zap,
  system_fix: Code,
  integration_setup: Database,
  content_pipeline: Send,
  skill_installed: Code,
  project_created: FileText,
};

const actionColors: Record<string, string> = {
  email_sent: "border-blue-500/50",
  search: "border-purple-500/50",
  file_created: "border-green-500/50",
  cron_executed: "border-orange-500/50",
  message_sent: "border-pink-500/50",
  deployment: "border-[#E8DCC8]/50",
  system_fix: "border-[#C4785B]/50",
  integration_setup: "border-cyan-500/50",
  content_pipeline: "border-yellow-500/50",
  skill_installed: "border-green-500/50",
  project_created: "border-blue-500/50",
};

const actionBgColors: Record<string, string> = {
  email_sent: "bg-blue-500/5",
  search: "bg-purple-500/5",
  file_created: "bg-green-500/5",
  cron_executed: "bg-orange-500/5",
  message_sent: "bg-pink-500/5",
  deployment: "bg-[#E8DCC8]/5",
  system_fix: "bg-[#C4785B]/5",
  integration_setup: "bg-cyan-500/5",
  content_pipeline: "bg-yellow-500/5",
  skill_installed: "bg-green-500/5",
  project_created: "bg-blue-500/5",
};

export function ActivityCard({ activity }: ActivityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = actionIcons[activity.actionType] || FileText;
  const borderColor = actionColors[activity.actionType] || "border-gray-500/50";
  const bgColor = actionBgColors[activity.actionType] || "bg-gray-500/5";

  return (
    <div className={cn(
      "premium-card overflow-hidden group relative",
      "border-l-[3px]",
      borderColor
    )}>
      {/* Background accent */}
      <div className={cn("absolute inset-0 opacity-50", bgColor)} />
      
      <div className="relative p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
            <Icon className="w-5 h-5 text-[#E8DCC8]" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-medium text-[#F5F5F3] mb-1 leading-snug">
                  {activity.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="mono-small">
                    {format(new Date(activity.timestamp), "HH:mm:ss")}
                  </span>
                  <span className="text-[#333333]">•</span>
                  <span className="text-xs uppercase tracking-wider font-mono text-[#8A8A8A]">
                    {activity.actionType.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Status indicator */}
              <div className="flex-shrink-0">
                {activity.status === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-[#4ADE80]" />
                ) : activity.status === "failed" ? (
                  <XCircle className="h-4 w-4 text-[#EF4444]" />
                ) : (
                  <Clock className="h-4 w-4 text-[#F59E0B]" />
                )}
              </div>
            </div>

            {/* Details toggle */}
            {activity.details && (
              <div className="mt-3">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1.5 text-xs text-[#8A8A8A] hover:text-[#E8DCC8] transition-colors font-mono uppercase tracking-wide"
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" />
                      Hide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      Details
                    </>
                  )}
                </button>
                
                {expanded && (
                  <div className="mt-3 rounded-lg bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)] p-4 animate-slide-up">
                    <div className="text-sm text-[#F5F5F3] leading-relaxed whitespace-pre-wrap font-mono">
                      {activity.details}
                    </div>
                    
                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                        <div className="mono-small mb-2">METADATA</div>
                        <pre className="text-xs text-[#8A8A8A] overflow-x-auto font-mono">
                          {JSON.stringify(activity.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
