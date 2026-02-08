# Mission Control - Component Reference

Visual guide to all UI components created for the multi-agent dashboard.

---

## 🤖 AgentCard

**Location**: `/components/AgentCard.tsx`  
**Used in**: `/app/agents/page.tsx`

```
┌─────────────────────────────────────┐
│                              ● (dot)│
│  🤖  Agent Name                     │
│      Software Engineer              │
│                                     │
│  [active] [specialist]              │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ Current Task                  │ │
│  │ Implement user authentication │ │
│  └───────────────────────────────┘ │
│                                     │
│  Last heartbeat        3 min ago    │
└─────────────────────────────────────┘
```

**Props**:
- `agent.name` - Agent display name
- `agent.emoji` - Agent emoji avatar
- `agent.role` - Agent role/description
- `agent.status` - "idle" | "active" | "blocked"
- `agent.level` - "intern" | "specialist" | "lead"
- `agent.currentTask` - Optional current task string
- `agent.lastHeartbeat` - Timestamp for relative time

**Colors**:
- Status dot: green (active), red (blocked), zinc (idle)
- Status badge: green/red/zinc with 10% opacity bg
- Level badge: purple (lead), blue (specialist), zinc (intern)

---

## 📋 TaskCard

**Location**: `/components/TaskCard.tsx`  
**Used in**: `/app/tasks/page.tsx`

```
┌─────────────────────────────────┐
│ Implement OAuth integration     │
│                                 │
│ [high]                          │
│                                 │
│ [security] [auth] [backend]     │
│                                 │
│ 🤖 👨‍💻 🎯 +2                      │
└─────────────────────────────────┘
```

**Props**:
- `task.title` - Task title (2-line clamp)
- `task.priority` - "low" | "medium" | "high" | "urgent"
- `task.tags` - Array of tag strings (shows first 3)
- `task.assignees` - Array of `{ emoji, name }` (shows first 3)
- `onClick` - Callback when clicked

**Colors**:
- Priority: red (urgent), orange (high), yellow (medium), zinc (low)
- Tags: zinc-800 background, zinc-400 text

**Behavior**:
- Hover: border-zinc-700, bg-zinc-900/50, title → blue-400
- Click: Opens TaskDetail modal

---

## 📄 TaskDetail

**Location**: `/components/TaskDetail.tsx`  
**Used in**: `/app/tasks/page.tsx` (modal)

```
┌────────────────────────────────────────────┐
│ Implement OAuth integration           [×]  │
│ [high] [security] [auth]                   │
├────────────────────────────────────────────┤
│                                            │
│ Description                                │
│ Add OAuth 2.0 authentication for...       │
│                                            │
│ Assignees                                  │
│ ┌──────────────┐ ┌──────────────┐         │
│ │ 🤖 Bot Smith │ │ 👨‍💻 Dev Jane │         │
│ └──────────────┘ └──────────────┘         │
│                                            │
│ Status                                     │
│ [Inbox] [Assigned] [In Progress] [Review]  │
│                                            │
│ Comments                                   │
│ ┌──────────────────────────────────────┐  │
│ │ 🤖 Bot Smith     2h ago              │  │
│ │ Started working on this...           │  │
│ └──────────────────────────────────────┘  │
│                                            │
├────────────────────────────────────────────┤
│ [Add a comment...]              [Send →]   │
└────────────────────────────────────────────┘
```

**Props**:
- `taskId` - Convex task ID
- `onClose` - Callback to close modal

**Features**:
- Fetches task with `api.tasks.getById`
- Fetches comments with `api.messages.listByTask`
- Status buttons update task status
- Comment form adds new message
- Close via X button or backdrop click
- Scrollable content area

---

## 📊 StandupView

**Location**: `/components/StandupView.tsx`  
**Used in**: `/app/standup/page.tsx`

```
┌──────────────────────────────────────────┐
│ 🤖 Bot Smith                             │
├──────────────────────────────────────────┤
│                                          │
│ ✓ Completed (2)                          │
│  • Fix user authentication bug           │
│  • Update API documentation              │
│                                          │
│ → In Progress (1)                        │
│  • Implement OAuth integration           │
│                                          │
│ ✕ Blocked (1)                            │
│  • Deploy to production                  │
│                                          │
│ 💡 Key Decisions (1)                     │
│  • Decided to use Auth0 for OAuth        │
│                                          │
└──────────────────────────────────────────┘
```

**Data**: Fetches from `api.standup.generateStandup`

**Structure**:
```typescript
{
  agentName: string;
  agentEmoji: string;
  completed: string[];    // Task titles
  inProgress: string[];   // Task titles
  blocked: string[];      // Task titles
  decisions: string[];    // Key messages
}[]
```

**Colors**:
- Completed: green badge + green dot
- In Progress: blue badge + blue dot
- Blocked: red badge + red dot
- Decisions: purple badge + purple dot

**Behavior**:
- Agents with no activity are filtered out
- Each section shows count badge
- Empty state if no standup data for today

---

## 📱 Page Layouts

### Agents Page (`/app/agents/page.tsx`)

```
┌─────────────────────────────────────────┐
│ Agents                                  │
│ Overview of all AI agents...            │
│                                         │
│ ┌──────────────┐  ┌──────────────┐     │
│ │ Agent Card 1 │  │ Agent Card 2 │     │
│ └──────────────┘  └──────────────┘     │
│                                         │
│ ┌──────────────┐  ┌──────────────┐     │
│ │ Agent Card 3 │  │ Agent Card 4 │     │
│ └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────┘
```

**Grid**: 2 columns desktop, 1 column mobile

---

### Tasks Page (`/app/tasks/page.tsx`)

```
┌───────────────────────────────────────────────────────────┐
│ Tasks                                                     │
│ Kanban board for tracking...                             │
│                                                           │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │
│ │ Inbox  │ │Assigned│ │In Prog │ │ Review │ │  Done  │ │
│ │   3    │ │   5    │ │   2    │ │   1    │ │   8    │ │
│ ├────────┤ ├────────┤ ├────────┤ ├────────┤ ├────────┤ │
│ │┌──────┐│ │┌──────┐│ │┌──────┐│ │┌──────┐│ │┌──────┐│ │
│ ││Task  ││ ││Task  ││ ││Task  ││ ││Task  ││ ││Task  ││ │
│ │└──────┘│ │└──────┘│ │└──────┘│ │└──────┘│ │└──────┘│ │
│ │        │ │        │ │        │ │        │ │        │ │
│ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ │
└───────────────────────────────────────────────────────────┘
```

**Mobile**: Horizontal scroll with overflow-x-auto

---

### Standup Page (`/app/standup/page.tsx`)

```
┌─────────────────────────────────────────┐
│ Daily Standup                           │
│ Summary of today's progress...          │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ 🤖 Agent 1 Summary                │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ 👨‍💻 Agent 2 Summary                │   │
│ └───────────────────────────────────┘   │
│                                         │
│ ┌───────────────────────────────────┐   │
│ │ 🎯 Agent 3 Summary                │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Vertical stack** of StandupView sections

---

## 🎨 Color Reference

### Status Colors
```typescript
"idle"    → bg-zinc-500/10, text-zinc-500, border-zinc-500/20
"active"  → bg-green-500/10, text-green-500, border-green-500/20
"blocked" → bg-red-500/10, text-red-500, border-red-500/20
```

### Priority Colors
```typescript
"low"     → bg-zinc-500/10, text-zinc-500, border-zinc-500/20
"medium"  → bg-yellow-500/10, text-yellow-500, border-yellow-500/20
"high"    → bg-orange-500/10, text-orange-500, border-orange-500/20
"urgent"  → bg-red-500/10, text-red-500, border-red-500/20
```

### Level Colors
```typescript
"intern"     → bg-zinc-500/10, text-zinc-400, border-zinc-500/20
"specialist" → bg-blue-500/10, text-blue-400, border-blue-500/20
"lead"       → bg-purple-500/10, text-purple-400, border-purple-500/20
```

### Base Colors
- Background: `zinc-950`, `zinc-900`
- Borders: `zinc-800`, `zinc-700` (hover)
- Text: `white`, `zinc-300`, `zinc-400`, `zinc-500`
- Primary: `blue-500`, `blue-400`

---

## 🔧 Utility Functions

### Relative Time Formatting
```typescript
function getRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}
```

### Timestamp Formatting (Comments)
```typescript
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const isToday = date.toDateString() === new Date().toDateString();
  
  if (isToday) {
    return date.toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  }
  return date.toLocaleDateString("en-US", { 
    month: "short", 
    day: "numeric", 
    hour: "2-digit", 
    minute: "2-digit" 
  });
}
```

---

## 📦 Component Dependencies

All components use:
- `"convex/react"` - `useQuery`, `useMutation`
- `"@/convex/_generated/api"` - Convex API
- `"@/components/ui/badge"` - shadcn/ui Badge
- `"@/components/ui/button"` - shadcn/ui Button
- `"@/lib/utils"` - `cn()` for class merging
- `"lucide-react"` - Icons

No external state management needed - Convex handles all real-time updates!

---

## 🎯 Usage Examples

### Agent Card
```tsx
<AgentCard 
  agent={{
    _id: "123",
    name: "Bot Smith",
    emoji: "🤖",
    role: "Software Engineer",
    status: "active",
    currentTask: "Fix auth bug",
    lastHeartbeat: Date.now() - 180000, // 3 min ago
    level: "specialist"
  }}
/>
```

### Task Card
```tsx
<TaskCard
  task={{
    _id: "456",
    title: "Implement OAuth",
    priority: "high",
    assignees: [
      { emoji: "🤖", name: "Bot Smith" },
      { emoji: "👨‍💻", name: "Dev Jane" }
    ],
    tags: ["security", "auth", "backend"],
    status: "in_progress"
  }}
  onClick={() => setSelectedTaskId("456")}
/>
```

### Task Detail
```tsx
<TaskDetail
  taskId={selectedTaskId}
  onClose={() => setSelectedTaskId(null)}
/>
```

### Standup View
```tsx
<StandupView />
// Auto-fetches today's standup data
```

---

All components are fully typed, responsive, and production-ready! 🚀
