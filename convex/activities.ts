import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    actionType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let activities;

    if (args.actionType) {
      activities = await ctx.db
        .query("activities")
        .withIndex("by_actionType", (q) => q.eq("actionType", args.actionType!))
        .order("desc")
        .take(args.limit || 100);
    } else {
      activities = await ctx.db
        .query("activities")
        .withIndex("by_timestamp")
        .order("desc")
        .take(args.limit || 100);
    }

    return activities;
  },
});

export const getById = query({
  args: { id: v.id("activities") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    timestamp: v.number(),
    actionType: v.string(),
    title: v.string(),
    details: v.optional(v.string()),
    status: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const activityId = await ctx.db.insert("activities", {
      timestamp: args.timestamp,
      actionType: args.actionType,
      title: args.title,
      details: args.details,
      status: args.status,
      metadata: args.metadata,
    });
    return activityId;
  },
});

export const deleteActivity = mutation({
  args: { id: v.id("activities") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const getActionTypes = query({
  handler: async (ctx) => {
    const activities = await ctx.db.query("activities").collect();
    const types = new Set(activities.map((a) => a.actionType));
    return Array.from(types).sort();
  },
});
