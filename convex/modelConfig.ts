import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get model configuration for an agent
export const get = query({
  args: { agentSessionKey: v.string() },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("modelConfig")
      .withIndex("by_agentSessionKey", (q) =>
        q.eq("agentSessionKey", args.agentSessionKey)
      )
      .first();

    // Return default config if none exists
    if (!config) {
      return {
        agentSessionKey: args.agentSessionKey,
        defaultModel: "sonnet",
        smartModel: "opus",
        useSmartFor: ["debate", "creative", "strategy"],
        tokensUsedToday: 0,
        lastReset: Date.now(),
      };
    }

    return config;
  },
});

// Update model configuration
export const update = mutation({
  args: {
    agentSessionKey: v.string(),
    defaultModel: v.optional(v.string()),
    smartModel: v.optional(v.string()),
    useSmartFor: v.optional(v.array(v.string())),
    maxTokenBudgetDaily: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const existingConfig = await ctx.db
      .query("modelConfig")
      .withIndex("by_agentSessionKey", (q) =>
        q.eq("agentSessionKey", args.agentSessionKey)
      )
      .first();

    if (existingConfig) {
      // Update existing config
      const updates: any = {};
      if (args.defaultModel !== undefined)
        updates.defaultModel = args.defaultModel;
      if (args.smartModel !== undefined) updates.smartModel = args.smartModel;
      if (args.useSmartFor !== undefined) updates.useSmartFor = args.useSmartFor;
      if (args.maxTokenBudgetDaily !== undefined)
        updates.maxTokenBudgetDaily = args.maxTokenBudgetDaily;

      await ctx.db.patch(existingConfig._id, updates);
      return existingConfig._id;
    } else {
      // Create new config
      return await ctx.db.insert("modelConfig", {
        agentSessionKey: args.agentSessionKey,
        defaultModel: args.defaultModel ?? "sonnet",
        smartModel: args.smartModel ?? "opus",
        useSmartFor: args.useSmartFor ?? ["debate", "creative", "strategy"],
        maxTokenBudgetDaily: args.maxTokenBudgetDaily,
        tokensUsedToday: 0,
        lastReset: Date.now(),
      });
    }
  },
});

// Track token usage
export const trackUsage = mutation({
  args: {
    agentSessionKey: v.string(),
    tokensUsed: v.number(),
  },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("modelConfig")
      .withIndex("by_agentSessionKey", (q) =>
        q.eq("agentSessionKey", args.agentSessionKey)
      )
      .first();

    if (config) {
      // Check if we need to reset (new day)
      const now = Date.now();
      const dayInMs = 24 * 60 * 60 * 1000;
      const shouldReset = now - config.lastReset > dayInMs;

      if (shouldReset) {
        await ctx.db.patch(config._id, {
          tokensUsedToday: args.tokensUsed,
          lastReset: now,
        });
      } else {
        await ctx.db.patch(config._id, {
          tokensUsedToday: config.tokensUsedToday + args.tokensUsed,
        });
      }

      return config._id;
    } else {
      // Create new config with initial usage
      return await ctx.db.insert("modelConfig", {
        agentSessionKey: args.agentSessionKey,
        defaultModel: "sonnet",
        smartModel: "opus",
        useSmartFor: ["debate", "creative", "strategy"],
        tokensUsedToday: args.tokensUsed,
        lastReset: Date.now(),
      });
    }
  },
});

// Reset daily token counters for all agents
export const resetDaily = mutation({
  args: {},
  handler: async (ctx) => {
    const allConfigs = await ctx.db.query("modelConfig").collect();
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;

    let resetCount = 0;

    for (const config of allConfigs) {
      const shouldReset = now - config.lastReset > dayInMs;
      if (shouldReset) {
        await ctx.db.patch(config._id, {
          tokensUsedToday: 0,
          lastReset: now,
        });
        resetCount++;
      }
    }

    return resetCount;
  },
});

// List all model configurations
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const configs = await ctx.db.query("modelConfig").collect();

    // Resolve agent info for each config
    const configsWithAgents = await Promise.all(
      configs.map(async (config) => {
        const agent = await ctx.db
          .query("agents")
          .withIndex("by_sessionKey", (q) =>
            q.eq("sessionKey", config.agentSessionKey)
          )
          .first();

        return {
          ...config,
          agentName: agent?.name ?? config.agentSessionKey,
          agentEmoji: agent?.emoji ?? "👤",
        };
      })
    );

    return configsWithAgents;
  },
});
