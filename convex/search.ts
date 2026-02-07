import { v } from "convex/values";
import { query } from "./_generated/server";

export const searchAll = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.query || args.query.trim().length === 0) {
      return { activities: [], documents: [] };
    }

    // Search activities by title
    const byTitle = await ctx.db
      .query("activities")
      .withSearchIndex("search_activities", (q) => q.search("title", args.query))
      .take(20);

    // Search activities by details
    const byDetails = await ctx.db
      .query("activities")
      .withSearchIndex("search_activity_details", (q) => q.search("details", args.query))
      .take(20);

    // Merge & dedupe activities
    const seenIds = new Set(byTitle.map((a) => a._id));
    const mergedActivities = [...byTitle];
    for (const a of byDetails) {
      if (!seenIds.has(a._id)) {
        mergedActivities.push(a);
        seenIds.add(a._id);
      }
    }

    // Search documents by content
    const docsByContent = await ctx.db
      .query("documents")
      .withSearchIndex("search_documents", (q) => q.search("content", args.query))
      .take(20);

    // Search documents by title
    const docsByTitle = await ctx.db
      .query("documents")
      .withSearchIndex("search_document_titles", (q) => q.search("title", args.query))
      .take(20);

    // Merge & dedupe documents
    const seenDocIds = new Set(docsByContent.map((d) => d._id));
    const mergedDocuments = [...docsByContent];
    for (const d of docsByTitle) {
      if (!seenDocIds.has(d._id)) {
        mergedDocuments.push(d);
        seenDocIds.add(d._id);
      }
    }

    return {
      activities: mergedActivities,
      documents: mergedDocuments,
    };
  },
});

export const searchActivities = query({
  args: {
    query: v.string(),
    actionType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.query || args.query.trim().length === 0) return [];

    const byTitle = await ctx.db
      .query("activities")
      .withSearchIndex("search_activities", (q) => q.search("title", args.query))
      .take(50);

    const byDetails = await ctx.db
      .query("activities")
      .withSearchIndex("search_activity_details", (q) => q.search("details", args.query))
      .take(50);

    const seenIds = new Set(byTitle.map((a) => a._id));
    const merged = [...byTitle];
    for (const a of byDetails) {
      if (!seenIds.has(a._id)) { merged.push(a); seenIds.add(a._id); }
    }

    if (args.actionType) {
      return merged.filter((a) => a.actionType === args.actionType);
    }
    return merged;
  },
});

export const searchDocuments = query({
  args: {
    query: v.string(),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.query || args.query.trim().length === 0) return [];

    const byContent = await ctx.db
      .query("documents")
      .withSearchIndex("search_documents", (q) => q.search("content", args.query))
      .take(50);

    const byTitle = await ctx.db
      .query("documents")
      .withSearchIndex("search_document_titles", (q) => q.search("title", args.query))
      .take(50);

    const seenIds = new Set(byContent.map((d) => d._id));
    const merged = [...byContent];
    for (const d of byTitle) {
      if (!seenIds.has(d._id)) { merged.push(d); seenIds.add(d._id); }
    }

    if (args.source) {
      return merged.filter((d) => d.source === args.source);
    }
    return merged;
  },
});
