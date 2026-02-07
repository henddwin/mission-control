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
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-blue-950 p-2 text-blue-400">
              <Activity className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-medium text-white">
                    {highlightText(result.title, query)}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <span>
                      {format(new Date(result.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      {result.actionType.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  {result.details && (
                    <p className="mt-2 text-sm text-zinc-400 line-clamp-2">
                      {highlightText(result.details, query)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === "document") {
    return (
      <Card className="border-zinc-800 bg-zinc-900/50 transition-all hover:bg-zinc-900">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-purple-950 p-2 text-purple-400">
              {result.source === "memory" ? (
                <FileText className="h-5 w-5" />
              ) : (
                <File className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-medium text-white">
                    {highlightText(result.title, query)}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                    <Badge variant="outline" className="text-xs">
                      {result.source}
                    </Badge>
                    {result.sourcePath && (
                      <>
                        <span>•</span>
                        <span className="font-mono">{result.sourcePath}</span>
                      </>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-zinc-400 line-clamp-3">
                    {highlightText(result.content, query)}
                  </p>
                  <div className="mt-2 text-xs text-zinc-600">
                    Updated {format(new Date(result.lastUpdated), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
