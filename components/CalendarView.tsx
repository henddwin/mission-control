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
    return tasks.filter(
      (task: any) => task.nextRun && task.nextRun >= dayStart && task.nextRun <= dayEnd
    );
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
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

      <div className="grid grid-cols-7 gap-4">
        {days.map((day) => {
          const dayTasks = getTasksForDay(day);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className="min-h-[200px] rounded-lg border border-zinc-800 bg-zinc-950/50 p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div
                    className={`text-xs font-medium ${
                      isToday ? "text-blue-400" : "text-zinc-500"
                    }`}
                  >
                    {format(day, "EEE")}
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      isToday ? "text-blue-400" : "text-white"
                    }`}
                  >
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
                <div className="flex h-32 items-center justify-center text-xs text-zinc-600">
                  No tasks
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
