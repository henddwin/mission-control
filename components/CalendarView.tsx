"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  format,
  eachDayOfInterval,
  isSameDay,
  startOfDay,
  endOfDay,
} from "date-fns";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Button } from "./ui/button";
import { CalendarEvent } from "./CalendarEvent";

export function CalendarView() {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });

  const tasks = useQuery(api.scheduledTasks.getWeekTasks, {
    weekStart: weekStart.getTime(),
    weekEnd: weekEnd.getTime(),
  });

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getTasksForDay = (day: Date) => {
    if (!tasks) return [];
    const dayStart = startOfDay(day).getTime();
    const dayEnd = endOfDay(day).getTime();
    return tasks.filter((task: any) => {
      // Recurring/cron active tasks show on every day
      if (
        task.status === "active" &&
        (task.scheduleType === "cron" || task.scheduleType === "recurring")
      ) {
        return true;
      }
      // One-shot tasks show on their specific day
      return task.nextRun && task.nextRun >= dayStart && task.nextRun <= dayEnd;
    });
  };

  const goToPreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToToday = () => setCurrentWeek(new Date());

  if (tasks === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white">
            {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
          </h2>
          <p className="text-sm text-zinc-500">
            {tasks.length} scheduled {tasks.length === 1 ? "task" : "tasks"} this week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Desktop: 7-column grid */}
      <div className="hidden md:grid grid-cols-7 gap-3">
        {days.map((day) => {
          const dayTasks = getTasksForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className="min-h-[180px] rounded-lg border border-zinc-800 bg-zinc-950/50 p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className={`text-xs font-medium ${isToday ? "text-blue-400" : "text-zinc-500"}`}>
                    {format(day, "EEE")}
                  </div>
                  <div className={`text-lg font-bold ${isToday ? "text-blue-400" : "text-white"}`}>
                    {format(day, "d")}
                  </div>
                </div>
                {dayTasks.length > 0 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-950 text-xs font-bold text-blue-400">
                    {dayTasks.length}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                {dayTasks.map((task: any) => (
                  <CalendarEvent key={task._id} task={task} />
                ))}
              </div>
              {dayTasks.length === 0 && (
                <div className="flex h-24 items-center justify-center text-xs text-zinc-600">
                  No tasks
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: stacked list */}
      <div className="md:hidden space-y-3">
        {days.map((day) => {
          const dayTasks = getTasksForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`text-sm font-bold ${isToday ? "text-blue-400" : "text-white"}`}
                  >
                    {format(day, "EEE, MMM d")}
                  </div>
                  {isToday && (
                    <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] font-medium text-blue-400">
                      TODAY
                    </span>
                  )}
                </div>
                {dayTasks.length > 0 && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-950 text-xs font-bold text-blue-400">
                    {dayTasks.length}
                  </div>
                )}
              </div>
              {dayTasks.length > 0 ? (
                <div className="space-y-2">
                  {dayTasks.map((task: any) => (
                    <CalendarEvent key={task._id} task={task} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-600 py-1">No tasks</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
