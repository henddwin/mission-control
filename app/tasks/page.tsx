"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TaskCard } from "@/components/TaskCard";
import { TaskDetail } from "@/components/TaskDetail";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Id } from "@/convex/_generated/dataModel";

const columns = [
  { id: "inbox", label: "INBOX" },
  { id: "assigned", label: "ASSIGNED" },
  { id: "in_progress", label: "IN PROGRESS" },
  { id: "review", label: "REVIEW" },
  { id: "done", label: "DONE" },
];

export default function TasksPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<Id<"tasks"> | null>(null);
  
  // Fetch tasks for each status
  const inboxTasks = useQuery(api.tasks.list, { status: "inbox" });
  const assignedTasks = useQuery(api.tasks.list, { status: "assigned" });
  const inProgressTasks = useQuery(api.tasks.list, { status: "in_progress" });
  const reviewTasks = useQuery(api.tasks.list, { status: "review" });
  const doneTasks = useQuery(api.tasks.list, { status: "done" });

  const tasksByStatus = {
    inbox: inboxTasks,
    assigned: assignedTasks,
    in_progress: inProgressTasks,
    review: reviewTasks,
    done: doneTasks,
  };

  const isLoading = Object.values(tasksByStatus).some((tasks) => tasks === undefined);

  return (
    <>
      <div className="space-y-8 animate-fade-in pb-20 md:pb-0">
        {/* Header */}
        <div>
          <h1 className="virgil-label text-[#F5F5F3] mb-2">TASK BOARD</h1>
          <p className="text-sm text-[#8A8A8A]">
            Kanban view of all tasks across the pipeline
          </p>
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#8A8A8A]" />
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 md:-mx-8 lg:-mx-12 px-6 md:px-8 lg:px-12 pb-4">
            <div className="flex gap-4 min-w-max">
              {columns.map((column) => {
                const tasks = tasksByStatus[column.id as keyof typeof tasksByStatus] || [];
                return (
                  <div
                    key={column.id}
                    className="flex-shrink-0 w-80 flex flex-col animate-slide-up"
                    style={{ animationDelay: `${columns.indexOf(column) * 50}ms` }}
                  >
                    {/* Column header - glass morphism */}
                    <div className="glass-strong p-4 rounded-t-xl mb-3">
                      <div className="flex items-center justify-between">
                        <h2 className="virgil-label text-[#F5F5F3] text-xs">
                          {column.label}
                        </h2>
                        <div className="w-6 h-6 rounded-full bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)] flex items-center justify-center">
                          <span className="text-xs font-mono text-[#E8DCC8]">
                            {tasks.length}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Column content - drag zone */}
                    <div
                      className={cn(
                        "flex-1 space-y-3 rounded-xl border-2 border-dashed border-[rgba(255,255,255,0.06)] bg-[rgba(17,17,17,0.3)] p-3",
                        tasks.length === 0 && "min-h-[400px]"
                      )}
                    >
                      {tasks.length === 0 ? (
                        <div className="flex h-full items-center justify-center">
                          <p className="mono-small opacity-30">EMPTY</p>
                        </div>
                      ) : (
                        tasks.map((task) => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            onClick={() => setSelectedTaskId(task._id)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Task detail modal */}
      {selectedTaskId && (
        <TaskDetail
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </>
  );
}
