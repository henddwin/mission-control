import { CalendarView } from "@/components/CalendarView";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Calendar</h1>
        <p className="mt-2 text-zinc-500">
          View all scheduled tasks, cron jobs, and upcoming reminders
        </p>
      </div>
      <CalendarView />
    </div>
  );
}
