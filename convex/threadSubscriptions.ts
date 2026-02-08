import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Subscribe to a task thread
export const subscribe = mutation({
  args: {
    taskId: v.string(),
    agentSessionKey: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already subscribed
    const existing = await ctx.db
      .query("threadSubscriptions")
      .withIndex("by_taskId_agentSessionKey", (q) =>
        q.eq("taskId", args.taskId).eq("agentSessionKey", args.agentSessionKey)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("threadSubscriptions", {
      taskId: args.taskId,
      agentSessionKey: args.agentSessionKey,
      subscribedAt: Date.now(),
    });
  },
});

// Unsubscribe from a task thread
export const unsubscribe = mutation({
  args: {
    taskId: v.string(),
    agentSessionKey: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("threadSubscriptions")
      .withIndex("by_taskId_agentSessionKey", (q) =>
        q.eq("taskId", args.taskId).eq("agentSessionKey", args.agentSessionKey)
      )
      .first();

    if (subscription) {
      await ctx.db.delete(subscription._id);
      return subscription._id;
    }

    return null;
  },
});

// Get all subscribers for a task
export const getSubscribers = query({
  args: { taskId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("threadSubscriptions")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .collect();
  },
});

// Get all subscriptions for an agent
export const listByAgent = query({
  args: { agentSessionKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("threadSubscriptions")
      .withIndex("by_agentSessionKey", (q) => q.eq("agentSessionKey", args.agentSessionKey))
      .collect();
  },
});
