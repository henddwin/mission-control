import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List undelivered notifications for a target agent
export const listUndelivered = query({
  args: { targetAgent: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_targetAgent_delivered", (q) =>
        q.eq("targetAgent", args.targetAgent).eq("delivered", false)
      )
      .order("desc")
      .collect();
  },
});

// List all notifications for a target agent
export const listAll = query({
  args: { 
    targetAgent: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_targetAgent", (q) => q.eq("targetAgent", args.targetAgent))
      .order("desc")
      .collect();
    
    if (args.limit) {
      return notifications.slice(0, args.limit);
    }
    
    return notifications;
  },
});

// Mark notification as delivered
export const markDelivered = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.id);
    if (!notification) {
      throw new Error(`Notification ${args.id} not found`);
    }

    await ctx.db.patch(args.id, {
      delivered: true,
    });

    return args.id;
  },
});

// Mark notification as read
export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.id);
    if (!notification) {
      throw new Error(`Notification ${args.id} not found`);
    }

    await ctx.db.patch(args.id, {
      readAt: Date.now(),
      delivered: true,
    });

    return args.id;
  },
});

// Create a notification
export const create = mutation({
  args: {
    targetAgent: v.string(),
    sourceAgent: v.string(),
    type: v.union(
      v.literal("mention"),
      v.literal("assignment"),
      v.literal("status_change"),
      v.literal("comment")
    ),
    content: v.string(),
    taskId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      targetAgent: args.targetAgent,
      sourceAgent: args.sourceAgent,
      type: args.type,
      content: args.content,
      taskId: args.taskId,
      timestamp: Date.now(),
      delivered: false,
    });
  },
});

// Mark all notifications as delivered for a target agent
export const markAllDelivered = mutation({
  args: { targetAgent: v.string() },
  handler: async (ctx, args) => {
    const undelivered = await ctx.db
      .query("notifications")
      .withIndex("by_targetAgent_delivered", (q) =>
        q.eq("targetAgent", args.targetAgent).eq("delivered", false)
      )
      .collect();

    for (const notification of undelivered) {
      await ctx.db.patch(notification._id, { delivered: true });
    }

    return undelivered.length;
  },
});
