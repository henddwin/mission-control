import { GlobalSearch } from "@/components/GlobalSearch";

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Search</h1>
        <p className="mt-2 text-zinc-500">
          Search across all activities, documents, memory files, and tasks
        </p>
      </div>
      <GlobalSearch />
    </div>
  );
}
