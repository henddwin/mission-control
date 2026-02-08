"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

interface TaskDetailProps {
  taskId: Id<"tasks">;
  onClose: () => void;
}

const statusColumns = [
  { value: "inbox", label: "Inbox" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

const priorityConfig = {
  urgent: { bg: "bg-[#EF4444]/10", text: "text-[#EF4444]", border: "border-[#EF4444]/20" },
  high: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", border: "border-[#F59E0B]/20" },
  medium: { bg: "bg-[#E8DCC8]/10", text: "text-[#E8DCC8]", border: "border-[#E8DCC8]/20" },
  low: { bg: "bg-[#8A8A8A]/10", text: "text-[#8A8A8A]", border: "border-[#8A8A8A]/20" },
};

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function TaskDetail({ taskId, onClose }: TaskDetailProps) {
  const [comment, setComment] = useState("");
  const task = useQuery(api.tasks.getById, { taskId });
  const messages = useQuery(api.messages.listByTask, { taskId });
  const updateStatus = useMutation(api.tasks.updateStatus);
  const addComment = useMutation(api.messages.create);

  const handleStatusChange = async (newStatus: string) => {
    await updateStatus({ taskId, status: newStatus as any });
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    await addComment({
      taskId,
      content: comment,
      authorName: "You",
      authorEmoji: "👤",
    });
    setComment("");
  };

  if (!task) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <Loader2 className="h-8 w-8 animate-spin text-[#E8DCC8]" />
      </div>
    );
  }

  const priorityStyle = priorityConfig[task.priority];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-end bg-black/80 backdrop-blur-sm">
      {/* Overlay click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Slide-in panel */}
      <div className="relative w-full md:w-[600px] md:h-full bg-[#0A0A0A] border-l border-[rgba(255,255,255,0.06)] flex flex-col animate-slide-in-right max-h-[90vh] md:max-h-full rounded-t-2xl md:rounded-none">
        {/* Header */}
        <div className="flex-shrink-0 p-6 border-b border-[rgba(255,255,255,0.06)] glass-strong">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-[#F5F5F3] mb-3 leading-snug">
                {task.title}
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className={cn(
                  "inline-block px-3 py-1.5 rounded-lg border text-xs font-mono uppercase tracking-wider",
                  priorityStyle.bg,
                  priorityStyle.text,
                  priorityStyle.border
                )}>
                  {task.priority}
                </span>
                {task.tags?.map((tag, index) => (
                  <span 
                    key={index}
                    className="inline-block px-3 py-1.5 rounded-lg bg-[#111111] text-[#8A8A8A] border border-[rgba(255,255,255,0.06)] text-xs font-mono"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-10 h-10 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors flex items-center justify-center text-[#8A8A8A] hover:text-[#F5F5F3]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Description */}
          {task.description && (
            <div>
              <h3 className="mono-small mb-2">DESCRIPTION</h3>
              <p className="text-sm text-[#F5F5F3] whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Assignees */}
          {task.assignees && task.assignees.length > 0 && (
            <div>
              <h3 className="mono-small mb-3">ASSIGNEES</h3>
              <div className="flex flex-wrap gap-2">
                {task.assignees.map((assignee, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]"
                  >
                    <span className="text-xl">{assignee.emoji}</span>
                    <span className="text-sm text-[#F5F5F3]">{assignee.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status controls */}
          <div>
            <h3 className="mono-small mb-3">STATUS</h3>
            <div className="flex flex-wrap gap-2">
              {statusColumns.map((col) => (
                <button
                  key={col.value}
                  onClick={() => handleStatusChange(col.value)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all",
                    task.status === col.value
                      ? "bg-[#E8DCC8] text-[#0A0A0A] font-semibold"
                      : "bg-[#111111] text-[#8A8A8A] border border-[rgba(255,255,255,0.06)] hover:border-[#E8DCC8]/30 hover:text-[#F5F5F3]"
                  )}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div>
            <h3 className="mono-small mb-4">COMMENTS</h3>
            <div className="space-y-4">
              {messages && messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message._id} className="flex gap-3">
                    <div className="flex-shrink-0 text-2xl">{message.authorEmoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-medium text-[#F5F5F3]">{message.authorName}</span>
                        <span className="text-xs text-[#8A8A8A] font-mono">
                          {formatTime(message._creationTime)}
                        </span>
                      </div>
                      <p className="text-sm text-[#F5F5F3] whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#8A8A8A] italic font-mono">No comments yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Comment form */}
        <div className="flex-shrink-0 p-6 border-t border-[rgba(255,255,255,0.06)] glass-strong">
          <form onSubmit={handleSubmitComment} className="flex gap-3">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 px-4 py-3 rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#111111] text-sm text-[#F5F5F3] placeholder:text-[#8A8A8A] focus:border-[#E8DCC8] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!comment.trim()}
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center transition-all",
                comment.trim()
                  ? "bg-[#E8DCC8] text-[#0A0A0A] hover:bg-[#C4785B] active:scale-95"
                  : "bg-[#111111] text-[#8A8A8A] border border-[rgba(255,255,255,0.06)] cursor-not-allowed"
              )}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
