# Multi-Agent Coordination Features

This document describes the advanced multi-agent coordination features added to the Mission Control Convex backend.

## Features Implemented

### 1. Debate System (`convex/debates.ts`)

Allows agents to debate decisions and proposals collaboratively.

**Tables:**
- `debates` - Main debate records
  - taskId, topic, status (open/voting/resolved)
  - createdBy, createdAt, resolvedAt, resolution, resolvedBy
  
- `debateEntries` - Individual agent positions
  - debateId, agentSessionKey, position, confidence (0-100)
  - evidence (optional), timestamp, votes

**Functions:**
- `debates:create` - Open a new debate on a task
- `debates:addEntry` - Agent submits/updates their position
- `debates:vote` - Upvote another agent's entry
- `debates:resolve` - Coordinator resolves with final decision
- `debates:list` - List debates (filter by status/taskId)
- `debates:getWithEntries` - Get debate + all entries with agent info

**Usage:**
```typescript
// Start a debate
const debateId = await debates.create({
  taskId: "task_xyz",
  topic: "Should we use Postgres or MongoDB?",
  createdBy: "agent:main:main"
});

// Agent adds position
await debates.addEntry({
  debateId,
  agentSessionKey: "agent:db:specialist",
  position: "Use Postgres for ACID compliance",
  confidence: 85,
  evidence: "https://..."
});

// Resolve
await debates.resolve({
  debateId,
  resolution: "Using Postgres - majority vote",
  resolvedBy: "hendrik"
});
```

---

### 2. Agent Logs System (`convex/agentLogs.ts`)

Comprehensive logging for agent actions and thoughts.

**Table:**
- `agentLogs`
  - agentSessionKey, type (action/thinking/error/heartbeat/self_improve)
  - content, taskId (optional), timestamp, metadata (optional)

**Functions:**
- `agentLogs:create` - Create a log entry
- `agentLogs:listByAgent` - Get logs for specific agent (with limit/type filter)
- `agentLogs:listRecent` - Recent logs across all agents
- `agentLogs:countByAgent` - Count logs for an agent

**Usage:**
```typescript
// Log an action
await agentLogs.create({
  agentSessionKey: "agent:deploy:specialist",
  type: "action",
  content: "Deployed to production",
  taskId: "task_123",
  metadata: { deployId: "d_456", duration: 45 }
});

// Get agent's recent logs
const logs = await agentLogs.listByAgent({
  agentSessionKey: "agent:deploy:specialist",
  limit: 50,
  type: "action"
});
```

---

### 3. Self-Improvement System (`convex/selfImprove.ts`)

Agents can propose improvements to their own behavior, tools, and workflows.

**Table:**
- `improvements`
  - agentSessionKey, type (soul_update/tool_suggestion/workflow_change/bug_report/efficiency)
  - title, description, status (proposed/approved/rejected/implemented)
  - createdAt, reviewedBy, reviewedAt

**Functions:**
- `selfImprove:propose` - Agent proposes an improvement
- `selfImprove:list` - List proposals (filter by status/type)
- `selfImprove:review` - Approve/reject/mark implemented
- `selfImprove:listByAgent` - Agent's proposals
- `selfImprove:get` - Get single improvement

**Usage:**
```typescript
// Agent proposes improvement
const improvementId = await selfImprove.propose({
  agentSessionKey: "agent:content:writer",
  type: "efficiency",
  title: "Batch similar API calls",
  description: "Instead of calling the search API 10 times, batch into 1 call"
});

// Review
await selfImprove.review({
  improvementId,
  status: "approved",
  reviewedBy: "hendrik"
});
```

---

### 4. Model Routing (`convex/modelConfig.ts`)

Dynamic model selection per agent with token budget tracking.

**Table:**
- `modelConfig`
  - agentSessionKey, defaultModel (sonnet/haiku), smartModel (opus/sonnet)
  - useSmartFor (array of task types), maxTokenBudgetDaily (optional)
  - tokensUsedToday, lastReset

**Functions:**
- `modelConfig:get` - Get config for agent (returns defaults if none)
- `modelConfig:update` - Update configuration
- `modelConfig:trackUsage` - Increment token usage (auto-resets daily)
- `modelConfig:resetDaily` - Manual reset for all agents
- `modelConfig:listAll` - List all configs

**Usage:**
```typescript
// Get config
const config = await modelConfig.get({
  agentSessionKey: "agent:research:lead"
});

// Update config
await modelConfig.update({
  agentSessionKey: "agent:research:lead",
  defaultModel: "haiku",
  smartModel: "opus",
  useSmartFor: ["debate", "creative", "strategy", "research"],
  maxTokenBudgetDaily: 1000000
});

// Track usage
await modelConfig.trackUsage({
  agentSessionKey: "agent:research:lead",
  tokensUsed: 5000
});
```

---

### 5. Enhanced Agent Stats (`convex/agents.ts`)

Added `agents:getWithStats` query that returns:
- All agent fields
- `taskCount` - Number of assigned tasks
- `logCount` - Total logs created
- `lastActivity` - Most recent log timestamp (or lastHeartbeat)

**Usage:**
```typescript
const agentWithStats = await agents.getWithStats({
  sessionKey: "agent:main:main"
});

console.log(agentWithStats);
// {
//   ...agent,
//   taskCount: 5,
//   logCount: 342,
//   lastActivity: 1739044800000
// }
```

---

## Schema Updates

All new tables have been added to `convex/schema.ts` with appropriate indexes:

- `debates` - indexed by taskId, status, createdAt
- `debateEntries` - indexed by debateId, agentSessionKey, timestamp
- `agentLogs` - indexed by agentSessionKey, timestamp, compound
- `improvements` - indexed by agentSessionKey, status, createdAt
- `modelConfig` - indexed by agentSessionKey, lastReset

---

## Next Steps

### Integration Ideas:
1. **Dashboard UI** - Visualize debates, logs, improvements
2. **Auto-voting** - Agents automatically vote on high-confidence entries
3. **Smart routing** - Automatically select model based on task type
4. **Budget alerts** - Notify when agent approaches token limit
5. **Learning pipeline** - Approved improvements auto-update agent SOUL.md
6. **Debate notifications** - Alert relevant agents when debate opens

### CLI Commands:
```bash
# View recent agent activity
curl https://your-convex-url/agentLogs/listRecent?limit=20

# Check token usage
curl https://your-convex-url/modelConfig/listAll

# Review pending improvements
curl https://your-convex-url/selfImprove/list?status=proposed
```

---

## Testing

All files compile successfully with Convex TypeScript validation.

To test:
```bash
cd /Users/hendrikdewinne/.openclaw/workspace/mission-control
npx convex dev
```

Then use the Convex dashboard at https://dashboard.convex.dev to:
- Insert test data
- Query functions
- Monitor real-time updates
