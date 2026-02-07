import { GlobalSearch } from "@/components/GlobalSearch";

export default function SearchPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white">Search</h1>
        <p className="mt-1 md:mt-2 text-sm md:text-base text-zinc-500">
          Search across all activities, documents, and tasks
        </p>
      </div>
      <GlobalSearch />
    </div>
  );
}
