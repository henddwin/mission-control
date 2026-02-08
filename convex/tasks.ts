import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List tasks with optional status filter
export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("inbox"),
        v.literal("assigned"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("done"),
        v.literal("blocked")
      )
    ),
  },
  handler: async (ctx, args) => {
    let tasks;
    if (args.status) {
      tasks = await ctx.db
        .query("tasks")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      tasks = await ctx.db.query("tasks").order("desc").collect();
    }

    // For each task, resolve assignee info
    const tasksWithAssignees = await Promise.all(
      tasks.map(async (task) => {
        const assignees = await Promise.all(
          task.assigneeIds.map(async (sessionKey) => {
            const agent = await ctx.db
              .query("agents")
              .withIndex("by_sessionKey", (q) => q.eq("sessionKey", sessionKey))
              .first();
            return agent
              ? { name: agent.name, emoji: agent.emoji }
              : { name: sessionKey, emoji: "👤" };
          })
        );
        
        return {
          ...task,
          assignees,
        };
      })
    );

    return tasksWithAssignees;
  },
});

// Get task by id
export const get = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get task by id with assignee info (for detail view)
export const getById = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) return null;

    // Resolve assignee info
    const assignees = await Promise.all(
      task.assigneeIds.map(async (sessionKey) => {
        const agent = await ctx.db
          .query("agents")
          .withIndex("by_sessionKey", (q) => q.eq("sessionKey", sessionKey))
          .first();
        return agent
          ? { name: agent.name, emoji: agent.emoji }
          : { name: sessionKey, emoji: "👤" };
      })
    );

    return {
      ...task,
      assignees,
    };
  },
});

// Create a new task
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    createdBy: v.string(),
    tags: v.optional(v.array(v.string())),
    dueAt: v.optional(v.number()),
    parentTaskId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: "inbox",
      priority: args.priority,
      assigneeIds: [],
      createdBy: args.createdBy,
      createdAt: now,
      updatedAt: now,
      tags: args.tags ?? [],
      dueAt: args.dueAt,
      parentTaskId: args.parentTaskId,
    });
  },
});

// Update task status (used by TaskDetail)
export const updateStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error(`Task ${args.taskId} not found`);
    }

    await ctx.db.patch(args.taskId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return args.taskId;
  },
});

// Update task
export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal("inbox"),
        v.literal("assigned"),
        v.literal("in_progress"),
        v.literal("review"),
        v.literal("done"),
        v.literal("blocked")
      )
    ),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent")
      )
    ),
    assigneeIds: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    dueAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    const task = await ctx.db.get(id);
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Assign task to agent (adds assignee and auto-subscribes to thread)
export const assign = mutation({
  args: {
    taskId: v.id("tasks"),
    agentSessionKey: v.string(),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) {
      throw new Error(`Task ${args.taskId} not found`);
    }

    // Add assignee if not already assigned
    if (!task.assigneeIds.includes(args.agentSessionKey)) {
      const updatedAssignees = [...task.assigneeIds, args.agentSessionKey];
      await ctx.db.patch(args.taskId, {
        assigneeIds: updatedAssignees,
        status: task.status === "inbox" ? "assigned" : task.status,
        updatedAt: Date.now(),
      });
    }

    // Auto-subscribe to thread
    const existingSubscription = await ctx.db
      .query("threadSubscriptions")
      .withIndex("by_taskId_agentSessionKey", (q) =>
        q.eq("taskId", args.taskId).eq("agentSessionKey", args.agentSessionKey)
      )
      .first();

    if (!existingSubscription) {
      await ctx.db.insert("threadSubscriptions", {
        taskId: args.taskId,
        agentSessionKey: args.agentSessionKey,
        subscribedAt: Date.now(),
      });
    }

    return args.taskId;
  },
});

// List tasks by assignee
export const listByAssignee = query({
  args: { agentSessionKey: v.string() },
  handler: async (ctx, args) => {
    const allTasks = await ctx.db.query("tasks").collect();
    return allTasks.filter((task) =>
      task.assigneeIds.includes(args.agentSessionKey)
    );
  },
});
