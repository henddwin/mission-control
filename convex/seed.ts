import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const clearAll = mutation({
  handler: async (ctx) => {
    const activities = await ctx.db.query("activities").collect();
    for (const a of activities) await ctx.db.delete(a._id);
    const tasks = await ctx.db.query("scheduledTasks").collect();
    for (const t of tasks) await ctx.db.delete(t._id);
    const docs = await ctx.db.query("documents").collect();
    for (const d of docs) await ctx.db.delete(d._id);
    return { cleared: true };
  },
});

export const insertActivity = mutation({
  args: {
    timestamp: v.number(),
    actionType: v.string(),
    title: v.string(),
    details: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", args);
  },
});

export const insertTask = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    scheduleType: v.string(),
    schedule: v.string(),
    nextRun: v.optional(v.number()),
    taskType: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("scheduledTasks", args);
  },
});

export const insertDocument = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    source: v.string(),
    sourcePath: v.optional(v.string()),
    lastUpdated: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", args);
  },
});
