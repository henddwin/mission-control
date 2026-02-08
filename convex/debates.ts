import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create a new debate
export const create = mutation({
  args: {
    taskId: v.string(),
    topic: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("debates", {
      taskId: args.taskId,
      topic: args.topic,
      status: "open",
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });
  },
});

// Add an entry to a debate
export const addEntry = mutation({
  args: {
    debateId: v.id("debates"),
    agentSessionKey: v.string(),
    position: v.string(),
    confidence: v.number(),
    evidence: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const debate = await ctx.db.get(args.debateId);
    if (!debate) {
      throw new Error(`Debate ${args.debateId} not found`);
    }

    if (debate.status === "resolved") {
      throw new Error("Cannot add entry to a resolved debate");
    }

    // Check if this agent already has an entry
    const existingEntry = await ctx.db
      .query("debateEntries")
      .withIndex("by_debateId", (q) => q.eq("debateId", args.debateId))
      .filter((q) => q.eq(q.field("agentSessionKey"), args.agentSessionKey))
      .first();

    if (existingEntry) {
      // Update existing entry
      await ctx.db.patch(existingEntry._id, {
        position: args.position,
        confidence: args.confidence,
        evidence: args.evidence,
        timestamp: Date.now(),
      });
      return existingEntry._id;
    } else {
      // Create new entry
      return await ctx.db.insert("debateEntries", {
        debateId: args.debateId,
        agentSessionKey: args.agentSessionKey,
        position: args.position,
        confidence: args.confidence,
        evidence: args.evidence,
        timestamp: Date.now(),
        votes: 0,
      });
    }
  },
});

// Vote on a debate entry
export const vote = mutation({
  args: {
    entryId: v.id("debateEntries"),
  },
  handler: async (ctx, args) => {
    const entry = await ctx.db.get(args.entryId);
    if (!entry) {
      throw new Error(`Debate entry ${args.entryId} not found`);
    }

    await ctx.db.patch(args.entryId, {
      votes: entry.votes + 1,
    });

    return args.entryId;
  },
});

// Resolve a debate
export const resolve = mutation({
  args: {
    debateId: v.id("debates"),
    resolution: v.string(),
    resolvedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const debate = await ctx.db.get(args.debateId);
    if (!debate) {
      throw new Error(`Debate ${args.debateId} not found`);
    }

    await ctx.db.patch(args.debateId, {
      status: "resolved",
      resolution: args.resolution,
      resolvedBy: args.resolvedBy,
      resolvedAt: Date.now(),
    });

    return args.debateId;
  },
});

// List debates with optional status filter
export const list = query({
  args: {
    status: v.optional(
      v.union(v.literal("open"), v.literal("voting"), v.literal("resolved"))
    ),
    taskId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let debates;

    if (args.taskId) {
      debates = await ctx.db
        .query("debates")
        .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId!))
        .order("desc")
        .collect();
    } else if (args.status) {
      debates = await ctx.db
        .query("debates")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      debates = await ctx.db
        .query("debates")
        .order("desc")
        .collect();
    }

    return debates;
  },
});

// Get debate with all entries
export const getWithEntries = query({
  args: { debateId: v.id("debates") },
  handler: async (ctx, args) => {
    const debate = await ctx.db.get(args.debateId);
    if (!debate) return null;

    const entries = await ctx.db
      .query("debateEntries")
      .withIndex("by_debateId", (q) => q.eq("debateId", args.debateId))
      .order("desc")
      .collect();

    // Resolve agent info for each entry
    const entriesWithAgents = await Promise.all(
      entries.map(async (entry) => {
        const agent = await ctx.db
          .query("agents")
          .withIndex("by_sessionKey", (q) =>
            q.eq("sessionKey", entry.agentSessionKey)
          )
          .first();

        return {
          ...entry,
          agentName: agent?.name ?? entry.agentSessionKey,
          agentEmoji: agent?.emoji ?? "👤",
        };
      })
    );

    return {
      ...debate,
      entries: entriesWithAgents,
    };
  },
});
