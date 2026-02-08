import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List all agents
export const list = query({
  args: {},
  handler: async (ctx) => {
    const agents = await ctx.db.query("agents").collect();
    
    // For each agent, fetch their current task if they have one
    const agentsWithTasks = await Promise.all(
      agents.map(async (agent) => {
        let currentTask = undefined;
        if (agent.currentTaskId) {
          const task = await ctx.db.get(agent.currentTaskId);
          currentTask = task?.title;
        }
        
        return {
          ...agent,
          currentTask,
        };
      })
    );
    
    return agentsWithTasks;
  },
});

// Get agent by sessionKey
export const get = query({
  args: { sessionKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_sessionKey", (q) => q.eq("sessionKey", args.sessionKey))
      .first();
  },
});

// Update agent status and heartbeat
export const updateStatus = mutation({
  args: {
    sessionKey: v.string(),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("blocked")),
    lastHeartbeat: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_sessionKey", (q) => q.eq("sessionKey", args.sessionKey))
      .first();

    if (!agent) {
      throw new Error(`Agent with sessionKey ${args.sessionKey} not found`);
    }

    await ctx.db.patch(agent._id, {
      status: args.status,
      lastHeartbeat: args.lastHeartbeat ?? Date.now(),
    });

    return agent._id;
  },
});

// Update agent's current task
export const updateCurrentTask = mutation({
  args: {
    sessionKey: v.string(),
    currentTaskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_sessionKey", (q) => q.eq("sessionKey", args.sessionKey))
      .first();

    if (!agent) {
      throw new Error(`Agent with sessionKey ${args.sessionKey} not found`);
    }

    await ctx.db.patch(agent._id, {
      currentTaskId: args.currentTaskId,
      lastHeartbeat: Date.now(),
    });

    return agent._id;
  },
});

// Create a new agent
export const create = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    emoji: v.string(),
    sessionKey: v.string(),
    level: v.union(v.literal("intern"), v.literal("specialist"), v.literal("lead")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("agents", {
      name: args.name,
      role: args.role,
      emoji: args.emoji,
      status: "idle",
      sessionKey: args.sessionKey,
      lastHeartbeat: Date.now(),
      level: args.level,
    });
  },
});

// Get agent with statistics
export const getWithStats = query({
  args: { sessionKey: v.string() },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_sessionKey", (q) => q.eq("sessionKey", args.sessionKey))
      .first();

    if (!agent) return null;

    // Count assigned tasks
    const allTasks = await ctx.db.query("tasks").collect();
    const taskCount = allTasks.filter((task) =>
      task.assigneeIds.includes(args.sessionKey)
    ).length;

    // Count logs
    const logs = await ctx.db
      .query("agentLogs")
      .withIndex("by_agentSessionKey", (q) =>
        q.eq("agentSessionKey", args.sessionKey)
      )
      .collect();
    const logCount = logs.length;

    // Get last activity (most recent log timestamp)
    const lastActivity = logs.length > 0
      ? Math.max(...logs.map((log) => log.timestamp))
      : agent.lastHeartbeat;

    return {
      ...agent,
      taskCount,
      logCount,
      lastActivity,
    };
  },
});
