import { query } from "./_generated/server";
import { v } from "convex/values";

// Generate a standup report for today's activity
export const generateStandup = query({
  args: {
    date: v.optional(v.number()), // Optional timestamp, defaults to today
  },
  handler: async (ctx, args) => {
    // Calculate start of day (midnight) for the given date or today
    const targetDate = args.date ?? Date.now();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const startTimestamp = startOfDay.getTime();

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);
    const endTimestamp = endOfDay.getTime();

    // Get all agents
    const agents = await ctx.db.query("agents").collect();

    // Get all tasks
    const allTasks = await ctx.db.query("tasks").collect();

    // Filter tasks updated today
    const tasksUpdatedToday = allTasks.filter(
      (task) => task.updatedAt >= startTimestamp && task.updatedAt <= endTimestamp
    );

    // Get messages from today
    const messagesToday = await ctx.db
      .query("messages")
      .withIndex("by_timestamp")
      .collect();

    const filteredMessages = messagesToday.filter(
      (msg) => msg.timestamp >= startTimestamp && msg.timestamp <= endTimestamp
    );

    // Build per-agent summary (format for StandupView component)
    const agentStandup = agents.map((agent) => {
      // Tasks assigned to this agent
      const assignedTasks = allTasks.filter((task) =>
        task.assigneeIds.includes(agent.sessionKey)
      );

      // Completed tasks today
      const completedToday = assignedTasks.filter(
        (task) =>
          task.status === "done" &&
          task.updatedAt >= startTimestamp &&
          task.updatedAt <= endTimestamp
      );

      // In-progress tasks
      const inProgress = assignedTasks.filter(
        (task) => task.status === "in_progress"
      );

      // Blocked tasks
      const blocked = assignedTasks.filter((task) => task.status === "blocked");

      // Key messages/decisions from this agent today
      const messagesSent = filteredMessages.filter(
        (msg) => msg.fromAgent === agent.sessionKey
      );

      // Extract key decisions from messages (messages with certain keywords or high importance)
      const keyDecisions = messagesSent
        .filter(
          (msg) =>
            msg.content.toLowerCase().includes("decision") ||
            msg.content.toLowerCase().includes("decided") ||
            msg.content.toLowerCase().includes("important") ||
            msg.content.length > 100
        )
        .slice(0, 3)
        .map((msg) => msg.content);

      return {
        agentName: agent.name,
        agentEmoji: agent.emoji,
        completed: completedToday.map((t) => t.title),
        inProgress: inProgress.map((t) => t.title),
        blocked: blocked.map((t) => t.title),
        decisions: keyDecisions,
      };
    });

    // Filter out agents with no activity
    return agentStandup.filter(
      (summary) =>
        summary.completed.length > 0 ||
        summary.inProgress.length > 0 ||
        summary.blocked.length > 0 ||
        summary.decisions.length > 0
    );
  },
});
