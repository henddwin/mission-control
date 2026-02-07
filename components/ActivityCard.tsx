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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
};

const actionColors: Record<string, string> = {
  email_sent: "text-blue-400 bg-blue-950",
  search: "text-purple-400 bg-purple-950",
  file_created: "text-green-400 bg-green-950",
  cron_executed: "text-orange-400 bg-orange-950",
  message_sent: "text-pink-400 bg-pink-950",
};

export function ActivityCard({ activity }: ActivityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = actionIcons[activity.actionType] || FileText;
  const colorClasses = actionColors[activity.actionType] || "text-gray-400 bg-gray-950";

  return (
    <Card className="border-zinc-800 bg-zinc-900/50 transition-all hover:bg-zinc-900">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start gap-3 md:gap-4">
          <div className={cn("rounded-lg p-1.5 md:p-2 flex-shrink-0", colorClasses)}>
            <Icon className="h-4 w-4 md:h-5 md:w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-medium text-white truncate">
                  {activity.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                  <span className="whitespace-nowrap">
                    {format(new Date(activity.timestamp), "MMM d, h:mm a")}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <Badge variant="outline" className="text-[10px] md:text-xs">
                    {activity.actionType.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center flex-shrink-0">
                {activity.status === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : activity.status === "failed" ? (
                  <XCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-500" />
                )}
              </div>
            </div>

            {activity.details && (
              <div className="mt-2">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="h-3 w-3" />
                      Hide details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3" />
                      Show details
                    </>
                  )}
                </button>
                {expanded && (
                  <div className="mt-2 rounded-md bg-zinc-950 p-2 md:p-3 text-xs md:text-sm text-zinc-300">
                    {activity.details}
                    {activity.metadata && (
                      <div className="mt-2 border-t border-zinc-800 pt-2">
                        <span className="text-xs font-medium text-zinc-500">Metadata:</span>
                        <pre className="mt-1 text-xs text-zinc-400 overflow-x-auto">
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
      </CardContent>
    </Card>
  );
}
