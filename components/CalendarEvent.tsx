"use client";

import { format } from "date-fns";
import { Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CalendarEventProps {
  task: {
    _id: string;
    name: string;
    description?: string;
    scheduleType: string;
    schedule: string;
    nextRun?: number;
    taskType: string;
    status: string;
    metadata?: any;
  };
}

const taskTypeColors: Record<string, string> = {
  reminder: "bg-blue-900 border-blue-700 text-blue-300",
  monitor: "bg-purple-900 border-purple-700 text-purple-300",
  check: "bg-orange-900 border-orange-700 text-orange-300",
  report: "bg-green-900 border-green-700 text-green-300",
};

export function CalendarEvent({ task }: CalendarEventProps) {
  const colorClasses = taskTypeColors[task.taskType] || "bg-gray-900 border-gray-700 text-gray-300";

  return (
    <div
      className={cn(
        "group relative rounded-lg border p-3 transition-all hover:shadow-lg",
        colorClasses,
        task.status === "disabled" && "opacity-50"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium truncate">{task.name}</h4>
            {task.status === "active" ? (
              <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
            ) : task.status === "disabled" ? (
              <XCircle className="h-3 w-3 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
            )}
          </div>
          {task.nextRun && (
            <div className="mt-1 flex items-center gap-1 text-xs opacity-75">
              <Clock className="h-3 w-3" />
              <span>{format(new Date(task.nextRun), "h:mm a")}</span>
            </div>
          )}
          {task.description && (
            <p className="mt-1 text-xs opacity-75 line-clamp-2">{task.description}</p>
          )}
        </div>
        <Badge variant="outline" className="text-xs flex-shrink-0">
          {task.taskType}
        </Badge>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs opacity-60">
        <span className="font-mono">{task.schedule}</span>
      </div>
    </div>
  );
}
