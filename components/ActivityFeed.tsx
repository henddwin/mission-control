"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ActivityCard } from "./ActivityCard";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ActivityFeed() {
  const [selectedType, setSelectedType] = useState<string | undefined>(undefined);
  const activities = useQuery(api.activities.list, {
    actionType: selectedType,
    limit: 100,
  });
  const actionTypes = useQuery(api.activities.getActionTypes);

  if (activities === undefined || actionTypes === undefined) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8A8A8A]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedType(undefined)}
          className={cn(
            "px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all",
            selectedType === undefined
              ? "bg-[#E8DCC8] text-[#0A0A0A] font-semibold"
              : "bg-[#111111] text-[#8A8A8A] border border-[rgba(255,255,255,0.06)] hover:border-[#E8DCC8]/30 hover:text-[#F5F5F3]"
          )}
        >
          All
        </button>
        {actionTypes.map((type: string) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all",
              selectedType === type
                ? "bg-[#E8DCC8] text-[#0A0A0A] font-semibold"
                : "bg-[#111111] text-[#8A8A8A] border border-[rgba(255,255,255,0.06)] hover:border-[#E8DCC8]/30 hover:text-[#F5F5F3]"
            )}
          >
            {type.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Activity list */}
      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[rgba(255,255,255,0.06)] bg-[#111111]">
            <p className="text-sm text-[#8A8A8A] font-mono">No activities found</p>
          </div>
        ) : (
          activities.map((activity: any) => (
            <ActivityCard key={activity._id} activity={activity} />
          ))
        )}
      </div>

      {/* Count badge */}
      {activities.length > 0 && (
        <div className="flex items-center justify-center pt-4">
          <div className="px-4 py-2 rounded-lg bg-[#111111] border border-[rgba(255,255,255,0.06)]">
            <span className="mono-small">
              {activities.length} {activities.length === 1 ? "ACTIVITY" : "ACTIVITIES"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
