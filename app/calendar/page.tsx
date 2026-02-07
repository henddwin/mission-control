import { CalendarView } from "@/components/CalendarView";

export default function CalendarPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Calendar</h1>
        <p className="mt-1 md:mt-2 text-sm md:text-base text-zinc-500">
          Scheduled tasks, cron jobs, and reminders
        </p>
      </div>
      <CalendarView />
    </div>
  );
}
