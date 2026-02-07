import { v } from "convex/values";
import { query } from "./_generated/server";

export const searchAll = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.query || args.query.trim().length === 0) {
      return {
        activities: [],
        documents: [],
      };
    }

    // Search activities
    const activityResults = await ctx.db
      .query("activities")
      .withSearchIndex("search_activities", (q) => q.search("title", args.query))
      .take(20);

    // Search documents
    const documentResults = await ctx.db
      .query("documents")
      .withSearchIndex("search_documents", (q) => q.search("content", args.query))
      .take(20);

    return {
      activities: activityResults,
      documents: documentResults,
    };
  },
});

export const searchActivities = query({
  args: {
    query: v.string(),
    actionType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.query || args.query.trim().length === 0) {
      return [];
    }

    let searchQuery = ctx.db
      .query("activities")
      .withSearchIndex("search_activities", (q) => q.search("title", args.query));

    if (args.actionType) {
      searchQuery = searchQuery.filter((q) =>
        q.eq(q.field("actionType"), args.actionType)
      );
    }

    return await searchQuery.take(50);
  },
});

export const searchDocuments = query({
  args: {
    query: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.query || args.query.trim().length === 0) {
      return [];
    }

    let searchQuery = ctx.db
      .query("documents")
      .withSearchIndex("search_documents", (q) => q.search("content", args.query));

    if (args.source) {
      searchQuery = searchQuery.filter((q) =>
        q.eq(q.field("source"), args.source)
      );
    }

    return await searchQuery.take(50);
  },
});
