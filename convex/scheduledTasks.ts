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
    // Get ALL tasks
    const allTasks = await ctx.db.query("scheduledTasks").collect();

    // Return recurring/cron active tasks (they show every day)
    // plus one-shot tasks that fall within this week
    return allTasks.filter((task) => {
      // Active recurring/cron tasks always show
      if (
        task.status === "active" &&
        (task.scheduleType === "cron" || task.scheduleType === "recurring")
      ) {
        return true;
      }

      // One-shot tasks: show if nextRun is within this week
      if (task.nextRun) {
        return task.nextRun >= args.weekStart && task.nextRun <= args.weekEnd;
      }

      return false;
    });
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
