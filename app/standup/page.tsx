"use client";

import { StandupView } from "@/components/StandupView";
import { format } from "date-fns";

export default function StandupPage() {
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="space-y-8 animate-fade-in mb-20 md:mb-0">
      {/* Header */}
      <div>
        <h1 className="virgil-label text-[#F5F5F3] mb-2">DAILY STANDUP</h1>
        <p className="text-3xl font-bold text-[#F5F5F3] mb-2">
          {today}
        </p>
        <p className="text-sm text-[#8A8A8A]">
          Progress, blockers, and key decisions from all agents
        </p>
      </div>

      {/* Content */}
      <StandupView />
    </div>
  );
}
