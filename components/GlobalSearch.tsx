"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { Search, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Input } from "./ui/input";
import { SearchResult } from "./SearchResult";
import { Badge } from "./ui/badge";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const searchResults = useQuery(
    api.search.searchAll,
    debouncedQuery.trim() ? { query: debouncedQuery.trim() } : "skip"
  );

  const isLoading = query !== debouncedQuery;
  const hasResults =
    searchResults &&
    (searchResults.activities.length > 0 || searchResults.documents.length > 0);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          type="text"
          placeholder="Search activities & documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-10 md:h-12 pl-10 text-sm md:text-base border-zinc-800 bg-zinc-950 text-white placeholder:text-zinc-500"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-zinc-500" />
        )}
      </div>

      {!debouncedQuery.trim() && (
        <div className="flex h-48 md:h-64 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50">
          <Search className="h-10 w-10 md:h-12 md:w-12 text-zinc-700" />
          <p className="mt-3 text-sm text-zinc-500">
            Start typing to search
          </p>
        </div>
      )}

      {debouncedQuery.trim() && !hasResults && searchResults && (
        <div className="flex h-48 md:h-64 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50">
          <p className="text-sm text-zinc-500">
            No results for &quot;{debouncedQuery}&quot;
          </p>
        </div>
      )}

      {hasResults && searchResults && (
        <div className="space-y-6 md:space-y-8">
          {searchResults.activities.length > 0 && (
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-semibold text-white">Activities</h2>
                <Badge variant="secondary" className="text-xs">
                  {searchResults.activities.length}
                </Badge>
              </div>
              <div className="space-y-2 md:space-y-3">
                {searchResults.activities.map((activity: any) => (
                  <SearchResult
                    key={activity._id}
                    type="activity"
                    result={activity}
                    query={debouncedQuery}
                  />
                ))}
              </div>
            </div>
          )}

          {searchResults.documents.length > 0 && (
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-base md:text-lg font-semibold text-white">Documents</h2>
                <Badge variant="secondary" className="text-xs">
                  {searchResults.documents.length}
                </Badge>
              </div>
              <div className="space-y-2 md:space-y-3">
                {searchResults.documents.map((document: any) => (
                  <SearchResult
                    key={document._id}
                    type="document"
                    result={document}
                    query={debouncedQuery}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
