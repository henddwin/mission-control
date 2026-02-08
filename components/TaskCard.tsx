"use client";

import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: {
    _id: string;
    title: string;
    priority: "low" | "medium" | "high" | "urgent";
    assignees?: Array<{ emoji: string; name: string }>;
    tags?: string[];
    status: "inbox" | "assigned" | "in_progress" | "review" | "done";
  };
  onClick?: () => void;
}

const priorityConfig = {
  urgent: { dot: "bg-[#EF4444]", label: "text-[#EF4444]" },
  high: { dot: "bg-[#F59E0B]", label: "text-[#F59E0B]" },
  medium: { dot: "bg-[#E8DCC8]", label: "text-[#E8DCC8]" },
  low: { dot: "bg-[#8A8A8A]", label: "text-[#8A8A8A]" },
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const priorityStyle = priorityConfig[task.priority];

  return (
    <div
      onClick={onClick}
      className="premium-card p-4 cursor-pointer group active:scale-[0.98] transition-all"
    >
      {/* Title */}
      <h4 className="text-sm font-medium text-[#F5F5F3] mb-3 line-clamp-2 leading-relaxed group-hover:text-[#E8DCC8] transition-colors">
        {task.title}
      </h4>

      {/* Priority indicator */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-2 h-2 rounded-full", priorityStyle.dot)} />
        <span className={cn("text-xs font-mono uppercase tracking-wide", priorityStyle.label)}>
          {task.priority}
        </span>
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.tags.slice(0, 2).map((tag, index) => (
            <span 
              key={index}
              className="px-2 py-1 text-[10px] font-mono uppercase tracking-wide bg-[#0A0A0A] text-[#8A8A8A] rounded border border-[rgba(255,255,255,0.06)]"
            >
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="px-2 py-1 text-[10px] font-mono uppercase tracking-wide bg-[#0A0A0A] text-[#8A8A8A] rounded border border-[rgba(255,255,255,0.06)]">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Assignees */}
      {task.assignees && task.assignees.length > 0 && (
        <div className="flex items-center -space-x-2">
          {task.assignees.slice(0, 3).map((assignee, index) => (
            <div
              key={index}
              className="w-8 h-8 rounded-full bg-[#0A0A0A] border-2 border-[#111111] flex items-center justify-center text-sm"
              title={assignee.name}
            >
              {assignee.emoji}
            </div>
          ))}
          {task.assignees.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-[#0A0A0A] border-2 border-[#111111] flex items-center justify-center text-xs text-[#8A8A8A] font-mono">
              +{task.assignees.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
