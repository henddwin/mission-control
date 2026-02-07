import { ActivityFeed } from "@/components/ActivityFeed";

export default function Home() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Activity Feed</h1>
        <p className="mt-1 md:mt-2 text-sm md:text-base text-zinc-500">
          Real-time view of all AI assistant actions
        </p>
      </div>
      <ActivityFeed />
    </div>
  );
}
