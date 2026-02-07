import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query("scheduledTasks")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    }
    return await ctx.db.query("scheduledTasks").collect();
  },
});

export const getWeekTasks = query({
  args: {
    weekStart: v.number(),
    weekEnd: v.number(),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("scheduledTasks")
      .withIndex("by_nextRun")
      .filter((q) =>
        q.and(
          q.gte(q.field("nextRun"), args.weekStart),
          q.lte(q.field("nextRun"), args.weekEnd)
        )
      )
      .collect();
    return tasks;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    scheduleType: v.string(),
    schedule: v.string(),
    nextRun: v.optional(v.number()),
    taskType: v.string(),
    status: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("scheduledTasks", {
      name: args.name,
      description: args.description,
      scheduleType: args.scheduleType,
      schedule: args.schedule,
      nextRun: args.nextRun,
      taskType: args.taskType,
      status: args.status,
      metadata: args.metadata,
    });
    return taskId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("scheduledTasks"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const deleteTask = mutation({
  args: { id: v.id("scheduledTasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
