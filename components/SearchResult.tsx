"use client";

import { format } from "date-fns";
import { FileText, Activity, File } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchResultProps {
  type: "activity" | "document";
  result: any;
  query: string;
}

export function SearchResult({ type, result, query }: SearchResultProps) {
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-500/30 text-yellow-300 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (type === "activity") {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50 transition-all hover:bg-zinc-900">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-blue-950 p-1.5 md:p-2 text-blue-400 flex-shrink-0">
              <Activity className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base font-medium text-white truncate">
                {highlightText(result.title, query)}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                <span className="whitespace-nowrap">
                  {format(new Date(result.timestamp), "MMM d, h:mm a")}
                </span>
                <Badge variant="outline" className="text-[10px] md:text-xs">
                  {result.actionType.replace(/_/g, " ")}
                </Badge>
              </div>
              {result.details && (
                <p className="mt-2 text-xs md:text-sm text-zinc-400 line-clamp-2">
                  {highlightText(result.details, query)}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "document") {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50 transition-all hover:bg-zinc-900">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-purple-950 p-1.5 md:p-2 text-purple-400 flex-shrink-0">
              {result.source === "memory" ? (
                <FileText className="h-4 w-4 md:h-5 md:w-5" />
              ) : (
                <File className="h-4 w-4 md:h-5 md:w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base font-medium text-white truncate">
                {highlightText(result.title, query)}
              </h3>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
                <Badge variant="outline" className="text-[10px] md:text-xs">
                  {result.source}
                </Badge>
                {result.sourcePath && (
                  <span className="font-mono truncate max-w-[200px]">{result.sourcePath}</span>
                )}
              </div>
              <p className="mt-2 text-xs md:text-sm text-zinc-400 line-clamp-2 md:line-clamp-3">
                {highlightText(result.content, query)}
              </p>
              <div className="mt-1.5 text-[10px] md:text-xs text-zinc-600">
                Updated {format(new Date(result.lastUpdated), "MMM d, yyyy")}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
