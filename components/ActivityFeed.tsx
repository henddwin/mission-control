"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ActivityCard } from "./ActivityCard";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Loader2 } from "lucide-react";

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
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedType === undefined ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedType(undefined)}
        >
          All Activities
        </Button>
        {actionTypes.map((type: string) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(type)}
          >
            {type.replace(/_/g, " ")}
          </Button>
        ))}
      </div>

      <div className="space-y-3">
        {activities.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50">
            <p className="text-sm text-zinc-500">No activities found</p>
          </div>
        ) : (
          activities.map((activity: any) => (
            <ActivityCard key={activity._id} activity={activity} />
          ))
        )}
      </div>

      {activities.length > 0 && (
        <div className="flex items-center justify-center">
          <Badge variant="secondary" className="text-xs">
            Showing {activities.length} {activities.length === 1 ? "activity" : "activities"}
          </Badge>
        </div>
      )}
    </div>
  );
}
