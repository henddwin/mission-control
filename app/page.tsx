import { ActivityFeed } from "@/components/ActivityFeed";

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Activity Feed</h1>
        <p className="mt-2 text-zinc-500">
          Real-time view of all AI assistant actions and completed tasks
        </p>
      </div>
      <ActivityFeed />
    </div>
  );
}
