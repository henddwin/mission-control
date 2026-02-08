import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Propose a new improvement
export const propose = mutation({
  args: {
    agentSessionKey: v.string(),
    type: v.union(
      v.literal("soul_update"),
      v.literal("tool_suggestion"),
      v.literal("workflow_change"),
      v.literal("bug_report"),
      v.literal("efficiency")
    ),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("improvements", {
      agentSessionKey: args.agentSessionKey,
      type: args.type,
      title: args.title,
      description: args.description,
      status: "proposed",
      createdAt: Date.now(),
    });
  },
});

// List improvements with optional status filter
export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("proposed"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("implemented")
      )
    ),
    type: v.optional(
      v.union(
        v.literal("soul_update"),
        v.literal("tool_suggestion"),
        v.literal("workflow_change"),
        v.literal("bug_report"),
        v.literal("efficiency")
      )
    ),
  },
  handler: async (ctx, args) => {
    let improvements;

    if (args.status) {
      improvements = await ctx.db
        .query("improvements")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      improvements = await ctx.db
        .query("improvements")
        .order("desc")
        .collect();
    }

    // Filter by type if specified
    if (args.type) {
      improvements = improvements.filter(
        (improvement) => improvement.type === args.type
      );
    }

    // Resolve agent info for each improvement
    const improvementsWithAgents = await Promise.all(
      improvements.map(async (improvement) => {
        const agent = await ctx.db
          .query("agents")
          .withIndex("by_sessionKey", (q) =>
            q.eq("sessionKey", improvement.agentSessionKey)
          )
          .first();

        return {
          ...improvement,
          agentName: agent?.name ?? improvement.agentSessionKey,
          agentEmoji: agent?.emoji ?? "👤",
        };
      })
    );

    return improvementsWithAgents;
  },
});

// Review an improvement (approve/reject/implement)
export const review = mutation({
  args: {
    improvementId: v.id("improvements"),
    status: v.union(
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("implemented")
    ),
    reviewedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const improvement = await ctx.db.get(args.improvementId);
    if (!improvement) {
      throw new Error(`Improvement ${args.improvementId} not found`);
    }

    await ctx.db.patch(args.improvementId, {
      status: args.status,
      reviewedBy: args.reviewedBy,
      reviewedAt: Date.now(),
    });

    return args.improvementId;
  },
});

// List improvements by a specific agent
export const listByAgent = query({
  args: {
    agentSessionKey: v.string(),
    status: v.optional(
      v.union(
        v.literal("proposed"),
        v.literal("approved"),
        v.literal("rejected"),
        v.literal("implemented")
      )
    ),
  },
  handler: async (ctx, args) => {
    let improvements = await ctx.db
      .query("improvements")
      .withIndex("by_agentSessionKey", (q) =>
        q.eq("agentSessionKey", args.agentSessionKey)
      )
      .order("desc")
      .collect();

    // Filter by status if specified
    if (args.status) {
      improvements = improvements.filter(
        (improvement) => improvement.status === args.status
      );
    }

    return improvements;
  },
});

// Get a single improvement by ID
export const get = query({
  args: { improvementId: v.id("improvements") },
  handler: async (ctx, args) => {
    const improvement = await ctx.db.get(args.improvementId);
    if (!improvement) return null;

    const agent = await ctx.db
      .query("agents")
      .withIndex("by_sessionKey", (q) =>
        q.eq("sessionKey", improvement.agentSessionKey)
      )
      .first();

    return {
      ...improvement,
      agentName: agent?.name ?? improvement.agentSessionKey,
      agentEmoji: agent?.emoji ?? "👤",
    };
  },
});
