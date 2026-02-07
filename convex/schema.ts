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
});
