import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// List messages for a task (ordered by timestamp)
export const listByTask = query({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId))
      .order("asc")
      .collect();

    // For each message, resolve author info
    const messagesWithAuthors = await Promise.all(
      messages.map(async (message) => {
        const agent = await ctx.db
          .query("agents")
          .withIndex("by_sessionKey", (q) => q.eq("sessionKey", message.fromAgent))
          .first();
        
        return {
          ...message,
          authorName: agent?.name ?? message.fromAgent,
          authorEmoji: agent?.emoji ?? "👤",
        };
      })
    );

    return messagesWithAuthors;
  },
});

// Create a new message (and create notifications)
export const create = mutation({
  args: {
    taskId: v.id("tasks"),
    content: v.string(),
    authorName: v.optional(v.string()),
    authorEmoji: v.optional(v.string()),
    mentions: v.optional(v.array(v.string())),
    attachmentIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const fromAgent = args.authorName ?? "You";
    
    // Insert the message
    const messageId = await ctx.db.insert("messages", {
      taskId: args.taskId as any,
      fromAgent,
      content: args.content,
      timestamp: now,
      mentions: args.mentions ?? [],
      attachmentIds: args.attachmentIds,
    });

    // Get thread subscribers
    const subscribers = await ctx.db
      .query("threadSubscriptions")
      .withIndex("by_taskId", (q) => q.eq("taskId", args.taskId as any))
      .collect();

    // Create notifications for mentioned agents
    const mentionedAgents = args.mentions ?? [];
    for (const mentionedAgent of mentionedAgents) {
      if (mentionedAgent !== fromAgent) {
        await ctx.db.insert("notifications", {
          targetAgent: mentionedAgent,
          sourceAgent: fromAgent,
          type: "mention",
          content: `${fromAgent} mentioned you in a comment`,
          taskId: args.taskId as any,
          timestamp: now,
          delivered: false,
        });
      }
    }

    // Create notifications for thread subscribers (excluding author and already mentioned)
    for (const subscription of subscribers) {
      if (
        subscription.agentSessionKey !== fromAgent &&
        !mentionedAgents.includes(subscription.agentSessionKey)
      ) {
        await ctx.db.insert("notifications", {
          targetAgent: subscription.agentSessionKey,
          sourceAgent: fromAgent,
          type: "comment",
          content: `${fromAgent} commented on a task you're subscribed to`,
          taskId: args.taskId as any,
          timestamp: now,
          delivered: false,
        });
      }
    }

    return messageId;
  },
});
