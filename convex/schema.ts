import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  activities: defineTable({
    timestamp: v.number(),
    actionType: v.string(),
    title: v.string(),
    details: v.optional(v.string()),
    status: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_actionType", ["actionType"])
    .searchIndex("search_activities", {
      searchField: "title",
      filterFields: ["actionType"],
    })
    .searchIndex("search_activity_details", {
      searchField: "details",
      filterFields: ["actionType"],
    }),

  scheduledTasks: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    scheduleType: v.string(),
    schedule: v.string(),
    nextRun: v.optional(v.number()),
    taskType: v.string(),
    status: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_nextRun", ["nextRun"])
    .index("by_status", ["status"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(),
    source: v.string(),
    sourcePath: v.optional(v.string()),
    lastUpdated: v.number(),
  })
    .searchIndex("search_documents", {
      searchField: "content",
      filterFields: ["source"],
    })
    .searchIndex("search_document_titles", {
      searchField: "title",
      filterFields: ["source"],
    }),

  // Multi-agent system tables
  agents: defineTable({
    name: v.string(),
    role: v.string(),
    emoji: v.string(),
    status: v.union(v.literal("idle"), v.literal("active"), v.literal("blocked")),
    currentTaskId: v.optional(v.id("tasks")),
    sessionKey: v.string(),
    lastHeartbeat: v.number(),
    level: v.union(v.literal("intern"), v.literal("specialist"), v.literal("lead")),
  })
    .index("by_sessionKey", ["sessionKey"])
    .searchIndex("search_agents", {
      searchField: "name",
    }),

  tasks: defineTable({
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("inbox"),
      v.literal("assigned"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done"),
      v.literal("blocked")
    ),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ),
    assigneeIds: v.array(v.string()),
    createdBy: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    dueAt: v.optional(v.number()),
    tags: v.array(v.string()),
    parentTaskId: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"])
    .index("by_updatedAt", ["updatedAt"])
    .searchIndex("search_title", {
      searchField: "title",
    })
    .searchIndex("search_description", {
      searchField: "description",
    }),

  messages: defineTable({
    taskId: v.string(),
    fromAgent: v.string(),
    content: v.string(),
    timestamp: v.number(),
    mentions: v.array(v.string()),
    attachmentIds: v.optional(v.array(v.string())),
  })
    .index("by_taskId", ["taskId"])
    .index("by_timestamp", ["timestamp"])
    .searchIndex("search_content", {
      searchField: "content",
    }),

  notifications: defineTable({
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
    timestamp: v.number(),
    delivered: v.boolean(),
    readAt: v.optional(v.number()),
  })
    .index("by_targetAgent", ["targetAgent"])
    .index("by_delivered", ["delivered"])
    .index("by_targetAgent_delivered", ["targetAgent", "delivered"]),

  threadSubscriptions: defineTable({
    taskId: v.string(),
    agentSessionKey: v.string(),
    subscribedAt: v.number(),
  })
    .index("by_taskId", ["taskId"])
    .index("by_agentSessionKey", ["agentSessionKey"])
    .index("by_taskId_agentSessionKey", ["taskId", "agentSessionKey"]),

  // Debate system
  debates: defineTable({
    taskId: v.string(),
    topic: v.string(),
    status: v.union(v.literal("open"), v.literal("voting"), v.literal("resolved")),
    createdBy: v.string(),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
    resolution: v.optional(v.string()),
    resolvedBy: v.optional(v.string()),
  })
    .index("by_taskId", ["taskId"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  debateEntries: defineTable({
    debateId: v.id("debates"),
    agentSessionKey: v.string(),
    position: v.string(),
    confidence: v.number(),
    evidence: v.optional(v.string()),
    timestamp: v.number(),
    votes: v.number(),
  })
    .index("by_debateId", ["debateId"])
    .index("by_agentSessionKey", ["agentSessionKey"])
    .index("by_timestamp", ["timestamp"]),

  // Agent logs system
  agentLogs: defineTable({
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
    timestamp: v.number(),
    metadata: v.optional(v.any()),
  })
    .index("by_agentSessionKey", ["agentSessionKey"])
    .index("by_timestamp", ["timestamp"])
    .index("by_agentSessionKey_timestamp", ["agentSessionKey", "timestamp"]),

  // Self-improvement system
  improvements: defineTable({
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
    status: v.union(
      v.literal("proposed"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("implemented")
    ),
    createdAt: v.number(),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_agentSessionKey", ["agentSessionKey"])
    .index("by_status", ["status"])
    .index("by_createdAt", ["createdAt"]),

  // Model routing configuration
  modelConfig: defineTable({
    agentSessionKey: v.string(),
    defaultModel: v.string(),
    smartModel: v.string(),
    useSmartFor: v.array(v.string()),
    maxTokenBudgetDaily: v.optional(v.number()),
    tokensUsedToday: v.number(),
    lastReset: v.number(),
  })
    .index("by_agentSessionKey", ["agentSessionKey"])
    .index("by_lastReset", ["lastReset"]),
});
