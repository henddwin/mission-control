import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create a log entry
export const create = mutation({
  args: {
    agentSessionKey: v.string(),
    type: v.union(
      v.literal("action"),
      v.literal("thinking"),
      v.literal("error"),
      v.literal("heartbeat"),
      v.literal("self_improve")
    ),
    content: v.string(),
    taskId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agentLogs", {
      agentSessionKey: args.agentSessionKey,
      type: args.type,
      content: args.content,
      taskId: args.taskId,
      timestamp: Date.now(),
      metadata: args.metadata,
    });
  },
});

// List logs for a specific agent
export const listByAgent = query({
  args: {
    agentSessionKey: v.string(),
    limit: v.optional(v.number()),
    type: v.optional(
      v.union(
        v.literal("action"),
        v.literal("thinking"),
        v.literal("error"),
        v.literal("heartbeat"),
        v.literal("self_improve")
      )
    ),
  },
  handler: async (ctx, args) => {
    let logs = await ctx.db
      .query("agentLogs")
      .withIndex("by_agentSessionKey_timestamp", (q) =>
        q.eq("agentSessionKey", args.agentSessionKey)
      )
      .order("desc")
      .collect();

    // Filter by type if specified
    if (args.type) {
      logs = logs.filter((log) => log.type === args.type);
    }

    // Apply limit if specified
    if (args.limit) {
      logs = logs.slice(0, args.limit);
    }

    return logs;
  },
});

// List recent logs across all agents
export const listRecent = query({
  args: {
    limit: v.optional(v.number()),
    type: v.optional(
      v.union(
        v.literal("action"),
        v.literal("thinking"),
        v.literal("error"),
        v.literal("heartbeat"),
        v.literal("self_improve")
      )
    ),
  },
  handler: async (ctx, args) => {
    let logs = await ctx.db
      .query("agentLogs")
      .withIndex("by_timestamp")
      .order("desc")
      .collect();

    // Filter by type if specified
    if (args.type) {
      logs = logs.filter((log) => log.type === args.type);
    }

    // Apply limit if specified
    if (args.limit) {
      logs = logs.slice(0, args.limit);
    }

    // Resolve agent info for each log
    const logsWithAgents = await Promise.all(
      logs.map(async (log) => {
        const agent = await ctx.db
          .query("agents")
          .withIndex("by_sessionKey", (q) =>
            q.eq("sessionKey", log.agentSessionKey)
          )
          .first();

        return {
          ...log,
          agentName: agent?.name ?? log.agentSessionKey,
          agentEmoji: agent?.emoji ?? "👤",
        };
      })
    );

    return logsWithAgents;
  },
});

// Get log count for an agent
export const countByAgent = query({
  args: {
    agentSessionKey: v.string(),
    type: v.optional(
      v.union(
        v.literal("action"),
        v.literal("thinking"),
        v.literal("error"),
        v.literal("heartbeat"),
        v.literal("self_improve")
      )
    ),
  },
  handler: async (ctx, args) => {
    let logs = await ctx.db
      .query("agentLogs")
      .withIndex("by_agentSessionKey", (q) =>
        q.eq("agentSessionKey", args.agentSessionKey)
      )
      .collect();

    // Filter by type if specified
    if (args.type) {
      logs = logs.filter((log) => log.type === args.type);
    }

    return logs.length;
  },
});
